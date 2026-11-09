"use client";

import Link from "next/link";

import {
  setCookieConsent,
  useCookieConsent,
} from "@/components/shared/cookie-consent";

export function CookieConsentBanner() {
  const consent = useCookieConsent();

  if (consent !== "unset") {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Thông báo tùy chọn cookie"
      className="mx-auto my-4 w-[min(42rem,calc(100%-1.5rem))] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-3.5 shadow-sm sm:my-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          Indigo Scholar sử dụng cookie thiết yếu cho phiên đăng nhập và chỉ
          kích hoạt widget hỗ trợ khi bạn đồng ý cookie chức năng.{" "}
          <Link
            href="/privacy"
            className="font-semibold text-[var(--primary)] underline underline-offset-2"
          >
            Xem Chính sách quyền riêng tư
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCookieConsent("necessary")}
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            Chỉ cần thiết
          </button>
          <button
            type="button"
            onClick={() => setCookieConsent("accepted")}
            className="rounded-xl bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Đồng ý tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
