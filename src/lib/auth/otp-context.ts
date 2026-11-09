import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const OTP_CONTEXT_COOKIE = "indigoscholar_otp_ctx";
const OTP_CONTEXT_MAX_AGE_SECONDS = 600;

export type OtpContext = {
  identifier: string;
  channel: "email" | "sms" | "whatsapp";
  issuedAt: number;
};

function getOtpSigningKey(): string | null {
  const secret =
    process.env.SPEAKING_PIPELINE_SIGNING_SECRET?.trim() ||
    process.env.STORAGE_CLEANUP_SECRET?.trim() ||
    process.env.BILLING_WEBHOOK_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      "local-dev-otp-cookie-key"
    );
  }
  return null;
}

function signPayload(encoded: string, key: string): string {
  return createHmac("sha256", key).update(encoded).digest("base64url");
}

export function maskContactIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (!trimmed) return "email/sđt của bạn";

  if (trimmed.includes("@")) {
    const [localPart, domain] = trimmed.split("@");
    if (!domain) return "***";
    const visible = localPart.slice(0, Math.min(2, localPart.length));
    return `${visible}***@${domain}`;
  }

  const digits = trimmed.replace(/\s+/g, "");
  if (digits.length <= 4) return "****";
  return `${"*".repeat(Math.max(3, digits.length - 4))}${digits.slice(-4)}`;
}

export async function setOtpContextCookie(context: {
  identifier: string;
  channel: "email" | "sms" | "whatsapp";
}): Promise<void> {
  const payload: OtpContext = {
    identifier: context.identifier.trim(),
    channel: context.channel,
    issuedAt: Date.now(),
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const key = getOtpSigningKey();
  if (!key) return;
  const value = `${encoded}.${signPayload(encoded, key)}`;

  try {
    const store = await cookies();
    store.set(OTP_CONTEXT_COOKIE, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: OTP_CONTEXT_MAX_AGE_SECONDS,
    });
  } catch {
    // Outside Next.js request context (e.g. unit test harness).
  }
}

export async function readOtpContextCookie(): Promise<OtpContext | null> {
  try {
    const store = await cookies();
    const raw = store.get(OTP_CONTEXT_COOKIE)?.value;
    if (!raw) return null;

    const parts = raw.split(".");
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const key = getOtpSigningKey();
    if (!key) return null;

    const expectedSig = signPayload(encoded, key);
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<OtpContext>;

    if (
      typeof parsed.identifier !== "string" ||
      !parsed.identifier ||
      (parsed.channel !== "email" &&
        parsed.channel !== "sms" &&
        parsed.channel !== "whatsapp") ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.issuedAt > OTP_CONTEXT_MAX_AGE_SECONDS * 1000) {
      return null;
    }

    return parsed as OtpContext;
  } catch {
    return null;
  }
}

export async function clearOtpContextCookie(): Promise<void> {
  try {
    const store = await cookies();
    store.delete(OTP_CONTEXT_COOKIE);
  } catch {
    // Outside Next.js request context.
  }
}
