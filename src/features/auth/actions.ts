"use server";

import { redirect } from "next/navigation";

import {
  clearOtpContextCookie,
  readOtpContextCookie,
  setOtpContextCookie,
} from "@/lib/auth/otp-context";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logServerEvent } from "@/server/observability/logger";
import { getServerRequestId } from "@/server/observability/request-context";

import type { ActionState } from "./action-state";
import { mapAuthError } from "./errors";
import { PRIVACY_VERSION, TERMS_VERSION } from "./policies";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./schemas";

type LoginField = "email" | "password";
type RegisterField =
  "displayName" | "email" | "password" | "confirmPassword" | "acceptPolicies";
type ForgotPasswordField = "identifier" | "channel";
type VerifyOtpField = "identifier" | "token" | "type";
type ResetPasswordField = "password" | "confirmPassword";

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function registerAction(
  _previousState: ActionState<RegisterField>,
  formData: FormData,
): Promise<ActionState<RegisterField>> {
  const requestId = await getServerRequestId();
  const result = registerSchema.safeParse({
    displayName: valueOf(formData, "displayName"),
    email: valueOf(formData, "email"),
    password: valueOf(formData, "password"),
    confirmPassword: valueOf(formData, "confirmPassword"),
    acceptPolicies: valueOf(formData, "acceptPolicies"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Hãy kiểm tra lại các trường được đánh dấu.",
      fieldErrors: result.error.flatten().fieldErrors,
      requestId,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          display_name: result.data.displayName,
          terms_version: TERMS_VERSION,
          privacy_version: PRIVACY_VERSION,
          policies_accepted_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      logServerEvent("warn", {
        event: "auth.register.rejected",
        requestId,
        route: "registerAction",
        stage: "supabase sign up",
        errorCode: error.code ?? "AUTH_PROVIDER_ERROR",
      });
      return {
        status: "error",
        message: mapAuthError(error),
        requestId,
      };
    }

    if (data?.session) {
      try {
        await supabase.rpc("accept_current_policies", {
          p_terms_version: TERMS_VERSION,
          p_privacy_version: PRIVACY_VERSION,
          p_channel: "email_signup",
        });
      } catch {
        // Policy acceptance is also enforced at onboarding if needed.
      }
    }

    return {
      status: "success",
      message:
        "Yêu cầu đăng ký đã được ghi nhận. Hãy kiểm tra email để xác minh tài khoản trước khi tiếp tục.",
      requestId,
    };
  } catch (error) {
    logServerEvent("error", {
      event: "auth.register.failed",
      requestId,
      route: "registerAction",
      stage: "supabase sign up",
      errorCode: "AUTH_UNEXPECTED_ERROR",
      error,
    });
    return {
      status: "error",
      message: mapAuthError(undefined),
      requestId,
    };
  }
}

export async function loginAction(
  _previousState: ActionState<LoginField>,
  formData: FormData,
): Promise<ActionState<LoginField>> {
  const requestId = await getServerRequestId();
  const result = loginSchema.safeParse({
    email: valueOf(formData, "email"),
    password: valueOf(formData, "password"),
    next: valueOf(formData, "next"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Hãy kiểm tra lại các trường được đánh dấu.",
      fieldErrors: result.error.flatten().fieldErrors,
      requestId,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      logServerEvent("warn", {
        event: "auth.login.rejected",
        requestId,
        route: "loginAction",
        stage: "supabase sign in",
        errorCode: error.code ?? "AUTH_PROVIDER_ERROR",
      });
      return {
        status: "error",
        message: mapAuthError(error),
        requestId,
      };
    }

    if (data?.user?.user_metadata?.terms_version) {
      try {
        await supabase.rpc("accept_current_policies", {
          p_terms_version: TERMS_VERSION,
          p_privacy_version: PRIVACY_VERSION,
          p_channel: "email_signup",
        });
      } catch {
        // Non-fatal
      }
    }
  } catch (error) {
    logServerEvent("error", {
      event: "auth.login.failed",
      requestId,
      route: "loginAction",
      stage: "supabase sign in",
      errorCode: "AUTH_UNEXPECTED_ERROR",
      error,
    });
    return {
      status: "error",
      message: mapAuthError(undefined),
      requestId,
    };
  }

  redirect(getSafeRedirectPath(result.data.next));
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}

export async function forgotPasswordAction(
  _previousState: ActionState<ForgotPasswordField>,
  formData: FormData,
): Promise<ActionState<ForgotPasswordField>> {
  const requestId = await getServerRequestId();
  const result = forgotPasswordSchema.safeParse({
    identifier: valueOf(formData, "identifier"),
    channel: valueOf(formData, "channel"),
  });
  if (!result.success) {
    return {
      status: "error",
      message: "Hãy kiểm tra lại thông tin cung cấp.",
      fieldErrors: result.error.flatten().fieldErrors,
      requestId,
    };
  }

  const { identifier, channel } = result.data;
  const isEmail = channel === "email" || identifier.includes("@");
  const normalizedIdentifier = isEmail ? identifier.toLowerCase() : identifier;

  try {
    const supabase = await createSupabaseServerClient();
    let error;

    if (isEmail) {
      const res = await supabase.auth.signInWithOtp({
        email: normalizedIdentifier,
        options: {
          shouldCreateUser: false,
        },
      });
      error = res.error;
    } else {
      const res = await supabase.auth.signInWithOtp({
        phone: normalizedIdentifier,
        options: {
          channel: channel === "whatsapp" ? "whatsapp" : "sms",
          shouldCreateUser: false,
        },
      });
      error = res.error;
    }

    if (error) {
      logServerEvent("warn", {
        event: "auth.password_recovery.request_rejected",
        requestId,
        route: "forgotPasswordAction",
        stage: "request recovery otp",
        errorCode: error.code ?? "AUTH_PROVIDER_ERROR",
      });
    }
  } catch (error) {
    logServerEvent("error", {
      event: "auth.password_recovery.request_failed",
      requestId,
      route: "forgotPasswordAction",
      stage: "request recovery otp",
      errorCode: "AUTH_UNEXPECTED_ERROR",
      error,
    });
  }

  const actualChannel = isEmail
    ? "email"
    : channel === "whatsapp"
      ? "whatsapp"
      : "sms";

  await setOtpContextCookie({
    identifier: normalizedIdentifier,
    channel: actualChannel,
  });

  redirect("/verify-otp");
}

export async function verifyOtpAction(
  _previousState: ActionState<VerifyOtpField>,
  formData: FormData,
): Promise<ActionState<VerifyOtpField>> {
  const requestId = await getServerRequestId();
  const result = verifyOtpSchema.safeParse({
    identifier: valueOf(formData, "identifier") || undefined,
    token: valueOf(formData, "token"),
    type: valueOf(formData, "type") || undefined,
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Mã OTP không hợp lệ.",
      fieldErrors: result.error.flatten().fieldErrors,
      requestId,
    };
  }

  const otpCookie = await readOtpContextCookie();
  const resolvedIdentifier =
    otpCookie?.identifier || result.data.identifier?.trim() || "";
  const resolvedChannel = otpCookie?.channel || result.data.type;

  if (!resolvedIdentifier) {
    return {
      status: "error",
      message:
        "Phiên xác thực OTP đã hết hạn. Vui lòng quay lại trang Quên mật khẩu để gửi lại mã.",
      requestId,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { token } = result.data;

    const params =
      resolvedChannel === "email"
        ? { email: resolvedIdentifier, token, type: "email" as const }
        : { phone: resolvedIdentifier, token, type: "sms" as const };

    const { error } = await supabase.auth.verifyOtp(params);

    if (error) {
      logServerEvent("warn", {
        event: "auth.verify_otp.rejected",
        requestId,
        route: "verifyOtpAction",
        stage: "verify otp",
        errorCode: error.code ?? "AUTH_PROVIDER_ERROR",
      });
      return {
        status: "error",
        message: "Mã OTP không đúng hoặc đã hết hạn.",
        requestId,
      };
    }

    await clearOtpContextCookie();
  } catch (error) {
    logServerEvent("error", {
      event: "auth.verify_otp.failed",
      requestId,
      route: "verifyOtpAction",
      stage: "verify otp",
      errorCode: "AUTH_UNEXPECTED_ERROR",
      error,
    });
    return {
      status: "error",
      message: "Đã có lỗi xảy ra. Hãy thử lại.",
      requestId,
    };
  }

  return {
    status: "success",
    message: "Xác thực thành công!",
    requestId,
  };
}

export async function resetPasswordAction(
  _previousState: ActionState<ResetPasswordField>,
  formData: FormData,
): Promise<ActionState<ResetPasswordField>> {
  const requestId = await getServerRequestId();
  const result = resetPasswordSchema.safeParse({
    password: valueOf(formData, "password"),
    confirmPassword: valueOf(formData, "confirmPassword"),
  });
  if (!result.success) {
    return {
      status: "error",
      message: "Hãy kiểm tra lại mật khẩu mới.",
      fieldErrors: result.error.flatten().fieldErrors,
      requestId,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return {
        status: "error",
        message:
          "Liên kết khôi phục không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới.",
        requestId,
      };
    }
    const { error } = await supabase.auth.updateUser({
      password: result.data.password,
    });
    if (error) {
      logServerEvent("warn", {
        event: "auth.password_recovery.update_rejected",
        requestId,
        route: "resetPasswordAction",
        stage: "update password",
        errorCode: error.code ?? "AUTH_PROVIDER_ERROR",
      });
      return {
        status: "error",
        message:
          "Không thể cập nhật mật khẩu. Hãy yêu cầu liên kết khôi phục mới.",
        requestId,
      };
    }
    await supabase.auth.signOut({ scope: "local" });
    return {
      status: "success",
      message: "Mật khẩu đã được cập nhật. Hãy đăng nhập lại.",
      requestId,
    };
  } catch (error) {
    logServerEvent("error", {
      event: "auth.password_recovery.update_failed",
      requestId,
      route: "resetPasswordAction",
      stage: "update password",
      errorCode: "AUTH_UNEXPECTED_ERROR",
      error,
    });
    return {
      status: "error",
      message:
        "Không thể cập nhật mật khẩu. Hãy yêu cầu liên kết khôi phục mới.",
      requestId,
    };
  }
}
