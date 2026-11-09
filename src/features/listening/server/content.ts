import { listeningPracticeResultSchema } from "@/features/practice/model";
import {
  isListeningQuestionType,
  type ListeningQuestionType,
} from "@/features/listening/model";
import { listeningRouteSchema } from "@/features/listening/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";

export type ListeningCatalogItem = {
  slug: string;
  title: string;
  summary: string;
  difficulty: string;
  testType: string;
  questionCount: number;
  timeLimitSeconds: number;
  durationSeconds: number;
};

export type ListeningQuestion = {
  id: string;
  partId: string;
  position: number;
  type: ListeningQuestionType;
  promptMarkdown: string;
  points: number;
  options: { id: string; label: string; position: number }[];
  answer: {
    text: string | null;
    selectedOptionIds: string[];
    clientRevision: number;
  } | null;
};

export type ListeningPracticePageData = {
  exercise: {
    slug: string;
    versionId: string;
    title: string;
    summary: string;
    instructionsMarkdown: string;
    difficulty: string;
    timeLimitSeconds: number;
  };
  audio: {
    path: string;
    mimeType: string;
    durationSeconds: number;
    sourceName: string;
    licence: string;
  };
  parts: {
    id: string;
    position: number;
    title: string;
    instructionsMarkdown: string;
    audioStartSeconds: number;
    audioEndSeconds: number;
  }[];
  questions: ListeningQuestion[];
  attempt: {
    id: string;
    startedAt: string;
    expiresAt: string;
    serverNow: string;
    lastSavedAt: string;
  } | null;
  latestResultId: string | null;
};

export class ListeningReadError extends Error {
  constructor(message = "Không thể đọc bài Listening.") {
    super(message);
    this.name = "ListeningReadError";
  }
}

export async function getListeningCatalog(): Promise<ListeningCatalogItem[]> {
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data: sets, error: setsError } = await supabase
    .from("exercise_sets")
    .select("id, slug")
    .eq("domain", "listening")
    .order("display_order");
  if (setsError) throw new ListeningReadError();
  if (sets.length === 0) return [];

  const { data: versions, error: versionsError } = await supabase
    .from("exercise_set_versions")
    .select("id, exercise_set_id, title, summary, difficulty")
    .in(
      "exercise_set_id",
      sets.map((set) => set.id),
    )
    .eq("status", "published");
  if (versionsError) throw new ListeningReadError();
  if (versions.length === 0) return [];

  const versionIds = versions.map((version) => version.id);
  const [practiceResult, questionsResult] = await Promise.all([
    supabase
      .from("listening_practice_versions")
      .select(
        "exercise_set_version_id, audio_asset_id, test_type, time_limit_seconds",
      )
      .in("exercise_set_version_id", versionIds),
    supabase
      .from("exercise_questions")
      .select("exercise_set_version_id")
      .in("exercise_set_version_id", versionIds),
  ]);
  if (practiceResult.error || questionsResult.error)
    throw new ListeningReadError();
  const { data: audio, error: audioError } = await supabase
    .from("listening_audio_assets")
    .select("id, duration_seconds")
    .in(
      "id",
      practiceResult.data.map((item) => item.audio_asset_id),
    );
  if (audioError) throw new ListeningReadError();

  const setById = new Map(sets.map((set) => [set.id, set]));
  const practiceByVersion = new Map(
    practiceResult.data.map((practice) => [
      practice.exercise_set_version_id,
      practice,
    ]),
  );
  const durationByAudio = new Map(
    audio.map((item) => [item.id, item.duration_seconds]),
  );
  const questionCountByVersion = new Map<string, number>();
  for (const question of questionsResult.data) {
    questionCountByVersion.set(
      question.exercise_set_version_id,
      (questionCountByVersion.get(question.exercise_set_version_id) ?? 0) + 1,
    );
  }

  return versions.flatMap((version): ListeningCatalogItem[] => {
    const set = setById.get(version.exercise_set_id);
    const practice = practiceByVersion.get(version.id);
    if (!set || !practice) return [];
    return [
      {
        slug: set.slug,
        title: version.title,
        summary: version.summary,
        difficulty: version.difficulty,
        testType: practice.test_type,
        questionCount: questionCountByVersion.get(version.id) ?? 0,
        timeLimitSeconds: practice.time_limit_seconds,
        durationSeconds: durationByAudio.get(practice.audio_asset_id) ?? 0,
      },
    ];
  });
}

