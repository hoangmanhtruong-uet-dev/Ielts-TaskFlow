export const protectedRoutePrefixes = [
  "/onboarding",
  "/placement-test",
  "/dashboard",
  "/learn",
  "/roadmap",
  "/plans",
  "/progress",
  "/resources",
  "/practice",
  "/dictation",
  "/mock-tests",
  "/mock-test",
  "/error-notebook",
  "/leaderboard",
  "/community",
  "/vocabulary",
  "/ai-studio",
  "/profile",
  "/settings",
  "/admin",
] as const;

export const guestOnlyRoutes = ["/login", "/register"] as const;

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
}

export function isAdminRoute(pathname: string) {
  return matchesPrefix(pathname, "/admin");
}

export function isGuestOnlyRoute(pathname: string) {
  return guestOnlyRoutes.some((route) => pathname === route);
}

export const isAuthRoute = isGuestOnlyRoute;
