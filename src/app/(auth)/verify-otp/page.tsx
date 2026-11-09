import type { Metadata } from "next";

import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import {
  maskContactIdentifier,
  readOtpContextCookie,
} from "@/lib/auth/otp-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Xác thực mã OTP",
  description: "Nhập mã OTP để hoàn tất.",
};

export default async function VerifyOtpPage() {
  const otpContext = await readOtpContextCookie();
  const maskedTarget = otpContext
    ? maskContactIdentifier(otpContext.identifier)
    : "email/sđt của bạn";
  const channel = otpContext?.channel ?? "email";

  return (
    <div className="flex w-full items-center justify-center">
      <VerifyOtpForm
        maskedIdentifier={maskedTarget}
        channel={channel}
        hasContext={Boolean(otpContext)}
      />
    </div>
  );
}
