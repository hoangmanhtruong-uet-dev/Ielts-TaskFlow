import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Đặt mật khẩu mới từ liên kết khôi phục hợp lệ.",
};

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const validRecoverySession = !error && Boolean(data.user);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-pretty text-[var(--foreground)]">
        Đặt lại mật khẩu
      </h1>
      <p className="mt-3 leading-7 text-[var(--muted-foreground)]">
        Chọn mật khẩu mới có ít nhất 8 ký tự để bảo vệ tài khoản của bạn.
      </p>
      <div className="mt-8">
        {validRecoverySession ? (
          <ResetPasswordForm />
        ) : (
          <div className="surface-card p-6 text-center sm:p-8" role="alert">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--destructive-subtle)] text-[var(--destructive)]">
              <AlertTriangle aria-hidden="true" className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Liên kết không hợp lệ
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Liên kết khôi phục không hợp lệ hoặc đã hết hạn.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/forgot-password">Yêu cầu liên kết mới</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
