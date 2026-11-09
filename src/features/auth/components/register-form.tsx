"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/features/auth/action-state";
import { registerAction } from "@/features/auth/actions";

import { PasswordInput } from "./password-input";
import { SocialAuthButtons } from "./social-auth-buttons";
import { AuthSubmitButton } from "./submit-button";

type RegisterField =
  "displayName" | "email" | "password" | "confirmPassword" | "acceptPolicies";

const initialState: ActionState<RegisterField> = { status: "idle" };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const policyCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    firstInvalid?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        className="rounded-2xl border border-[var(--success-soft)] bg-[var(--success-subtle)] p-6 sm:p-8"
        role="status"
      >
        <CircleCheck
          aria-hidden="true"
          className="text-[var(--success)]"
          size={28}
          strokeWidth={1.8}
        />
        <h2 className="mt-5 text-xl font-bold text-[var(--foreground)]">
          Kiểm tra hộp thư của bạn
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--success)]">
          {state.message}
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Tới trang đăng nhập</Link>
        </Button>
      </div>
    );
  }

  const displayNameError = state.fieldErrors?.displayName?.[0];
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];
  const confirmPasswordError = state.fieldErrors?.confirmPassword?.[0];
  const policiesError = state.fieldErrors?.acceptPolicies?.[0];

  return (
    <div className="surface-card p-6 sm:p-8">
      {state.message && state.status === "error" ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[var(--destructive-soft)] bg-[var(--destructive-subtle)] p-3.5 text-sm text-[var(--destructive)]"
        >
          <p className="font-medium">{state.message}</p>
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
        <div className="space-y-2">
          <label
            htmlFor="register-display-name"
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            Họ và tên
          </label>
          <input
            id="register-display-name"
            name="displayName"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
            aria-invalid={Boolean(displayNameError)}
            aria-describedby={
              displayNameError ? "register-display-name-error" : undefined
            }
            className="h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
            placeholder="Nguyễn Minh Anh…"
          />
          {displayNameError ? (
            <p
              id="register-display-name-error"
              className="text-sm text-[var(--destructive)]"
            >
              {displayNameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-email"
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            inputMode="email"
            maxLength={254}
            required
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "register-email-error" : undefined}
            className="h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
            placeholder="ban@example.com…"
          />
          {emailError ? (
            <p
              id="register-email-error"
              className="text-sm text-[var(--destructive)]"
            >
              {emailError}
            </p>
          ) : null}
        </div>

        <PasswordInput
          id="register-password"
          name="password"
          label="Mật khẩu"
          autoComplete="new-password"
          minLength={8}
          error={passwordError}
        />

        <PasswordInput
          id="register-confirm-password"
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          autoComplete="new-password"
          minLength={8}
          error={confirmPasswordError}
        />

        <div className="space-y-2">
          <label
            htmlFor="register-accept-policies"
            className="flex items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]"
          >
            <input
              ref={policyCheckboxRef}
              id="register-accept-policies"
              name="acceptPolicies"
              type="checkbox"
              required
              checked={acceptedPolicies}
              onChange={(event) => setAcceptedPolicies(event.target.checked)}
              aria-invalid={Boolean(policiesError)}
              aria-describedby={
                policiesError ? "register-policies-error" : undefined
              }
              className="mt-1 size-4 shrink-0 rounded border-[var(--border-strong)] accent-[var(--primary)]"
            />
            <span>
              Tôi đã đọc và đồng ý với{" "}
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
            </span>
          </label>
          {policiesError ? (
            <p
              id="register-policies-error"
              className="text-sm text-[var(--destructive)]"
            >
              {policiesError}
            </p>
          ) : null}
        </div>

        <AuthSubmitButton
          idleLabel="Tạo tài khoản"
          pendingLabel="Đang tạo tài khoản..."
        />
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          Hoặc đăng ký nhanh với
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <SocialAuthButtons
        consentAccepted={acceptedPolicies}
        onRequireConsent={() => policyCheckboxRef.current?.focus()}
      />

      <p className="mt-5 text-center text-sm text-[var(--muted-foreground)]">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
