import { NextRequest, NextResponse } from "next/server";
import { getExerciseById } from "@/lib/dictation/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  try {
    const { exerciseId } = await params;
    const result = await getExerciseById(exerciseId);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GET /api/dictation/exercises/[id] error:", error);
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }
}
