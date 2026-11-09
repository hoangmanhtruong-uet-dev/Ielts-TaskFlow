"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ErrorNotebookSkill =
  "Reading" | "Listening" | "Vocabulary" | "Grammar";

export interface ErrorNotebookEntry {
  id: string;
  attemptId: string;
  questionId: string;
  skill: ErrorNotebookSkill;
  skillColor: string;
  source: string;
  savedOn: string;
  createdAtIso: string;
  failCount: number;
  failLabel: string;
  failColor: string;
  questionTypeLabel: string;
  question: string;
  yourAnswer: string;
  reviewHref: string;
  retryHref: string;
  status: "Needs Practice" | "Recent Error";
  statusColor: string;
}

type DomainKind = "reading" | "listening" | "vocabulary" | "grammar";

interface RawIncorrectAnswerRow {
  id: string;
  attempt_id: string;
  answer_text: string | null;
  created_at: string;
  question_id: string;
  learner_attempts: {
    id: string;
    user_id: string;
    is_mock: boolean;
  } | null;
  learner_answer_options: Array<{
    exercise_options: {
      label: string;
    } | null;
  }> | null;
  exercise_questions: {
    prompt_markdown: string;
    question_type: string;
    exercise_set_versions: {
      title: string;
      exercise_sets: {
        slug: string;
        domain: string;
      } | null;
    } | null;
  } | null;
}

const DOMAIN_META: Record<
  DomainKind,
  { skill: ErrorNotebookSkill; skillColor: string }
> = {
  reading: {
    skill: "Reading",
    skillColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  listening: {
    skill: "Listening",
    skillColor: "bg-amber-50 text-amber-700 border-amber-100",
  },
  vocabulary: {
    skill: "Vocabulary",
    skillColor: "bg-rose-50 text-rose-700 border-rose-100",
  },
  grammar: {
    skill: "Grammar",
    skillColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
};

function formatQuestionType(rawType: string): string {
  switch (rawType) {
    case "true_false_not_given":
      return "True / False / Not Given";
    case "matching_headings":
      return "Matching Headings";
    case "multiple_choice":
      return "Multiple Choice";
    case "single_choice":
      return "Single Choice";
    case "true_false":
      return "True / False";
    case "short_text":
      return "Short Answer / Gap Fill";
    default:
      return "Practice Question";
  }
}

function buildLinks(domain: DomainKind, slug: string, attemptId: string) {
  if (domain === "reading") {
    return {
      retryHref: `/practice/reading/${slug}`,
      reviewHref: `/practice/reading/${slug}/result/${attemptId}`,
    };
  }
  if (domain === "listening") {
    return {
      retryHref: `/practice/listening/${slug}`,
      reviewHref: `/practice/listening/${slug}/result/${attemptId}`,
    };
  }
  return {
    retryHref: `/practice/${slug}`,
    reviewHref: `/practice/${slug}/result/${attemptId}?view=review`,
  };
}

export async function getErrorNotebookAction(): Promise<{
  success: boolean;
  error?: string;
  data: ErrorNotebookEntry[];
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized", data: [] };
  }

  const { data, error } = await supabase
    .from("learner_answers")
    .select(
      `
      id,
      attempt_id,
      answer_text,
      created_at,
      question_id,
      learner_attempts!inner (
        id,
        user_id,
        is_mock
      ),
      learner_answer_options (
        exercise_options (
          label
        )
      ),
      exercise_questions!inner (
        prompt_markdown,
        question_type,
        exercise_set_versions!inner (
          title,
          exercise_sets!inner (
            slug,
            domain
          )
        )
      )
    `,
    )
    .eq("is_correct", false)
    .eq("learner_attempts.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return {
      success: false,
      error: "Không thể tải danh sách lỗi sai.",
      data: [],
    };
  }

  const rawRows = (data ?? []) as unknown as RawIncorrectAnswerRow[];
  const failCountByQuestion = new Map<string, number>();

  for (const row of rawRows) {
    failCountByQuestion.set(
      row.question_id,
      (failCountByQuestion.get(row.question_id) ?? 0) + 1,
    );
  }

  const entries: ErrorNotebookEntry[] = [];
  for (const row of rawRows) {
    const version = row.exercise_questions?.exercise_set_versions;
    const exerciseSet = version?.exercise_sets;
    if (!row.exercise_questions || !version || !exerciseSet) continue;

    const domain: DomainKind =
      exerciseSet.domain === "listening" ||
      exerciseSet.domain === "vocabulary" ||
      exerciseSet.domain === "grammar"
        ? exerciseSet.domain
        : "reading";

    const domainMeta = DOMAIN_META[domain];
    const failCount = failCountByQuestion.get(row.question_id) ?? 1;
    const optionLabels = (row.learner_answer_options ?? [])
      .map((item) => item.exercise_options?.label?.trim())
      .filter((label): label is string => Boolean(label));
    const yourAnswer =
      row.answer_text?.trim() ||
      (optionLabels.length > 0
        ? optionLabels.join(", ")
        : "(Chưa chọn đáp án)");

    const { retryHref, reviewHref } = buildLinks(
      domain,
      exerciseSet.slug,
      row.attempt_id,
    );

    entries.push({
      id: row.id,
      attemptId: row.attempt_id,
      questionId: row.question_id,
      skill: domainMeta.skill,
      skillColor: domainMeta.skillColor,
      source: version.title,
      savedOn: new Date(row.created_at).toLocaleDateString("vi-VN"),
      createdAtIso: row.created_at,
      failCount,
      failLabel: `Sai ${failCount} lần`,
      failColor:
        failCount >= 3
          ? "bg-rose-50 text-rose-600 border-rose-100"
          : failCount === 2
            ? "bg-orange-50 text-orange-600 border-orange-100"
            : "bg-slate-100 text-slate-600 border-slate-200",
      questionTypeLabel: formatQuestionType(
        row.exercise_questions.question_type,
      ),
      question: row.exercise_questions.prompt_markdown,
      yourAnswer,
      reviewHref,
      retryHref,
      status: failCount >= 2 ? "Needs Practice" : "Recent Error",
      statusColor: failCount >= 2 ? "text-rose-600" : "text-amber-700",
    });
  }

  return { success: true, data: entries };
}
