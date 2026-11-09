import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DictationExercise,
  DictationProgress,
  DictationSentence,
  DictationSubmitResult,
  DictationUserStats,
} from "@/types/dictation";

export interface DictationExerciseWithSentences {
  exercise: DictationExercise;
  sentences: DictationSentence[];
}

export async function getExercises(params?: {
  category?: string;
  difficulty?: number;
  page?: number;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("dictation_exercises")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params?.category) {
    query = query.eq("category", params.category);
  }
  if (params?.difficulty) {
    query = query.eq("difficulty", params.difficulty);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    exercises: (data ?? []) as DictationExercise[],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getExercisesWithSentences(
  limit = 24,
): Promise<DictationExerciseWithSentences[]> {
  const supabase = await createSupabaseServerClient();

  const { data: exercisesData, error: exercisesError } = await supabase
    .from("dictation_exercises")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (exercisesError) throw exercisesError;
  const exercises = (exercisesData ?? []) as DictationExercise[];
  if (exercises.length === 0) return [];

  const exerciseIds = exercises.map((ex) => ex.id);
  const { data: sentencesData, error: sentencesError } = await supabase
    .from("dictation_sentences")
    .select("*")
    .in("exercise_id", exerciseIds)
    .order("order_index", { ascending: true });

  if (sentencesError) throw sentencesError;

  const byExercise = new Map<string, DictationSentence[]>();
  for (const row of (sentencesData ?? []) as DictationSentence[]) {
    const list = byExercise.get(row.exercise_id) ?? [];
    list.push(row);
    byExercise.set(row.exercise_id, list);
  }

  return exercises
    .map((exercise) => ({
      exercise,
      sentences: byExercise.get(exercise.id) ?? [],
    }))
    .filter((entry) => entry.sentences.length > 0);
}

export async function getExerciseById(exerciseId: string) {
  const supabase = await createSupabaseServerClient();

  const [exerciseRes, sentencesRes] = await Promise.all([
    supabase
      .from("dictation_exercises")
      .select("*")
      .eq("id", exerciseId)
      .eq("is_published", true)
      .single(),
    supabase
      .from("dictation_sentences")
      .select("*")
      .eq("exercise_id", exerciseId)
      .order("order_index", { ascending: true }),
  ]);

  if (exerciseRes.error) throw exerciseRes.error;
  if (sentencesRes.error) throw sentencesRes.error;

  return {
    exercise: exerciseRes.data as DictationExercise,
    sentences: (sentencesRes.data ?? []) as DictationSentence[],
  };
}

export async function getUserProgress(
  userId: string,
  exerciseIds?: string[],
): Promise<DictationProgress[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("dictation_progress")
    .select("*")
    .eq("user_id", userId);

  if (exerciseIds?.length) {
    query = query.in("exercise_id", exerciseIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as DictationProgress[];
}

export async function submitAnswer(params: {
  userId: string;
  exerciseId: string;
  sentenceId: string;
  userInput: string;
  timeSpent: number;
  replayCount: number;
}): Promise<DictationSubmitResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("fn_submit_dictation_answer", {
    p_user_id: params.userId,
    p_exercise_id: params.exerciseId,
    p_sentence_id: params.sentenceId,
    p_user_input: params.userInput,
    p_time_spent: params.timeSpent,
    p_replay_count: params.replayCount,
  });

  if (error) throw error;
  return data as unknown as DictationSubmitResult;
}

export async function getUserStats(
  userId?: string,
): Promise<DictationUserStats> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc(
    "fn_get_user_dictation_stats",
    userId ? { p_user_id: userId } : {},
  );

  if (error) throw error;
  return data as unknown as DictationUserStats;
}
