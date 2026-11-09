import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import {
  createApiError,
  createApiSuccess,
  createRequestId,
} from "@/lib/api/errors";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/api/request-id";
import { getServerEnv } from "@/lib/env";
import { deleteR2Objects } from "@/lib/r2";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logServerEvent } from "@/server/observability/logger";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 100;

export async function GET(request: NextRequest) {
  return runCleanup(request);
}

export async function POST(request: NextRequest) {
  return runCleanup(request);
}

async function runCleanup(request: NextRequest) {
  const requestId = resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
  const runId = createRequestId();
  const batchId = createRequestId();
  let stage = "authenticate";
  const metrics = {
    claimedCount: 0,
    deletedCount: 0,
    finalizedCount: 0,
    retryCount: null as number | null,
  };

  try {
    if (
      !isAuthorized(request.headers.get("authorization"), [
        process.env.STORAGE_CLEANUP_SECRET,
        process.env.CRON_SECRET,
      ])
    ) {
      logServerEvent("warn", {
        event: "storage_cleanup.rejected",
        requestId,
        runId,
        batchId,
        route: "/api/internal/storage-cleanup",
        stage,
        errorCode: "UNAUTHORIZED",
        metadata: metrics,
      });
      return responseError("NOT_FOUND", "Route not found.", requestId, 404);
    }

    stage = "validate configuration";
    getServerEnv();

    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();
    stage = "acquire lease";
    const [expireIntentsResult, assetsResult] = await Promise.all([
      admin
        .from("speaking_upload_intents")
        .update({ status: "expired" })
        .eq("status", "issued")
        .lte("expires_at", now)
        .select("id"),
      admin.rpc("claim_speaking_audio_cleanup", {
        p_batch_size: BATCH_SIZE,
      }),
    ]);

    if (expireIntentsResult.error || assetsResult.error)
      throw new Error("cleanup_query_failed");
    stage = "claim records";
    const claimedAssets = (assetsResult.data ?? []) as Array<{
      id: string;
      bucket_id?: string;
      storage_path: string;
    }>;

    const intentsResult = await admin
      .from("speaking_upload_intents")
      .select("id, storage_path")
      .eq("status", "expired")
      .is("storage_deleted_at", null)
      .order("expires_at")
      .limit(BATCH_SIZE);
    if (intentsResult.error) throw new Error("cleanup_query_failed");
    const expiredIntents = intentsResult.data ?? [];
    metrics.claimedCount = claimedAssets.length + expiredIntents.length;

    const supabaseAssets = claimedAssets.filter(
      (asset) =>
        (asset.bucket_id ?? "speaking-recordings") === "speaking-recordings",
    );
    const r2Assets = claimedAssets.filter(
      (asset) => asset.bucket_id === "cloudflare-r2",
    );

    const supabasePaths = [
      ...new Set(
        [...expiredIntents, ...supabaseAssets].map((row) => row.storage_path),
      ),
    ];

    stage = "delete storage objects";
    let supabaseDeleteSucceeded = true;
    if (supabasePaths.length > 0) {
      const { error } = await admin.storage
        .from("speaking-recordings")
        .remove(supabasePaths);
      if (error) {
        supabaseDeleteSucceeded = false;
      }
    }

    let deletedR2Keys = new Set<string>();
    let r2DeleteHadFailures = false;
    if (r2Assets.length > 0) {
      const { deletedKeys, failedKeys } = await deleteR2Objects(
        r2Assets.map((asset) => asset.storage_path),
      );
      deletedR2Keys = new Set(deletedKeys);
      r2DeleteHadFailures = failedKeys.length > 0;
    }

    const succeededIntents = supabaseDeleteSucceeded ? expiredIntents : [];
    const succeededAssetIds = [
      ...(supabaseDeleteSucceeded
        ? supabaseAssets.map((asset) => asset.id)
        : []),
      ...r2Assets
        .filter((asset) => deletedR2Keys.has(asset.storage_path))
        .map((asset) => asset.id),
    ];

    metrics.deletedCount =
      (supabaseDeleteSucceeded ? supabasePaths.length : 0) + deletedR2Keys.size;

    stage = "finalize database records";
    const [intentUpdate, assetUpdate] = await Promise.all([
      succeededIntents.length > 0
        ? admin
            .from("speaking_upload_intents")
            .update({ storage_deleted_at: now })
            .in(
              "id",
              succeededIntents.map((row) => row.id),
            )
        : Promise.resolve({ error: null }),
      succeededAssetIds.length > 0
        ? admin
            .from("speaking_audio_assets")
            .update({
              status: "deleted",
              deleted_at: now,
              cleanup_started_at: null,
            })
            .eq("status", "cleanup_pending")
            .in("id", succeededAssetIds)
        : Promise.resolve({ error: null }),
    ]);

    if (intentUpdate.error || assetUpdate.error)
      throw new Error("cleanup_finalize_failed");

    metrics.finalizedCount = succeededIntents.length + succeededAssetIds.length;

    if (!supabaseDeleteSucceeded || r2DeleteHadFailures) {
      throw new Error("cleanup_storage_failed");
    }

    stage = "release lease";

    logServerEvent("info", {
      event: "storage_cleanup.completed",
      requestId,
      runId,
      batchId,
      route: "/api/internal/storage-cleanup",
      stage,
      metadata: {
        ...metrics,
        batchSize: BATCH_SIZE,
        leaseReleasedCount: succeededAssetIds.length,
        staleLeaseRetryWindowMinutes: 15,
      },
    });

    return NextResponse.json(
      createApiSuccess(
        {
          status: "completed",
          expiredIntents: succeededIntents.length,
          deletedAssets: succeededAssetIds.length,
        },
        requestId,
      ),
      {
        headers: {
          "Cache-Control": "no-store",
          [REQUEST_ID_HEADER]: requestId,
        },
      },
    );
  } catch (error) {
    logServerEvent("error", {
      event: "storage_cleanup.failed",
      requestId,
      runId,
      batchId,
      route: "/api/internal/storage-cleanup",
      stage,
      errorCode:
        error instanceof Error ? error.message : "cleanup_unknown_failure",
      error,
      metadata: metrics,
    });
    return responseError(
      "INTERNAL_ERROR",
      "Storage cleanup could not be completed.",
      requestId,
      500,
    );
  }
}

function isAuthorized(
  header: string | null,
  candidates: Array<string | undefined>,
) {
  if (!header?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(header.slice(7));

  for (const expected of candidates) {
    const trimmed = expected?.trim();
    if (!trimmed) continue;
    const configured = Buffer.from(trimmed);
    if (
      supplied.length === configured.length &&
      timingSafeEqual(supplied, configured)
    ) {
      return true;
    }
  }
  return false;
}

function responseError(
  code: "NOT_FOUND" | "INTERNAL_ERROR",
  message: string,
  requestId: string,
  status: number,
) {
  return NextResponse.json(createApiError(code, message, requestId), {
    status,
    headers: {
      "Cache-Control": "no-store",
      [REQUEST_ID_HEADER]: requestId,
    },
  });
}