export async function getListeningPracticePage(
  exerciseSlug: string,
  options?: { mockAttemptId?: string },
): Promise<ListeningPracticePageData | null> {
  const route = listeningRouteSchema
    .pick({ exerciseSlug: true })
    .safeParse({ exerciseSlug });
  if (!route.success) return null;
  const { account } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data: exercise, error: exerciseError } = await supabase
    .from("exercise_sets")
    .select("id, slug")
    .eq("slug", exerciseSlug)
    .eq("domain", "listening")
    .maybeSingle();
  if (exerciseError) throw new ListeningReadError();
  if (!exercise) return null;

  const [versionsResult, attemptsResult] = await Promise.all([
    supabase
      .from("exercise_set_versions")
      .select(
        "id, title, summary, instructions_markdown, difficulty, status, version",
      )
      .eq("exercise_set_id", exercise.id)
      .order("version", { ascending: false }),
    supabase
      .from("learner_attempts")
      .select(
        "id, exercise_set_version_id, status, is_mock, last_saved_at, created_at",
      )
      .eq("user_id", account.user.id)
      .eq("exercise_set_id", exercise.id)
      .order("created_at", { ascending: false }),
  ]);
  if (versionsResult.error || attemptsResult.error)
    throw new ListeningReadError();
  const activeAttempt = options?.mockAttemptId
    ? attemptsResult.data.find(
        (item) =>
          item.id === options.mockAttemptId &&
          item.status === "in_progress" &&
          Boolean(item.is_mock),
      )
    : attemptsResult.data.find(
        (item) => item.status === "in_progress" && !item.is_mock,
      );
  const version =
    versionsResult.data.find(
      (item) => item.id === activeAttempt?.exercise_set_version_id,
    ) ?? versionsResult.data.find((item) => item.status === "published");
  if (!version) return null;

  const [practiceResult, partsResult, questionsResult, answersResult] =
    await Promise.all([
      supabase
        .from("listening_practice_versions")
        .select("audio_asset_id, time_limit_seconds")
        .eq("exercise_set_version_id", version.id)
        .maybeSingle(),
      supabase
        .from("listening_parts")
        .select(
          "id, position, title, instructions_markdown, audio_start_seconds, audio_end_seconds",
        )
        .eq("exercise_set_version_id", version.id)
        .order("position"),
      supabase
        .from("exercise_questions")
        .select(
          "id, listening_part_id, position, question_type, prompt_markdown, points",
        )
        .eq("exercise_set_version_id", version.id)
        .order("position"),
      activeAttempt
        ? supabase
            .from("learner_answers")
            .select("id, question_id, answer_text, client_revision")
            .eq("attempt_id", activeAttempt.id)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (
    practiceResult.error ||
    partsResult.error ||
    questionsResult.error ||
    answersResult.error
  ) {
    throw new ListeningReadError();
  }
  if (!practiceResult.data) return null;

  const questionIds = questionsResult.data.map((item) => item.id);
  const [audioResult, optionsResult, selectionsResult, clockResult] =
    await Promise.all([
      supabase
        .from("listening_audio_assets")
        .select("asset_path, mime_type, duration_seconds, source_name, licence")
        .eq("id", practiceResult.data.audio_asset_id)
        .maybeSingle(),
      questionIds.length
        ? supabase
            .from("exercise_options")
            .select("id, question_id, label, position")
            .in("question_id", questionIds)
            .order("position")
        : Promise.resolve({ data: [], error: null }),
      activeAttempt
        ? supabase
            .from("learner_answer_options")
            .select("answer_id, option_id")
            .eq("attempt_id", activeAttempt.id)
        : Promise.resolve({ data: [], error: null }),
      activeAttempt
        ? supabase.rpc("get_listening_attempt_clock", {
            p_attempt_id: activeAttempt.id,
          })
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (
    audioResult.error ||
    optionsResult.error ||
    selectionsResult.error ||
    clockResult.error
  ) {
    throw new ListeningReadError();
  }
  if (!audioResult.data) return null;

  const answerByQuestion = new Map(
    answersResult.data.map((item) => [item.question_id, item]),
  );
  const selectionsByAnswer = new Map<string, string[]>();
  for (const selection of selectionsResult.data) {
    const current = selectionsByAnswer.get(selection.answer_id) ?? [];
    current.push(selection.option_id);
    selectionsByAnswer.set(selection.answer_id, current);
  }
  const questions = questionsResult.data.flatMap(
    (question): ListeningQuestion[] => {
      if (
        !question.listening_part_id ||
        !isListeningQuestionType(question.question_type)
      )
        return [];
      const answer = answerByQuestion.get(question.id);
      return [
        {
          id: question.id,
          partId: question.listening_part_id,
          position: question.position,
          type: question.question_type,
          promptMarkdown: question.prompt_markdown,
          points: question.points,
          options: optionsResult.data.filter(
            (option) => option.question_id === question.id,
          ),
          answer: answer
            ? {
                text: answer.answer_text,
                selectedOptionIds: selectionsByAnswer.get(answer.id) ?? [],
                clientRevision: answer.client_revision,
              }
            : null,
        },
      ];
    },
  );
  const clock = clockResult.data[0];
  return {
    exercise: {
      slug: exercise.slug,
      versionId: version.id,
      title: version.title,
      summary: version.summary,
      instructionsMarkdown: version.instructions_markdown,
      difficulty: version.difficulty,
      timeLimitSeconds: practiceResult.data.time_limit_seconds,
    },
    audio: {
      path: audioResult.data.asset_path,
      mimeType: audioResult.data.mime_type,
      durationSeconds: audioResult.data.duration_seconds,
      sourceName: audioResult.data.source_name,
      licence: audioResult.data.licence,
    },
    parts: partsResult.data.map((part) => ({
      id: part.id,
      position: part.position,
      title: part.title,
      instructionsMarkdown: part.instructions_markdown,
      audioStartSeconds: part.audio_start_seconds,
      audioEndSeconds: part.audio_end_seconds,
    })),
    questions,
    attempt:
      activeAttempt && clock
        ? {
            id: activeAttempt.id,
            startedAt: clock.started_at,
            expiresAt: clock.expires_at,
            serverNow: clock.server_now,
            lastSavedAt: activeAttempt.last_saved_at,
          }
        : null,
    latestResultId:
      attemptsResult.data.find(
        (item) => item.status === "scored" && !item.is_mock,
      )?.id ?? null,
  };
}

export async function getListeningPracticeResult(
  exerciseSlug: string,
  attemptId: string,
) {
  const route = listeningRouteSchema.safeParse({ exerciseSlug, attemptId });
  if (!route.success) return null;
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_listening_attempt_result", {
    p_attempt_id: attemptId,
  });
  if (error) return null;
  const parsed = listeningPracticeResultSchema.safeParse(data);
  if (!parsed.success)
    throw new ListeningReadError("Kết quả Listening không hợp lệ.");
  const questionIds = parsed.data.questions.map(
    (question) => question.questionId,
  );
  const [
    { data: exercise },
    { data: version },
    { data: options, error: optionsError },
  ] = await Promise.all([
    supabase
      .from("exercise_sets")
      .select("slug, domain")
      .eq("id", parsed.data.exerciseSetId)
      .eq("slug", exerciseSlug)
      .eq("domain", "listening")
      .maybeSingle(),
    supabase
      .from("exercise_set_versions")
      .select("title, summary")
      .eq("id", parsed.data.exerciseSetVersionId)
      .maybeSingle(),
    questionIds.length
      ? supabase
          .from("exercise_options")
          .select("id, label, position")
          .in("question_id", questionIds)
          .order("position")
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (optionsError) throw new ListeningReadError();
  if (!exercise || !version) return null;
  return {
    result: parsed.data,
    exercise: { slug: exercise.slug, ...version },
    options,
  };
}
