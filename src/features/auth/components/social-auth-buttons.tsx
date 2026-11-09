"use client";

import type { Provider } from "@supabase/supabase-js";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SocialAuthButtons({
  consentAccepted = true,
  onRequireConsent,
}: {
  consentAccepted?: boolean;
  onRequireConsent?: () => void;
}) {
  const [consentError, setConsentError] = useState(false);

  const handleLogin = async (provider: Provider) => {
    if (!consentAccepted) {
      setConsentError(true);
      onRequireConsent?.();
      return;
    }
    setConsentError(false);

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?consent=1`,
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        <button
          aria-label="Tiếp tục với Google"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
          type="button"
          onClick={() => handleLogin("google")}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-4 w-4 shrink-0 fill-current"
          >
            <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
          </svg>
          <span>Google</span>
        </button>
        <button
          aria-label="Tiếp tục với Facebook"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
          type="button"
          onClick={() => handleLogin("facebook")}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-4 w-4 shrink-0 fill-current"
          >
            <path d="M27.5 0h-23c-2.485 0-4.5 2.015-4.5 4.5v23c0 2.485 2.015 4.5 4.5 4.5h12.373v-13.88h-3.765v-4.365h3.765v-3.22c0-3.735 2.28-5.768 5.613-5.768 1.595 0 2.966.119 3.366.172v3.901h-2.31c-1.812 0-2.163.861-2.163 2.124v2.791h4.29l-.558 4.365h-3.732v13.88h6.618c2.485 0 4.5-2.015 4.5-4.5v-23c0-2.485-2.015-4.5-4.5-4.5z"></path>
          </svg>
          <span>Facebook</span>
        </button>
        <button
          aria-label="Tiếp tục với GitHub"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
          type="button"
          onClick={() => handleLogin("github")}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-4 w-4 shrink-0 fill-current"
          >
            <path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z"></path>
          </svg>
          <span>GitHub</span>
        </button>
      </div>
      {consentError && !consentAccepted ? (
        <p
          role="alert"
          className="text-center text-xs font-medium text-[var(--destructive)]"
        >
          Vui lòng tích đồng ý Điều khoản sử dụng và Chính sách quyền riêng tư
          trước khi tiếp tục.
        </p>
      ) : null}
    </div>
  );
}
