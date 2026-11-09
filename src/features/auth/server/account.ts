import { cache } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type CurrentAccount = {
  user: {
    id: string;
    email: string;
    createdAt: string;
    emailConfirmedAt: string | null;
  };
  profile: Profile | null;
};

export class AccountReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountReadError";
  }
}

export const getCurrentAccount = cache(
  async (): Promise<CurrentAccount | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user) {
      if (userError && userError.name !== "AuthSessionMissingError") {
        throw new AccountReadError("Không thể xác minh phiên đăng nhập.");
      }
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, timezone, locale, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Profile query error detail:",
        JSON.stringify(profileError, null, 2),
      );
      throw new AccountReadError("Không thể đọc hồ sơ người dùng.");
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? "",
        createdAt: user.created_at,
        emailConfirmedAt: user.email_confirmed_at ?? null,
      },
      profile,
    };
  },
);

export async function requireCurrentAccount() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login?authError=session_expired");
  return account;
}

export function getAccountLabel(account: CurrentAccount) {
  return account.profile?.display_name || account.user.email || "Người học";
}
