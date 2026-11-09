import { z } from "@/lib/validation/zod";

const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email không được dài quá 254 ký tự.")
  .pipe(z.email("Hãy nhập một địa chỉ email hợp lệ."));

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
  .max(72, "Mật khẩu không được dài quá 72 ký tự.");

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Hãy nhập họ và tên.")
      .max(100, "Họ và tên không được dài quá 100 ký tự."),
    email: normalizedEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptPolicies: z.string(),
  })
  .superRefine((value, context) => {
    if (value.acceptPolicies !== "on") {
      context.addIssue({
        code: "custom",
        path: ["acceptPolicies"],
        message:
          "Bạn cần đồng ý Điều khoản sử dụng và Chính sách quyền riêng tư.",
      });
    }
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Mật khẩu xác nhận chưa khớp.",
      });
    }
  });

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z
    .string()
    .min(1, "Hãy nhập mật khẩu.")
    .max(72, "Mật khẩu không được dài quá 72 ký tự."),
  next: z.string().optional(),
});

const phoneIdentifierSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-]{8,20}$/, "Hãy nhập một số điện thoại hợp lệ.");

export const forgotPasswordSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email hoặc số điện thoại."),
    channel: z.enum(["email", "sms", "whatsapp"]).default("email"),
  })
  .superRefine((value, context) => {
    if (value.channel === "email") {
      const emailCheck = normalizedEmailSchema.safeParse(value.identifier);
      if (!emailCheck.success) {
        context.addIssue({
          code: "custom",
          path: ["identifier"],
          message:
            emailCheck.error.issues[0]?.message ??
            "Hãy nhập một địa chỉ email hợp lệ.",
        });
      }
    } else {
      const phoneCheck = phoneIdentifierSchema.safeParse(value.identifier);
      if (!phoneCheck.success) {
        context.addIssue({
          code: "custom",
          path: ["identifier"],
          message:
            phoneCheck.error.issues[0]?.message ??
            "Hãy nhập một số điện thoại hợp lệ.",
        });
      }
    }
  });

export const verifyOtpSchema = z.object({
  identifier: z.string().trim().optional(),
  token: z.string().trim().length(6, "Mã OTP phải gồm 6 chữ số."),
  type: z.enum(["email", "sms", "whatsapp"]).default("email"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Mật khẩu xác nhận chưa khớp.",
      });
    }
  });

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Hãy nhập họ và tên.")
    .max(100, "Họ và tên không được dài quá 100 ký tự."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
