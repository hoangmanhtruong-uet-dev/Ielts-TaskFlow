import { readingPracticeResultSchema } from "@/features/practice/model";
import {
  isReadingQuestionType,
  type ReadingQuestionType,
} from "@/features/reading/model";
import { readingRouteSchema } from "@/features/reading/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";

export type ReadingCatalogItem = {
  slug: string;
  title: string;
  summary: string;
  difficulty: string;
  testType: string;
  questionCount: number;
  timeLimitSeconds: number;
};

export type ReadingQuestion = {
  id: string;
  groupId: string;
  position: number;
  type: ReadingQuestionType;
  promptMarkdown: string;
  points: number;
  options: { id: string; label: string; position: number }[];
  answer: {
    text: string | null;
    selectedOptionIds: string[];
    clientRevision: number;
  } | null;
};

export type ReadingPracticePageData = {
  exercise: {
    slug: string;
    versionId: string;
    title: string;
    summary: string;
    instructionsMarkdown: string;
    difficulty: string;
    timeLimitSeconds: number;
  };
  passage: {
    title: string;
    summary: string;
    testType: string;
    sourceName: string;
    licence: string;
    sections: {
      id: string;
      position: number;
      heading: string | null;
      bodyMarkdown: string;
    }[];
  };
  groups: {
    id: string;
    position: number;
    type: ReadingQuestionType;
    title: string;
    instructionsMarkdown: string;
    maxAnswerWords: number | null;
  }[];
  questions: ReadingQuestion[];
  attempt: {
    id: string;
    startedAt: string;
    expiresAt: string;
    serverNow: string;
    lastSavedAt: string;
  } | null;
  latestResultId: string | null;
};

export class ReadingReadError extends Error {
  constructor(message = "Không thể đọc bài Reading.") {
    super(message);
    this.name = "ReadingReadError";
  }
}

export async function getReadingCatalog(): Promise<ReadingCatalogItem[]> {
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data: sets, error: setsError } = await supabase
    .from("exercise_sets")
    .select("id, slug")
    .eq("domain", "reading")
    .order("display_order");
  if (setsError) throw new ReadingReadError();
  if (sets.length === 0) return [];

  const setIds = sets.map((item) => item.id);
  const { data: versions, error: versionsError } = await supabase
    .from("exercise_set_versions")
    .select("id, exercise_set_id, title, summary, difficulty")
    .in("exercise_set_id", setIds)
    .eq("status", "published");
  if (versionsError) throw new ReadingReadError();
  if (versions.length === 0) return [];

  const versionIds = versions.map((item) => item.id);
  const [practiceResult, questionsResult] = await Promise.all([
    supabase
      .from("reading_practice_versions")
      .select(
        "exercise_set_version_id, reading_passage_version_id, time_limit_seconds",
      )
      .in("exercise_set_version_id", versionIds),
    supabase
      .from("exercise_questions")
      .select("exercise_set_version_id")
      .in("exercise_set_version_id", versionIds),
  ]);
  if (practiceResult.error || questionsResult.error)
    throw new ReadingReadError();

  const passageVersionIds = practiceResult.data.map(
    (item) => item.reading_passage_version_id,
  );
  const { data: passageVersions, error: passageVersionError } = await supabase
    .from("reading_passage_versions")
    .select("id, reading_passage_id")
    .in("id", passageVersionIds);
  if (passageVersionError) throw new ReadingReadError();
  const passageIds = passageVersions.map((item) => item.reading_passage_id);
  const { data: passages, error: passagesError } = await supabase
    .from("reading_passages")
    .select("id, test_type")
    .in("id", passageIds);
  if (passagesError) throw new ReadingReadError();

  const setById = new Map(sets.map((item) => [item.id, item]));
  const practiceByVersion = new Map(
    practiceResult.data.map((item) => [item.exercise_set_version_id, item]),
  );
  const passageVersionById = new Map(
    passageVersions.map((item) => [item.id, item]),
  );
  const passageById = new Map(passages.map((item) => [item.id, item]));
  const questionCountByVersion = new Map<string, number>();
  for (const question of questionsResult.data) {
    questionCountByVersion.set(
      question.exercise_set_version_id,
      (questionCountByVersion.get(question.exercise_set_version_id) ?? 0) + 1,
    );
  }

  return versions.flatMap((version): ReadingCatalogItem[] => {
    const set = setById.get(version.exercise_set_id);
    const practice = practiceByVersion.get(version.id);
    const passageVersion = practice
      ? passageVersionById.get(practice.reading_passage_version_id)
      : undefined;
    const passage = passageVersion
      ? passageById.get(passageVersion.reading_passage_id)
      : undefined;
    if (!set || !practice || !passage) return [];
    return [
      {
        slug: set.slug,
        title: version.title,
        summary: version.summary,
        difficulty: version.difficulty,
        testType: passage.test_type,
        questionCount: questionCountByVersion.get(version.id) ?? 0,
        timeLimitSeconds: practice.time_limit_seconds,
      },
    ];
  });
}

