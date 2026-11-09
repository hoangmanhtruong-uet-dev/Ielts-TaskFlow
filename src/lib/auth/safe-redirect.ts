import { isProtectedRoute } from "@/lib/auth/routes";

const FALLBACK_PATH = "/dashboard";
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const SAFE_RELATIVE_PATH_PATTERN = /^\/(?![/\\])/;

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = FALLBACK_PATH,
) {
  if (!value) return fallback;

  const candidate = value.trim();
  if (
    !SAFE_RELATIVE_PATH_PATTERN.test(candidate) ||
    candidate.includes("\\") ||
    candidate.includes("@") ||
    CONTROL_CHARACTER_PATTERN.test(candidate)
  ) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(candidate);
    if (
      !SAFE_RELATIVE_PATH_PATTERN.test(decoded) ||
      decoded.includes("\\") ||
      decoded.includes("@") ||
      CONTROL_CHARACTER_PATTERN.test(decoded)
    ) {
      return fallback;
    }

    const parsed = new URL(candidate, "https://indigoscholar.invalid");
    if (parsed.origin !== "https://indigoscholar.invalid") return fallback;
    if (parsed.username || parsed.password) return fallback;
    if (!isProtectedRoute(parsed.pathname)) return fallback;

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export const sanitizeNextPath = getSafeRedirectPath;
