import { NextResponse } from "next/server";

import { assertAdminApi } from "@/lib/auth/admin";
import { cmsImportRateLimit } from "@/lib/rate-limit";
import {
  safeFetchExternalJson,
  sanitizeCmsMarkdown,
  sanitizeExternalHttpUrl,
  SsrfValidationError,
} from "@/lib/security/ssrf-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "@/lib/validation/zod";
import { logServerEvent } from "@/server/observability/logger";

const importRequestSchema = z
  .object({
    jobType: z.enum([
      "import_reading_test",
      "import_grammar_exercises",
      "import_vocabulary",
    ]),
    fileUrl: z.string().trim().url().max(2048),
  })
  .strict();

const cmsImportItemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  content: z.string().trim().min(1).max(100_000).optional(),
  passage: z.string().trim().min(1).max(100_000).optional(),
  sourceUrl: z.string().trim().max(2048).optional(),
});

const cmsPayloadSchema = z.union([
  z.array(cmsImportItemSchema).min(1).max(500),
  z.object({
    items: z.array(cmsImportItemSchema).min(1).max(500),
  }),
]);

export async function POST(request: Request) {
  const reqId = request.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const adminCheck = await assertAdminApi();
    if (!adminCheck.ok) {
      return adminCheck.response;
    }

    const { success: rateAllowed } = await cmsImportRateLimit.limit(
      `cms_import_${adminCheck.account.user.id}`,
    );
    if (!rateAllowed) {
      return NextResponse.json(
        { error: "Too many import requests" },
        { status: 429 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const parsed = importRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { jobType, fileUrl } = parsed.data;

    let fetched: { validatedUrl: string; data: unknown };
    try {
      fetched = await safeFetchExternalJson(fileUrl, {
        allowedHosts: process.env.CMS_IMPORT_ALLOWED_HOSTS,
        maxBytes: 2 * 1024 * 1024,
        timeoutMs: 8_000,
      });
    } catch (error) {
      if (error instanceof SsrfValidationError) {
        logServerEvent("warn", {
          event: "cms.import_url_rejected",
          requestId: reqId,
          route: "/api/cms/import",
          stage: "ssrf_guard",
          errorCode: error.code,
        });
        const statusCode =
          error.code === "PAYLOAD_TOO_LARGE"
            ? 413
            : error.code === "FETCH_FAILED"
              ? 502
              : 400;
        return NextResponse.json(
          { error: error.message },
          { status: statusCode },
        );
      }
      throw error;
    }

    const parsedPayload = cmsPayloadSchema.safeParse(fetched.data);
    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: "Remote JSON does not match required CMS import schema",
          details: parsedPayload.error.issues.slice(0, 5),
        },
        { status: 400 },
      );
    }

    const rawItems = Array.isArray(parsedPayload.data)
      ? parsedPayload.data
      : parsedPayload.data.items;

    const sanitizedItems = rawItems.map((item) => ({
      ...item,
      content: item.content ? sanitizeCmsMarkdown(item.content) : undefined,
      passage: item.passage ? sanitizeCmsMarkdown(item.passage) : undefined,
      sourceUrl: sanitizeExternalHttpUrl(item.sourceUrl) ?? undefined,
    }));

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: job, error: insertError } = await supabaseAdmin
      .from("bulk_import_jobs")
      .insert({
        author_id: adminCheck.account.user.id,
        job_type: jobType,
        file_url: fetched.validatedUrl,
        total_records: sanitizedItems.length,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      logServerEvent("error", {
        event: "cms.import_job_creation_failed",
        requestId: reqId,
        route: "/api/cms/import",
        stage: "db_insert",
        errorCode: insertError.code ?? "DB_INSERT_ERROR",
      });
      return NextResponse.json(
        { error: "Failed to create import job" },
        { status: 500 },
      );
    }

    logServerEvent("info", {
      event: "cms.import_job_created",
      requestId: reqId,
      route: "/api/cms/import",
      stage: "start",
      metadata: {
        jobId: job.id,
        jobType,
        recordCount: sanitizedItems.length,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      recordCount: sanitizedItems.length,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "cms.import_job_crash",
      requestId: reqId,
      route: "/api/cms/import",
      stage: "handler",
      errorCode: "INTERNAL_ERROR",
      error,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
