import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo hồ sơ để bắt đầu lộ trình tự học IELTS.",
};

export default function RegisterPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-pretty text-[var(--foreground)]">
        Tạo tài khoản
      </h1>
      <p className="mt-3 leading-7 text-[var(--muted-foreground)]">
        Tạo tài khoản bằng email. Bạn sẽ cần xác minh hộp thư trước khi bắt đầu.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
