import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import {
  isAdminRoute,
  isGuestOnlyRoute,
  isProtectedRoute,
} from "@/lib/auth/routes";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import type { Database } from "@/types/database";

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  search: string,
  hadAuthCookie: boolean,
) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "next",
    getSafeRedirectPath(`${pathname}${search}`),
  );
  if (hadAuthCookie) {
    loginUrl.searchParams.set("authError", "session_expired");
  }
  return NextResponse.redirect(loginUrl);
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname, search } = request.nextUrl;
  const hadAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));

  let isAuthenticated = false;
  try {
    const env = getPublicEnv();
    const supabase = createServerClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );

            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
            Object.entries(headers).forEach(([name, value]) =>
              response.headers.set(name, value),
            );
          },
        },
      },
    );

    const { data } = await supabase.auth.getClaims();
    isAuthenticated = Boolean(data?.claims?.sub);
  } catch {
    // Fail-closed: unverified session or missing env must never bypass protected routes.
    isAuthenticated = false;
    if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
      return redirectToLogin(request, pathname, search, hadAuthCookie);
    }
    return response;
  }

  if (
    !isAuthenticated &&
    (isProtectedRoute(pathname) || isAdminRoute(pathname))
  ) {
    return redirectToLogin(request, pathname, search, hadAuthCookie);
  }

  if (isAuthenticated && isGuestOnlyRoute(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