export async function getReadingPracticePage(
  exerciseSlug: string,
  options?: { mockAttemptId?: string },
): Promise<ReadingPracticePageData | null> {
  const route = readingRouteSchema
    .pick({ exerciseSlug: true })
    .safeParse({ exerciseSlug });
  if (!route.success) return null;
  const { account } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  const { data: exercise, error: exerciseError } = await supabase
    .from("exercise_sets")
    .select("id, slug")
    .eq("slug", exerciseSlug)
    .eq("domain", "reading")
    .maybeSingle();
  if (exerciseError) throw new ReadingReadError();
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
        "id, exercise_set_version_id, status, is_mock, last_saved_at, submitted_at, created_at",
      )
      .eq("user_id", account.user.id)
      .eq("exercise_set_id", exercise.id)
      .order("created_at", { ascending: false }),
  ]);
  if (versionsResult.error || attemptsResult.error)
    throw new ReadingReadError();
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

  const [practiceResult, questionsResult, groupsResult, answersResult] =
    await Promise.all([
      supabase
        .from("reading_practice_versions")
        .select("reading_passage_version_id, time_limit_seconds")
        .eq("exercise_set_version_id", version.id)
        .maybeSingle(),
      supabase
        .from("exercise_questions")
        .select(
          "id, reading_question_group_id, position, question_type, prompt_markdown, points",
        )
        .eq("exercise_set_version_id", version.id)
        .order("position"),
      supabase
        .from("reading_question_groups")
        .select(
          "id, position, group_type, title, instructions_markdown, max_answer_words",
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
    questionsResult.error ||
    groupsResult.error ||
    answersResult.error
  ) {
    throw new ReadingReadError();
  }
  if (!practiceResult.data) return null;

  const questionIds = questionsResult.data.map((item) => item.id);
  const [passageVersionResult, optionsResult, selectionsResult, clockResult] =
    await Promise.all([
      supabase
        .from("reading_passage_versions")
        .select("id, reading_passage_id, title, summary, source_name, licence")
        .eq("id", practiceResult.data.reading_passage_version_id)
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
        ? supabase.rpc("get_reading_attempt_clock", {
            p_attempt_id: activeAttempt.id,
          })
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (
    passageVersionResult.error ||
    optionsResult.error ||
    selectionsResult.error ||
    clockResult.error
  )
    throw new ReadingReadError();
  if (!passageVersionResult.data) return null;

  const [passageResult, sectionsResult] = await Promise.all([
    supabase
      .from("reading_passages")
      .select("test_type")
      .eq("id", passageVersionResult.data.reading_passage_id)
      .maybeSingle(),
    supabase
      .from("reading_passage_sections")
      .select("id, position, heading, body_markdown")
      .eq("reading_passage_version_id", passageVersionResult.data.id)
      .order("position"),
  ]);
  if (passageResult.error || sectionsResult.error) throw new ReadingReadError();
  if (!passageResult.data) return null;

  const answerByQuestion = new Map(
    answersResult.data.map((item) => [item.question_id, item]),
  );
  const selectionsByAnswer = new Map<string, string[]>();
  for (const selection of selectionsResult.data) {
    const list = selectionsByAnswer.get(selection.answer_id) ?? [];
    list.push(selection.option_id);
    selectionsByAnswer.set(selection.answer_id, list);
  }
  const questions = questionsResult.data.flatMap(
    (question): ReadingQuestion[] => {
      if (
        !question.reading_question_group_id ||
        !isReadingQuestionType(question.question_type)
      )
        return [];
      const answer = answerByQuestion.get(question.id);
      return [
        {
          id: question.id,
          groupId: question.reading_question_group_id,
          position: question.position,
          type: question.question_type,
          promptMarkdown: question.prompt_markdown,
          points: question.points,
          options: optionsResult.data
            .filter((item) => item.question_id === question.id)
            .map((item) => ({
              id: item.id,
              label: item.label,
              position: item.position,
            })),
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
  const groups = groupsResult.data.flatMap((group) =>
    isReadingQuestionType(group.group_type)
      ? [
          {
            id: group.id,
            position: group.position,
            type: group.group_type,
            title: group.title,
            instructionsMarkdown: group.instructions_markdown,
            maxAnswerWords: group.max_answer_words,
          },
        ]
      : [],
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
    passage: {
      title: passageVersionResult.data.title,
      summary: passageVersionResult.data.summary,
      testType: passageResult.data.test_type,
      sourceName: passageVersionResult.data.source_name,
      licence: passageVersionResult.data.licence,
      sections: sectionsResult.data.map((item) => ({
        id: item.id,
        position: item.position,
        heading: item.heading,
        bodyMarkdown: item.body_markdown,
      })),
    },
    groups,
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

export async function getReadingPracticeResult(
  exerciseSlug: string,
  attemptId: string,
) {
  const route = readingRouteSchema.safeParse({ exerciseSlug, attemptId });
  if (!route.success) return null;
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_exercise_attempt_result", {
    p_attempt_id: attemptId,
  });
  if (error) return null;
  const parsed = readingPracticeResultSchema.safeParse(data);
  if (!parsed.success)
    throw new ReadingReadError("Kết quả Reading không hợp lệ.");
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
      .eq("domain", "reading")
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
  if (optionsError) throw new ReadingReadError();
  if (!exercise || !version) return null;
  return {
    result: parsed.data,
    exercise: { slug: exercise.slug, ...version },
    options,
  };
}
