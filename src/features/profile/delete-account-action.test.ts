import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCurrentAccount: vi.fn(),
  deleteR2Objects: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  getServerRequestId: vi.fn(),
}));

vi.mock("@/features/auth/server/account", () => ({
  requireCurrentAccount: mocks.requireCurrentAccount,
}));

vi.mock("@/lib/r2", () => ({
  deleteR2Objects: mocks.deleteR2Objects,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/server/observability/request-context", () => ({
  getServerRequestId: mocks.getServerRequestId,
}));

import { deleteAccountAction } from "@/features/profile/delete-account-action";

function makeForm(confirmText: string, acknowledge?: string) {
  const fd = new FormData();
  fd.set("confirmText", confirmText);
  if (acknowledge !== undefined) fd.set("acknowledge", acknowledge);
  return fd;
}

describe("deleteAccountAction", () => {
  const deleteUser = vi.fn();
  const storageRemove = vi.fn();
  const signOut = vi.fn();
  let assetsResult: {
    data: Array<{
      id: string;
      bucket_id: string | null;
      storage_path: string | null;
    }> | null;
    error: { code?: string; message: string } | null;
  };

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    mocks.getServerRequestId.mockResolvedValue("req-delete-1");
    mocks.requireCurrentAccount.mockResolvedValue({
      user: { id: "user-del-1", email: "learner@example.com" },
    });
    assetsResult = {
      data: [
        {
          id: "a1",
          bucket_id: "cloudflare-r2",
          storage_path: "user-del-1/speaking/clip1.webm",
        },
        {
          id: "a2",
          bucket_id: "speaking-recordings",
          storage_path: "user-del-1/clip2.webm",
        },
        { id: "a3", bucket_id: "cloudflare-r2", storage_path: null },
      ],
      error: null,
    };
    mocks.deleteR2Objects.mockResolvedValue({
      deletedKeys: ["user-del-1/speaking/clip1.webm"],
      failedKeys: [],
    });
    storageRemove.mockResolvedValue({ error: null });
    deleteUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });

    mocks.createSupabaseAdminClient.mockReturnValue({
      from: (table: string) => {
        if (table !== "speaking_audio_assets") {
          throw new Error(`Unexpected table ${table}`);
        }
        return {
          select: () => ({
            eq: async () => assetsResult,
          }),
        };
      },
      storage: {
        from: () => ({
          remove: storageRemove,
        }),
      },
      auth: {
        admin: {
          deleteUser,
        },
      },
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { signOut },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("rejects incorrect confirmation text or unchecked acknowledgement before touching DB", async () => {
    const wrongText = await deleteAccountAction(
      { status: "idle" },
      makeForm("DELETE", "on"),
    );
    expect(wrongText.status).toBe("error");
    expect(wrongText.message).toContain("XOA TAI KHOAN");
    expect(mocks.requireCurrentAccount).not.toHaveBeenCalled();

    const unchecked = await deleteAccountAction(
      { status: "idle" },
      makeForm("XOA TAI KHOAN"),
    );
    expect(unchecked.status).toBe("error");
    expect(unchecked.message).toContain("xác nhận");
    expect(mocks.requireCurrentAccount).not.toHaveBeenCalled();
  });

  it("fails safely when admin client is not configured", async () => {
    mocks.createSupabaseAdminClient.mockImplementationOnce(() => {
      throw new Error("missing service role");
    });

    const res = await deleteAccountAction(
      { status: "idle" },
      makeForm("XOA TAI KHOAN", "on"),
    );
    expect(res.status).toBe("error");
    expect(res.message).toContain("chưa sẵn sàng");
  });

  it("aborts auth deleteUser when asset query, R2 cleanup, or Supabase Storage cleanup fails", async () => {
    assetsResult = { data: null, error: { code: "500", message: "db down" } };
    const queryFail = await deleteAccountAction(
      { status: "idle" },
      makeForm("XOA TAI KHOAN", "on"),
    );
    expect(queryFail.status).toBe("error");
    expect(deleteUser).not.toHaveBeenCalled();

    assetsResult = {
      data: [
        {
          id: "a1",
          bucket_id: "cloudflare-r2",
          storage_path: "user-del-1/speaking/clip1.webm",
        },
      ],
      error: null,
    };
    mocks.deleteR2Objects.mockResolvedValueOnce({
      deletedKeys: [],
      failedKeys: ["user-del-1/speaking/clip1.webm"],
    });
    const r2Partial = await deleteAccountAction(
      { status: "idle" },
      makeForm("XOA TAI KHOAN", "on"),
    );
    expect(r2Partial.status).toBe("error");
    expect(r2Partial.message).toContain("Cloudflare R2");
    expect(deleteUser).not.toHaveBeenCalled();

    mocks.deleteR2Objects.mockResolvedValue({
      deletedKeys: ["user-del-1/speaking/clip1.webm"],
      failedKeys: [],
    });
    assetsResult = {
      data: [
        {
          id: "a2",
          bucket_id: "speaking-recordings",
          storage_path: "user-del-1/clip2.webm",
        },
      ],
      error: null,
    };
    storageRemove.mockResolvedValueOnce({
      error: { message: "bucket offline" },
    });
    const supaFail = await deleteAccountAction(
      { status: "idle" },
      makeForm("XOA TAI KHOAN", "true"),
    );
    expect(supaFail.status).toBe("error");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("purges both Cloudflare R2 and Supabase Storage, deletes auth user, signs out, and redirects", async () => {
    await expect(
      deleteAccountAction(
        { status: "idle" },
        makeForm("  xoa   tai  khoan ", "on"),
      ),
    ).rejects.toThrow("NEXT_REDIRECT: /?accountDeleted=1");

    expect(mocks.deleteR2Objects).toHaveBeenCalledWith([
      "user-del-1/speaking/clip1.webm",
    ]);
    expect(storageRemove).toHaveBeenCalledWith(["user-del-1/clip2.webm"]);
    expect(deleteUser).toHaveBeenCalledWith("user-del-1");
    expect(signOut).toHaveBeenCalled();
  });
});
