import "server-only";

import { requireCurrentAccount } from "@/features/auth/server/account";
import {
  getExercisesWithSentences,
  getUserStats,
} from "@/lib/dictation/queries";
import { getDictationCatalog } from "../content";
import type { DictationDifficulty, DictationExercise } from "../model";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapDbDifficulty(level: number): DictationDifficulty {
  if (level <= 2) return "beginner";
  if (level <= 3) return "intermediate";
  return "advanced";
}

function mapDbCategoryLabel(category: string): string {
  switch (category) {
    case "daily":
      return "Daily Life";
    case "business":
      return "Business & Work";
    case "academic":
      return "Academic & IELTS";
    case "news":
      return "News & Media";
    default:
      return "General Practice";
  }
}

function toDbSlug(id: string): string {
  return `db-${id}`;
}

export async function getUnifiedDictationCatalog(): Promise<{
  items: DictationExercise[];
  averageAccuracy: number | null;
  attemptedCount: number;
}> {
  const account = await requireCurrentAccount();

  let dbItems: DictationExercise[] = [];
  let averageAccuracy: number | null = null;
  let attemptedCount = 0;

  try {
    const [rows, stats] = await Promise.all([
      getExercisesWithSentences(24),
      getUserStats(account.user.id),
    ]);

    dbItems = rows.map(({ exercise, sentences }) => ({
      dbExerciseId: exercise.id,
      slug: toDbSlug(exercise.id),
      title: exercise.title,
      description:
        exercise.description ??
        "Luyện nghe chép chính tả từ kho bài tập hệ thống.",
      category: mapDbCategoryLabel(exercise.category),
      difficulty: mapDbDifficulty(exercise.difficulty),
      audioUrl: exercise.audio_url,
      durationSeconds: exercise.duration_seconds,
      sentences: sentences.map((s, idx) => ({
        id: s.id,
        position: idx + 1,
        text: s.text,
        startTime: Number(s.start_time),
        endTime: Number(s.end_time),
        hint: s.hint ?? undefined,
      })),
    }));

    if (stats && Number(stats.total_attempts) > 0) {
      averageAccuracy = Math.round(Number(stats.average_best_score));
      attemptedCount = Number(stats.total_exercises_attempted);
    }
  } catch {
    // Clean fallback to static catalog when offline or before seed runs
  }

  const dbTitles = new Set(dbItems.map((i) => i.title.trim().toLowerCase()));
  const merged = [
    ...dbItems,
    ...getDictationCatalog().filter(
      (item) => !dbTitles.has(item.title.trim().toLowerCase()),
    ),
  ];

  return { items: merged, averageAccuracy, attemptedCount };
}

export async function getUnifiedDictationBySlug(
  slug: string,
): Promise<DictationExercise | null> {
  if (slug.startsWith("db-")) {
    const id = slug.slice(3);
    if (UUID_REGEX.test(id)) {
      const { items } = await getUnifiedDictationCatalog();
      return items.find((item) => item.dbExerciseId === id) ?? null;
    }
  }

  const { items } = await getUnifiedDictationCatalog();
  return items.find((item) => item.slug === slug) ?? null;
}
