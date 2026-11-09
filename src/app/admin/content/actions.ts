"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAccount } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "@/lib/validation/zod";

const contentIdSchema = z.object({
  id: z.string().uuid("ID nội dung không hợp lệ."),
});

export async function approveContent(formData: FormData) {
  await requireAdminAccount({ onUnauthorized: "throw" });

  const parsed = contentIdSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    throw new Error("Invalid content identifier");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("ai_generated_contents")
    .update({ status: "APPROVED" })
    .eq("id", parsed.data.id);

  if (error) {
    throw new Error("Failed to approve content");
  }

  revalidatePath("/admin/content");
}

export async function rejectContent(formData: FormData) {
  await requireAdminAccount({ onUnauthorized: "throw" });

  const parsed = contentIdSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    throw new Error("Invalid content identifier");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("ai_generated_contents")
    .update({ status: "REJECTED" })
    .eq("id", parsed.data.id);

  if (error) {
    throw new Error("Failed to reject content");
  }

  revalidatePath("/admin/content");
}
