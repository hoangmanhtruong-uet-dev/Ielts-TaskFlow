"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  deleteAccountAction,
  type DeleteAccountActionState,
} from "@/features/profile/delete-account-action";

const initialState: DeleteAccountActionState = { status: "idle" };

function DeleteSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-50"
    >
      <Trash2 size={16} aria-hidden="true" />
      {pending ? "Đang xóa tài khoản…" : "Xóa tài khoản vĩnh viễn"}
    </Button>
  );
}

export function DeleteAccountCard({ email }: { email: string }) {
  const [state, action] = useActionState(deleteAccountAction, initialState);
  const [confirmText, setConfirmText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const normalizedConfirm = confirmText
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
  const readyToDelete = normalizedConfirm === "XOA TAI KHOAN" && acknowledged;

  return (
    <section
      id="account-deletion"
      aria-labelledby="account-deletion-heading"
      className="rounded-3xl border border-[#fecaca] bg-[#fef2f2] p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fee2e2] text-[#dc2626]">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <div>
          <h2
            id="account-deletion-heading"
            className="text-lg font-bold text-[#991b1b]"
          >
            Xóa tài khoản &amp; Toàn bộ dữ liệu (Nghị định 13/2023/NĐ-CP)
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#7f1d1d]">
            Hành động này sẽ xóa vĩnh viễn tài khoản <strong>{email}</strong>,
            tiến độ học tập, bài làm, từ vựng đã lưu và toàn bộ tệp ghi âm
            Speaking trên Cloudflare R2 và máy chủ lưu trữ. Dữ liệu sau khi xóa
            không thể khôi phục.
          </p>
        </div>
      </div>

      <form action={action} className="mt-6 space-y-4" noValidate>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#fecaca] bg-white p-3.5 text-sm text-[#7f1d1d]">
          <input
            type="checkbox"
            name="acknowledge"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-1 size-4 accent-[#dc2626]"
          />
          <span>
            Tôi hiểu toàn bộ lịch sử học, bài luận và các bản ghi âm Speaking sẽ
            bị xóa vĩnh viễn và không thể hoàn tác.
          </span>
        </label>

        <div>
          <label
            htmlFor="delete-account-confirm"
            className="block text-sm font-semibold text-[#991b1b]"
          >
            Nhập{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-[#dc2626]">
              XOA TAI KHOAN
            </code>{" "}
            để xác nhận
          </label>
          <input
            id="delete-account-confirm"
            name="confirmText"
            type="text"
            autoComplete="off"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="XOA TAI KHOAN"
            className="mt-2 h-11 w-full max-w-md rounded-lg border border-[#fca5a5] bg-white px-3 text-sm text-[var(--foreground)] focus-visible:border-[#dc2626] focus-visible:ring-2 focus-visible:ring-[#fecaca] focus-visible:outline-none"
          />
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p
              role="alert"
              className="rounded-lg border border-[#fca5a5] bg-white p-3 text-sm text-[#b91c1c]"
            >
              {state.message}
              {state.requestId ? (
                <span className="mt-1 block text-xs">
                  Mã yêu cầu: {state.requestId}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        <DeleteSubmitButton disabled={!readyToDelete} />
      </form>
    </section>
  );
}
