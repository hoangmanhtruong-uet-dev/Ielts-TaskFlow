import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Khôi phục mật khẩu",
  description: "Yêu cầu liên kết đặt lại mật khẩu.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ recoveryError?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-pretty text-[var(--foreground)]">
        Khôi phục mật khẩu
      </h1>
      <p className="mt-3 leading-7 text-[var(--muted-foreground)]">
        Chọn phương thức nhận mã OTP. Phản hồi luôn giống nhau để bảo vệ thông
        tin tài khoản.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm
          invalidLink={params.recoveryError === "invalid_or_expired"}
        />
      </div>
    </div>
  );
}
