import { NextResponse } from "next/server";

import { PRIVACY_VERSION, TERMS_VERSION } from "@/features/auth/policies";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const safeNext = getSafeRedirectPath(searchParams.get("next"));
  const consentGranted = searchParams.get("consent") === "1";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (consentGranted) {
        try {
          await supabase.rpc("accept_current_policies", {
            p_terms_version: TERMS_VERSION,
            p_privacy_version: PRIVACY_VERSION,
            p_channel: "oauth",
          });
        } catch {
          // Non-fatal here; onboarding also enforces recorded policy acceptance.
        }
      }
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?authError=auth_provider_error`);
}
