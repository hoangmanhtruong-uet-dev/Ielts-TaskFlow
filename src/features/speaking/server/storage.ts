import "server-only";

import { generateDownloadPresignedUrl, getR2ObjectBytes } from "@/lib/r2";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseClientLike = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function createSpeakingAudioReadUrl(
  supabase: SupabaseClientLike,
  bucketId: string,
  storagePath: string,
  expiresInSeconds = 600,
): Promise<string | null> {
  if (bucketId === "cloudflare-r2") {
    try {
      return await generateDownloadPresignedUrl(storagePath, expiresInSeconds);
    } catch {
      return null;
    }
  }

  if (bucketId === "speaking-recordings") {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .createSignedUrl(storagePath, expiresInSeconds);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }

  return null;
}

export async function downloadSpeakingAudioBlob(
  supabase: SupabaseClientLike,
  bucketId: string,
  storagePath: string,
  mimeType: string,
): Promise<Blob | null> {
  if (bucketId === "cloudflare-r2") {
    const bytes = await getR2ObjectBytes(storagePath, MAX_AUDIO_BYTES);
    if (!bytes) return null;
    return new Blob([Buffer.from(bytes)], {
      type: mimeType || "audio/webm",
    });
  }

  if (bucketId === "speaking-recordings") {
    const { data, error } = await supabase.storage
      .from(bucketId)
      .download(storagePath);
    if (error || !data) return null;
    return data;
  }

  return null;
}
