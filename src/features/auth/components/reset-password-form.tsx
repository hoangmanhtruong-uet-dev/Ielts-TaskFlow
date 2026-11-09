"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/features/auth/action-state";
import { resetPasswordAction } from "@/features/auth/actions";

import { PasswordInput } from "./password-input";
import { AuthSubmitButton } from "./submit-button";

type ResetPasswordField = "password" | "confirmPassword";
const initialState: ActionState<ResetPasswordField> = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
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
          Đổi mật khẩu thành công
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--success)]">
          {state.message}
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  const passwordError = state.fieldErrors?.password?.[0];
  const confirmError = state.fieldErrors?.confirmPassword?.[0];

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
        <PasswordInput
          id="reset-password"
          name="password"
          label="Mật khẩu mới"
          autoComplete="new-password"
          minLength={8}
          error={passwordError}
        />

        <PasswordInput
          id="reset-confirm-password"
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          autoComplete="new-password"
          minLength={8}
          error={confirmError}
        />

        <AuthSubmitButton
          idleLabel="Cập nhật mật khẩu"
          pendingLabel="Đang cập nhật..."
        />
      </form>
    </div>
  );
}
