"use server";

import { redirect } from "next/navigation";

import { requireCurrentAccount } from "@/features/auth/server/account";
import { deleteR2Objects } from "@/lib/r2";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logServerEvent } from "@/server/observability/logger";
import { getServerRequestId } from "@/server/observability/request-context";

export type DeleteAccountActionState = {
  status: "idle" | "error";
  message?: string;
  requestId?: string;
};

const EXPECTED_CONFIRMATION = "XOA TAI KHOAN";
const SUPABASE_SPEAKING_BUCKET = "speaking-recordings";

export async function deleteAccountAction(
  _prevState: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const requestId = await getServerRequestId();
  const confirmTextRaw = formData.get("confirmText");
  const acknowledgeRaw = formData.get("acknowledge");

  const confirmText =
    typeof confirmTextRaw === "string"
      ? confirmTextRaw.trim().replace(/\s+/g, " ").toUpperCase()
      : "";
  const acknowledged = acknowledgeRaw === "on" || acknowledgeRaw === "true";

  if (confirmText !== EXPECTED_CONFIRMATION) {
    return {
      status: "error",
      message: `Vui lòng nhập chính xác "${EXPECTED_CONFIRMATION}" để xác nhận xóa tài khoản.`,
      requestId,
    };
  }

  if (!acknowledged) {
    return {
      status: "error",
      message:
        "Vui lòng đánh dấu ô xác nhận rằng toàn bộ dữ liệu và bản ghi âm sẽ bị xóa vĩnh viễn.",
      requestId,
    };
  }

  const account = await requireCurrentAccount();
  const userId = account.user.id;

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    logServerEvent("error", {
      event: "account.delete.config_missing",
      requestId,
      route: "deleteAccountAction",
      stage: "init admin client",
      error,
      metadata: {
        userId,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      status: "error",
      message:
        "Dịch vụ xóa tài khoản tự động hiện chưa sẵn sàng. Vui lòng liên hệ bộ phận hỗ trợ.",
      requestId,
    };
  }

  // 1. Enumerate all user speaking audio assets so object storage is purged
  // BEFORE deleting database/Auth records (otherwise storage becomes orphaned PII).
  const { data: assets, error: assetsError } = await admin
    .from("speaking_audio_assets")
    .select("id, bucket_id, storage_path")
    .eq("user_id", userId);

  if (assetsError) {
    logServerEvent("error", {
      event: "account.delete.assets_query_failed",
      requestId,
      route: "deleteAccountAction",
      stage: "query speaking assets",
      errorCode: assetsError.code ?? "ASSETS_QUERY_FAILED",
      metadata: { userId },
    });
    return {
      status: "error",
      message:
        "Không thể kiểm tra dữ liệu lưu trữ để xóa an toàn. Hãy thử lại.",
      requestId,
    };
  }

  const assetList = Array.isArray(assets) ? assets : [];
  const r2Keys = assetList
    .filter((item) => item.bucket_id === "cloudflare-r2" && item.storage_path)
    .map((item) => item.storage_path as string);
  const supabasePaths = assetList
    .filter(
      (item) =>
        item.bucket_id === SUPABASE_SPEAKING_BUCKET && item.storage_path,
    )
    .map((item) => item.storage_path as string);

  if (r2Keys.length > 0) {
    try {
      const r2Result = await deleteR2Objects(r2Keys);
      if (r2Result.failedKeys.length > 0) {
        logServerEvent("error", {
          event: "account.delete.r2_cleanup_partial",
          requestId,
          route: "deleteAccountAction",
          stage: "delete r2 speaking objects",
          metadata: {
            userId,
            failedCount: r2Result.failedKeys.length,
          },
        });
        return {
          status: "error",
          message:
            "Không thể xóa hết tệp ghi âm trên Cloudflare R2. Quá trình xóa tài khoản đã tạm dừng để tránh sót dữ liệu.",
          requestId,
        };
      }
    } catch (error) {
      logServerEvent("error", {
        event: "account.delete.r2_cleanup_failed",
        requestId,
        route: "deleteAccountAction",
        stage: "delete r2 speaking objects",
        error,
        metadata: {
          userId,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      return {
        status: "error",
        message:
          "Không thể kết nối kho lưu trữ âm thanh để xóa dữ liệu. Hãy thử lại sau.",
        requestId,
      };
    }
  }

  if (supabasePaths.length > 0) {
    for (let i = 0; i < supabasePaths.length; i += 1000) {
      const batch = supabasePaths.slice(i, i + 1000);
      const { error: storageError } = await admin.storage
        .from(SUPABASE_SPEAKING_BUCKET)
        .remove(batch);
      if (storageError) {
        logServerEvent("error", {
          event: "account.delete.supabase_storage_failed",
          requestId,
          route: "deleteAccountAction",
          stage: "delete supabase speaking objects",
          metadata: {
            userId,
            errorMessage: storageError.message,
          },
        });
        return {
          status: "error",
          message:
            "Không thể xóa tệp ghi âm trên máy chủ lưu trữ. Vui lòng thử lại sau.",
          requestId,
        };
      }
    }
  }

  // 2. Delete user from Supabase Auth (cascades profiles and learner data).
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    logServerEvent("error", {
      event: "account.delete.auth_delete_failed",
      requestId,
      route: "deleteAccountAction",
      stage: "delete auth user",
      metadata: {
        userId,
        errorMessage: deleteUserError.message,
      },
    });
    return {
      status: "error",
      message: "Không thể xóa tài khoản lúc này. Vui lòng thử lại sau.",
      requestId,
    };
  }

  logServerEvent("info", {
    event: "account.delete.completed",
    requestId,
    route: "deleteAccountAction",
    stage: "completed",
    metadata: {
      userId,
      deletedR2Assets: r2Keys.length,
      deletedSupabaseAssets: supabasePaths.length,
    },
  });

  // 3. Clear session cookies on the SSR client before redirecting home.
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // User is already deleted; ignore session cookie cleanup errors.
  }

  redirect("/?accountDeleted=1");
}
