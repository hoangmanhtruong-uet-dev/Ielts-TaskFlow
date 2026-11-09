"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import type { ActionState } from "@/features/auth/action-state";
import { loginAction } from "@/features/auth/actions";

import { PasswordInput } from "./password-input";
import { SocialAuthButtons } from "./social-auth-buttons";
import { AuthSubmitButton } from "./submit-button";

type LoginField = "email" | "password";
const initialState: ActionState<LoginField> = { status: "idle" };

export function LoginForm({
  next,
  initialMessage,
}: {
  next?: string;
  initialMessage?: string;
}) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    firstInvalid?.focus();
  }, [state]);

  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];
  const bannerMessage = state.message ?? initialMessage;

  return (
    <div className="surface-card p-6 sm:p-8">
      {bannerMessage ? (
        <div
          role={
            state.status === "error" ||
            Boolean(initialMessage && !state.message)
              ? "alert"
              : "status"
          }
          className={`mb-5 rounded-xl border p-3.5 text-sm ${
            state.status === "success"
              ? "border-[var(--success-soft)] bg-[var(--success-subtle)] text-[var(--success)]"
              : "border-[var(--destructive-soft)] bg-[var(--destructive-subtle)] text-[var(--destructive)]"
          }`}
        >
          <p className="font-medium">{bannerMessage}</p>
          {state.requestId ? (
            <span
              data-testid="request-id"
              className="mt-1 block text-xs font-medium opacity-80"
            >
              Mã yêu cầu: {state.requestId}
            </span>
          ) : null}
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next ?? ""} />

        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            inputMode="email"
            maxLength={254}
            required
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "login-email-error" : undefined}
            className="h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
            placeholder="ban@example.com…"
          />
          {emailError ? (
            <p
              id="login-email-error"
              className="text-sm text-[var(--destructive)]"
            >
              {emailError}
            </p>
          ) : null}
        </div>

        <PasswordInput
          id="login-password"
          name="password"
          label="Mật khẩu"
          autoComplete="current-password"
          error={passwordError}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[var(--primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <AuthSubmitButton
          idleLabel="Đăng nhập"
          pendingLabel="Đang đăng nhập..."
        />
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          Hoặc tiếp tục với
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <SocialAuthButtons />

      <p className="mt-5 text-center text-xs leading-5 text-[var(--muted-foreground)]">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <Link
          href="/terms"
          className="font-semibold text-[var(--primary)] underline underline-offset-2"
        >
          Điều khoản sử dụng
        </Link>{" "}
        và{" "}
        <Link
          href="/privacy"
          className="font-semibold text-[var(--primary)] underline underline-offset-2"
        >
          Chính sách quyền riêng tư
        </Link>
        .
      </p>

      <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
