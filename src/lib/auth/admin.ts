import "server-only";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const ADMIN_ROLES = ["super_admin", "content_editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export class AdminAuthorizationError extends Error {
  constructor(
    public readonly statusCode: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

export type AdminAccountContext = {
  user: {
    id: string;
    email: string;
  };
  role: AdminRole;
};

export async function getAdminAccountStatus(): Promise<
  | { status: "unauthenticated" }
  | { status: "forbidden"; userId: string }
  | { status: "authorized"; account: AdminAccountContext }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const { data: roleRows, error: roleError } = await supabase
    .from("app_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ADMIN_ROLES)
    .limit(1);

  if (roleError || !Array.isArray(roleRows) || roleRows.length === 0) {
    return { status: "forbidden", userId: user.id };
  }

  const assignedRole = roleRows[0]?.role as AdminRole | undefined;
  if (!assignedRole || !ADMIN_ROLES.includes(assignedRole)) {
    return { status: "forbidden", userId: user.id };
  }

  return {
    status: "authorized",
    account: {
      user: {
        id: user.id,
        email: user.email ?? "",
      },
      role: assignedRole,
    },
  };
}

export async function requireAdminAccount(options?: {
  onUnauthorized?: "redirect" | "throw";
}): Promise<AdminAccountContext> {
  const mode = options?.onUnauthorized ?? "redirect";
  const result = await getAdminAccountStatus();

  if (result.status === "unauthenticated") {
    if (mode === "throw") {
      throw new AdminAuthorizationError(401, "Unauthorized");
    }
    redirect("/login?next=/admin/content");
  }

  if (result.status === "forbidden") {
    if (mode === "throw") {
      throw new AdminAuthorizationError(403, "Forbidden");
    }
    redirect("/dashboard");
  }

  return result.account;
}

export async function assertAdminApi(): Promise<
  | { ok: true; account: AdminAccountContext }
  | { ok: false; response: NextResponse }
> {
  const result = await getAdminAccountStatus();

  if (result.status === "unauthenticated") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (result.status === "forbidden") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, account: result.account };
}
