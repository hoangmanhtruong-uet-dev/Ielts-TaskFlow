import { NextResponse, type NextRequest } from "next/server";
import { z } from "@/lib/validation/zod";

import { createApiError, createApiSuccess } from "@/lib/api/errors";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/api/request-id";
import { logServerEvent } from "@/server/observability/logger";

export const dynamic = "force-dynamic";

const clientErrorSchema = z
  .object({
    boundary: z.enum(["route", "global"]),
    digest: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9._:-]+$/)
      .optional(),
  })
  .strict();

export async function POST(request: NextRequest) {
  const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
  const commonHeaders = {
    "Cache-Control": "no-store",
    [REQUEST_ID_HEADER]: requestId,
  };
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return NextResponse.json(
      createApiError("NOT_FOUND", "Route not found.", requestId),
      { status: 404, headers: commonHeaders },
    );
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 1_024) {
    return NextResponse.json(
      createApiError("VALIDATION_ERROR", "Invalid error report.", requestId),
      { status: 400, headers: commonHeaders },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }
  const parsed = clientErrorSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      createApiError("VALIDATION_ERROR", "Invalid error report.", requestId),
      { status: 400, headers: commonHeaders },
    );
  }

  logServerEvent("error", {
    event: "client_boundary.reported",
    requestId,
    route: "/api/internal/client-errors",
    stage: parsed.data.boundary,
    errorCode: "CLIENT_RENDER_ERROR",
    metadata: { digest: parsed.data.digest ?? "unavailable" },
  });

  return NextResponse.json(
    createApiSuccess({ status: "accepted" }, requestId),
    { status: 202, headers: commonHeaders },
  );
}
