import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ipRateLimit } from "@/lib/rate-limit";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export function getClientIp(request: NextRequest): string {
  const vercelForwarded = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelForwarded) return vercelForwarded;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (forwarded) return forwarded;

  return "unknown-ip";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request);
    const { success, reset } = await ipRateLimit.limit(ip);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too Many Requests" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
