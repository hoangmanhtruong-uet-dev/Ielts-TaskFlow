import { NextResponse } from "next/server";
import { parseBuffer } from "music-metadata";

import { detectAudioMimeType } from "@/features/speaking/server/audio-verification";
import { parseWebmDurationSeconds } from "@/features/speaking/server/webm-duration";
import { mediaRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: rateAllowed } = await mediaRateLimit.limit(
      `media_${user.id}`,
    );
    if (!rateAllowed) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size < 1 || file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Audio file size must be between 1 byte and 15MB" },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detectedMimeType = detectAudioMimeType(bytes);
    if (!detectedMimeType) {
      return NextResponse.json(
        { error: "Unsupported or invalid audio signature" },
        { status: 400 },
      );
    }

    const metadata = await parseBuffer(
      bytes,
      { mimeType: detectedMimeType, size: bytes.byteLength },
      { duration: true, skipCovers: true },
    ).catch(() => null);

    const duration =
      metadata?.format.duration ??
      (detectedMimeType === "audio/webm"
        ? parseWebmDurationSeconds(bytes)
        : undefined);

    if (!duration || !Number.isFinite(duration)) {
      return NextResponse.json(
        { error: "Could not determine duration" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      durationSeconds: Math.round(duration * 1000) / 1000,
      mimeType: detectedMimeType,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process audio duration" },
      { status: 500 },
    );
  }
}
