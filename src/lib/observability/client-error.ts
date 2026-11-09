type BoundaryKind = "route" | "global";

export async function reportClientBoundaryError(
  error: Error & { digest?: string },
  boundary: BoundaryKind,
) {
  const digest = error.digest?.trim();
  const response = await fetch("/api/internal/client-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boundary, ...(digest ? { digest } : {}) }),
    cache: "no-store",
    keepalive: true,
  });
  if (!response.ok) return undefined;
  const body: unknown = await response.json();
  if (
    body &&
    typeof body === "object" &&
    "requestId" in body &&
    typeof body.requestId === "string"
  ) {
    return body.requestId;
  }
  return undefined;
}
