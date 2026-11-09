"use client";

import { Mail, MessageCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import type { ActionState } from "@/features/auth/action-state";
import { forgotPasswordAction } from "@/features/auth/actions";

import { AuthSubmitButton } from "./submit-button";

type ForgotPasswordField = "identifier" | "channel";
const initialState: ActionState<ForgotPasswordField> = { status: "idle" };

export function ForgotPasswordForm({ invalidLink = false }) {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [method, setMethod] = useState<"email" | "sms" | "whatsapp">("email");

  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  const identifierError = state.fieldErrors?.identifier?.[0];

  return (
    <div className="surface-card p-6 sm:p-8">
      {invalidLink ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-[var(--destructive-soft)] bg-[var(--destructive-subtle)] p-3.5 text-sm font-medium text-[var(--destructive)]"
        >
          Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu mã mới.
        </p>
      ) : null}

      <form ref={formRef} action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="channel" value={method} />

        <div
          role="group"
          aria-label="Chọn kênh nhận mã OTP"
          className="grid grid-cols-3 gap-2.5"
        >
          <button
            type="button"
            aria-pressed={method === "email"}
            onClick={() => setMethod("email")}
            className={`flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
              method === "email"
                ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]"
                : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Mail aria-hidden="true" size={18} />
            <span>Email</span>
          </button>
          <button
            type="button"
            aria-pressed={method === "sms"}
            onClick={() => setMethod("sms")}
            className={`flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
              method === "sms"
                ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]"
                : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Smartphone aria-hidden="true" size={18} />
            <span>SMS</span>
          </button>
          <button
            type="button"
            aria-pressed={method === "whatsapp"}
            onClick={() => setMethod("whatsapp")}
            className={`flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
              method === "whatsapp"
                ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]"
                : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <MessageCircle aria-hidden="true" size={18} />
            <span>WhatsApp</span>
          </button>
        </div>

        {method === "email" ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="recovery-identifier"
                className="block text-sm font-semibold text-[var(--foreground)]"
              >
                Email
              </label>
              <input
                id="recovery-identifier"
                name="identifier"
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                required
                maxLength={254}
                aria-invalid={Boolean(identifierError)}
                aria-describedby={
                  identifierError ? "recovery-identifier-error" : undefined
                }
                placeholder="ban@example.com…"
                className="h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              />
              {identifierError ? (
                <p
                  id="recovery-identifier-error"
                  className="text-sm text-[var(--destructive)]"
                >
                  {identifierError}
                </p>
              ) : null}
            </div>

            {state.message ? (
              <p
                role={state.status === "error" ? "alert" : "status"}
                className={`rounded-xl border p-3.5 text-sm font-medium ${
                  state.status === "error"
                    ? "border-[var(--destructive-soft)] bg-[var(--destructive-subtle)] text-[var(--destructive)]"
                    : "border-[var(--success-soft)] bg-[var(--success-subtle)] text-[var(--success)]"
                }`}
              >
                {state.message}
              </p>
            ) : null}

            <AuthSubmitButton
              idleLabel="Nhận mã OTP"
              pendingLabel="Đang gửi OTP..."
            />
          </>
        ) : (
          <div className="rounded-xl border border-[var(--primary-soft)] bg-[var(--primary-subtle)] p-4 text-center text-sm leading-6 text-[var(--foreground)]">
            Tính năng khôi phục qua {method === "sms" ? "SMS" : "WhatsApp"} hiện
            đang trong quá trình hoàn thiện. Vui lòng sử dụng kênh Email để nhận
            mã OTP.
          </div>
        )}
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-[var(--primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
