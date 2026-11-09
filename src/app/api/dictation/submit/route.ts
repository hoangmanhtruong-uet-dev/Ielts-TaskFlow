import { NextRequest, NextResponse } from "next/server";

import { submitAnswer } from "@/lib/dictation/queries";
import { dictationSubmitRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "@/lib/validation/zod";

const submitDictationSchema = z.object({
  exerciseId: z.string().uuid("Mã bài tập không hợp lệ."),
  sentenceId: z.string().uuid("Mã câu không hợp lệ."),
  userInput: z.string().max(4000, "Nội dung quá dài."),
  timeSpent: z.coerce.number().int().min(0).max(7200).default(0),
  replayCount: z.coerce.number().int().min(0).max(100).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: rateAllowed } = await dictationSubmitRateLimit.limit(
      `dictation_${user.id}`,
    );
    if (!rateAllowed) {
      return NextResponse.json(
        { error: "Too many dictation submissions. Please slow down." },
        { status: 429 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const parsed = submitDictationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing or invalid dictation fields" },
        { status: 400 },
      );
    }

    const result = await submitAnswer({
      userId: user.id,
      exerciseId: parsed.data.exerciseId,
      sentenceId: parsed.data.sentenceId,
      userInput: parsed.data.userInput.trim(),
      timeSpent: parsed.data.timeSpent,
      replayCount: parsed.data.replayCount,
    });

    const resultRecord =
      result && typeof result === "object"
        ? (result as unknown as Record<string, unknown>)
        : null;
    if (resultRecord && typeof resultRecord.error === "string") {
      return NextResponse.json({ error: resultRecord.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/dictation/submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 },
    );
  }
}
