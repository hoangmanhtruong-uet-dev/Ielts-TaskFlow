import type { Metadata } from "next";
import { Suspense } from "react";
import { requireCurrentAccount } from "@/features/auth/server/account";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import {
  getExercisesWithSentences,
  getUserProgress,
  getUserStats,
} from "@/lib/dictation/queries";
import {
  BASE_LESSONS,
  DictationClient,
  type DictationLesson,
  type DictationProgressEntry,
} from "./client";

export const metadata: Metadata = {
  title: "Luyện nghe chép chính tả | Indigo Scholar",
  description:
    "Luyện kỹ năng nghe tiếng Anh qua bài tập chép chính tả. Nghe audio và gõ lại chính xác những gì bạn nghe được.",
};

function mapDbDifficulty(difficulty: number): DictationLesson["lv"] {
  if (difficulty <= 2) return "Cơ bản";
  if (difficulty <= 3) return "Trung bình";
  return "Nâng cao";
}

function mapDbCategory(category: string): string {
  switch (category) {
    case "daily":
      return "Giao tiếp";
    case "business":
      return "Công sở";
    case "academic":
      return "Học thuật";
    case "news":
      return "Tin tức";
    default:
      return "Tổng hợp";
  }
}

function formatDurationMMSS(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = String(safe % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export default async function DictationPage() {
  const [account] = await Promise.all([
    requireCurrentAccount(),
    requireCompletedOnboarding(),
  ]);

  let dbLessons: DictationLesson[] = [];
  const dbProgress: Record<string, DictationProgressEntry> = {};
  let initialStats: { n: number; sum: number } | undefined;

  try {
    const [dbRows, progressRows, stats] = await Promise.all([
      getExercisesWithSentences(24),
      getUserProgress(account.user.id),
      getUserStats(account.user.id),
    ]);

    dbLessons = dbRows.map(({ exercise, sentences }) => ({
      id: `db:${exercise.id}`,
      dbExerciseId: exercise.id,
      cat: mapDbCategory(exercise.category),
      lv: mapDbDifficulty(exercise.difficulty),
      title: exercise.title,
      desc: exercise.description ?? "Bài luyện nghe chép chính tả từ hệ thống.",
      dur: formatDurationMMSS(exercise.duration_seconds),
      audioUrl: exercise.audio_url,
      audioUrlLow: exercise.audio_url_low,
      sentenceMeta: sentences.map((s) => ({
        id: s.id,
        startTime: Number(s.start_time),
        endTime: Number(s.end_time),
        hint: s.hint,
      })),
      s: sentences.map((s) => s.text),
    }));

    for (const p of progressRows) {
      dbProgress[`db:${p.exercise_id}`] = {
        best: Math.round(Number(p.best_score)),
        last: Math.round(Number(p.latest_score)),
        completed: p.completed,
      };
    }

    if (stats && Number(stats.total_attempts) > 0) {
      initialStats = {
        n: Number(stats.total_attempts),
        sum: Math.round(
          Number(stats.average_best_score) * Number(stats.total_attempts),
        ),
      };
    }
  } catch {
    // Fallback cleanly to built-in catalog when DB query fails
  }

  // Merge DB lessons first, skipping built-in duplicates sharing exact title
  const dbTitles = new Set(dbLessons.map((l) => l.title.trim().toLowerCase()));
  const mergedLessons: DictationLesson[] = [
    ...dbLessons,
    ...BASE_LESSONS.filter((l) => !dbTitles.has(l.title.trim().toLowerCase())),
  ];

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0E1D]" />}>
      <DictationClient
        initialLessons={mergedLessons}
        initialProgress={dbProgress}
        initialStats={initialStats}
      />
    </Suspense>
  );
}
