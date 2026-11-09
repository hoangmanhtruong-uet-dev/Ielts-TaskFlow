import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Storage cleanup is not configured.");
  }

  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
