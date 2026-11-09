import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { parseMockRunnerContext } from "@/features/mock-tests/schemas";
import type { Database } from "@/types/database";
import type {
  MockRunnerContext,
  MockSectionType,
  MockSessionStatus,
} from "@/features/mock-tests/model";

type VersionRow = Database["public"]["Tables"]["mock_test_versions"]["Row"];
type SectionRow = Database["public"]["Tables"]["mock_test_sections"]["Row"];
type SectionAttemptRow =
  Database["public"]["Tables"]["mock_test_section_attempts"]["Row"];

export type MockCatalogItem = {
  slug: string;
  title: string;
  description: string;
  testType: string;
  difficulty: string;
  estimatedMinutes: number;
  sectionCount: number;
  activeSessionId: string | null;
  activeSessionStatus: MockSessionStatus | null;
};

export type MockSectionView = {
  id: string;
  type: MockSectionType;
  order: number;
  title: string;
  timeLimitSeconds: number;
  required: boolean;
  attempt: SectionAttemptRow | null;
  practicePath: string | null;
  reviewPath: string | null;
};

export type MockTestDetailData = {
  test: { id: string; slug: string; displayOrder: number };
  version: VersionRow;
  sections: MockSectionView[];
  activeSessionId: string | null;
  activeSessionStatus: MockSessionStatus | null;
};

export type MockWritingEvaluation = {
  submissionId: string;
  wordCount: number;
  overallBandEstimate: number | null;
  taskResponseBand: number | null;
  coherenceCohesionBand: number | null;
  lexicalResourceBand: number | null;
  grammaticalRangeBand: number | null;
  confidence: string | null;
  summary: string | null;
};

export type MockSpeakingEvaluation = {
  attemptId: string;
  overallBandEstimate: number | null;
  fluencyBand: number | null;
  lexicalBand: number | null;
  grammarBand: number | null;
  pronunciationBand: number | null;
  confidence: string | null;
  summary: string | null;
};

export type MockSessionPageData = MockTestDetailData & {
  session: Database["public"]["Tables"]["mock_test_sessions"]["Row"] & {
    status: MockSessionStatus;
  };
  result: Database["public"]["Tables"]["mock_test_results"]["Row"] | null;
  writingEvaluation?: MockWritingEvaluation | null;
  speakingEvaluation?: MockSpeakingEvaluation | null;
};

export type VerifiedMockRunnerRun = {
  context: MockRunnerContext;
  learnerAttemptId: string | null;
  writingSubmissionId: string | null;
  speakingAttemptId: string | null;
};

function relation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function verifyMockRunnerContext(
  query: unknown,
  sectionType: MockSectionType,
): Promise<VerifiedMockRunnerRun | null> {
  const parsed = parseMockRunnerContext(query);
  if (!parsed) return null;

  const { account } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  const { data: session } = await supabase
    .from("mock_test_sessions")
    .select("id, mock_test_id, status")
    .eq("id", parsed.sessionId)
    .eq("user_id", account.user.id)
    .eq("status", "in_progress")
    .maybeSingle();
  if (!session) return null;

  const [{ data: mockTest }, { data: sectionAttempt }] = await Promise.all([
    supabase
      .from("mock_tests")
      .select("id")
      .eq("id", session.mock_test_id)
      .eq("slug", parsed.mockTestSlug)
      .maybeSingle(),
    supabase
      .from("mock_test_section_attempts")
      .select(
        "id, section_type, status, learner_attempt_id, writing_submission_id, speaking_attempt_id",
      )
      .eq("id", parsed.sectionAttemptId)
      .eq("session_id", session.id)
      .eq("user_id", account.user.id)
      .eq("section_type", sectionType)
      .eq("status", "in_progress")
      .maybeSingle(),
  ]);

  if (!mockTest || !sectionAttempt) return null;

  return {
    context: parsed,
    learnerAttemptId: sectionAttempt.learner_attempt_id,
    writingSubmissionId: sectionAttempt.writing_submission_id,
    speakingAttemptId: sectionAttempt.speaking_attempt_id,
  };
}

async function resolveSections(
  sections: SectionRow[],
  attempts: SectionAttemptRow[],
  context?: { mockTestSlug: string; sessionId: string },
): Promise<MockSectionView[]> {
  const supabase = await createSupabaseServerClient();
  const attemptBySection = new Map(
    attempts.map((attempt) => [attempt.mock_test_section_id, attempt]),
  );

  return Promise.all(
    sections.map(async (section) => {
      let title = section.section_type;
      let rootSlug: string | null = null;

      if (section.exercise_set_version_id) {
        const { data } = await supabase
          .from("exercise_set_versions")
          .select("title, exercise_sets!inner(slug)")
          .eq("id", section.exercise_set_version_id)
          .maybeSingle();
        title = data?.title ?? title;
        rootSlug = relation(data?.exercise_sets ?? null)?.slug ?? null;
      } else if (section.writing_task_version_id) {
        const { data } = await supabase
          .from("writing_task_versions")
          .select("title, writing_tasks!inner(slug)")
          .eq("id", section.writing_task_version_id)
          .maybeSingle();
        title = data?.title ?? title;
        rootSlug = relation(data?.writing_tasks ?? null)?.slug ?? null;
      } else if (section.speaking_set_version_id) {
        const { data } = await supabase
          .from("speaking_set_versions")
          .select("title, speaking_sets!inner(slug)")
          .eq("id", section.speaking_set_version_id)
          .maybeSingle();
        title = data?.title ?? title;
        rootSlug = relation(data?.speaking_sets ?? null)?.slug ?? null;
      }

      const attempt = attemptBySection.get(section.id) ?? null;
      const params =
        context && attempt
          ? new URLSearchParams({
              mockTestSlug: context.mockTestSlug,
              mockSessionId: context.sessionId,
              mockSectionAttemptId: attempt.id,
            }).toString()
          : null;
      const practicePath =
        rootSlug && params
          ? `/practice/${section.section_type}/${rootSlug}?${params}`
          : null;

      let reviewPath: string | null = null;
      if (rootSlug && attempt?.status === "submitted") {
        if (
          (section.section_type === "reading" ||
            section.section_type === "listening") &&
          attempt.learner_attempt_id
        ) {
          reviewPath = `/practice/${section.section_type}/${rootSlug}/result/${attempt.learner_attempt_id}`;
        } else if (
          section.section_type === "writing" &&
          attempt.writing_submission_id
        ) {
          reviewPath = `/practice/writing/${rootSlug}/submission/${attempt.writing_submission_id}`;
        } else if (
          section.section_type === "speaking" &&
          attempt.speaking_attempt_id
        ) {
          reviewPath = `/practice/speaking/${rootSlug}/attempt/${attempt.speaking_attempt_id}`;
        }
      }

      return {
        id: section.id,
        type: section.section_type as MockSectionType,
        order: section.section_order,
        title,
        timeLimitSeconds: section.time_limit_seconds,
        required: section.required,
        attempt,
        practicePath,
        reviewPath,
      };
    }),
  );
}

export const getMockTestCatalog = cache(
  async (): Promise<MockCatalogItem[]> => {
    const { account } = await requireCompletedOnboarding();
    const supabase = await createSupabaseServerClient();
    const [{ data: versions, error }, { data: sessions }] = await Promise.all([
      supabase
        .from("mock_test_versions")
        .select(
          "id, mock_test_id, title, description, test_type, difficulty, estimated_minutes, mock_tests!inner(slug, display_order)",
        )
        .eq("status", "published"),
      supabase
        .from("mock_test_sessions")
        .select("id, mock_test_id, status")
        .eq("user_id", account.user.id)
        .in("status", ["in_progress", "submitted"]),
    ]);
    if (error) throw new Error("Không thể tải danh sách mock test.");

    const sessionByTest = new Map(
      (sessions ?? []).map((session) => [session.mock_test_id, session]),
    );
    return Promise.all(
      (versions ?? []).map(async (version) => {
        const root = relation(version.mock_tests);
        const { count } = await supabase
          .from("mock_test_sections")
          .select("id", { count: "exact", head: true })
          .eq("mock_test_version_id", version.id);
        const session = sessionByTest.get(version.mock_test_id);
        return {
          slug: root?.slug ?? "",
          title: version.title,
          description: version.description,
          testType: version.test_type,
          difficulty: version.difficulty,
          estimatedMinutes: version.estimated_minutes,
          sectionCount: count ?? 0,
          activeSessionId: session?.id ?? null,
          activeSessionStatus:
            (session?.status as MockSessionStatus | undefined) ?? null,
        };
      }),
    );
  },
);

export async function getMockTestDetail(
  slug: string,
): Promise<MockTestDetailData | null> {
  const { account } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data: test } = await supabase
    .from("mock_tests")
    .select("id, slug, display_order")
    .eq("slug", slug)
    .maybeSingle();
  if (!test) return null;
  const [{ data: version }, { data: activeSession }] = await Promise.all([
    supabase
      .from("mock_test_versions")
      .select("*")
      .eq("mock_test_id", test.id)
      .eq("status", "published")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("mock_test_sessions")
      .select("id, status")
      .eq("user_id", account.user.id)
      .eq("mock_test_id", test.id)
      .in("status", ["in_progress", "submitted"])
      .maybeSingle(),
  ]);
  if (!version) return null;
  const { data: sectionRows, error } = await supabase
    .from("mock_test_sections")
    .select("*")
    .eq("mock_test_version_id", version.id)
    .order("section_order");
  if (error) throw new Error("Không thể tải cấu trúc mock test.");
  return {
    test: { id: test.id, slug: test.slug, displayOrder: test.display_order },
    version,
    sections: await resolveSections(sectionRows ?? [], []),
    activeSessionId: activeSession?.id ?? null,
    activeSessionStatus:
      (activeSession?.status as MockSessionStatus | undefined) ?? null,
  };
}

export async function getMockSessionPage(
  slug: string,
  sessionId: string,
): Promise<MockSessionPageData | null> {
  const { account } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data: session } = await supabase
    .from("mock_test_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", account.user.id)
    .maybeSingle();
  if (!session) return null;
  const [
    { data: test },
    { data: version },
    { data: sectionRows },
    { data: attempts },
    { data: result },
  ] = await Promise.all([
    supabase
      .from("mock_tests")
      .select("id, slug, display_order")
      .eq("id", session.mock_test_id)
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("mock_test_versions")
      .select("*")
      .eq("id", session.mock_test_version_id)
      .maybeSingle(),
    supabase
      .from("mock_test_sections")
      .select("*")
      .eq("mock_test_version_id", session.mock_test_version_id)
      .order("section_order"),
    supabase
      .from("mock_test_section_attempts")
      .select("*")
      .eq("session_id", session.id),
    supabase
      .from("mock_test_results")
      .select("*")
      .eq("session_id", session.id)
      .maybeSingle(),
  ]);
  if (!test || !version || !sectionRows) return null;

  let writingEvaluation: MockWritingEvaluation | null = null;
  let speakingEvaluation: MockSpeakingEvaluation | null = null;

  if (result) {
    const [writingSubRes, writingFeedbackRes, speakingFeedbackRes] =
      await Promise.all([
        result.writing_submission_id
          ? supabase
              .from("writing_submissions")
              .select("id, word_count")
              .eq("id", result.writing_submission_id)
              .eq("user_id", account.user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        result.writing_submission_id
          ? supabase
              .from("writing_feedback")
              .select(
                "overall_band_estimate, task_response_band, coherence_cohesion_band, lexical_resource_band, grammatical_range_accuracy_band, confidence, summary",
              )
              .eq("submission_id", result.writing_submission_id)
              .eq("user_id", account.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        result.speaking_attempt_id
          ? supabase
              .from("speaking_feedback")
              .select(
                "estimated_overall_band, estimated_fluency_band, estimated_lexical_band, estimated_grammar_band, estimated_pronunciation_band, confidence, summary",
              )
              .eq("attempt_id", result.speaking_attempt_id)
              .eq("user_id", account.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

    if (result.writing_submission_id) {
      const wf = writingFeedbackRes.data;
      writingEvaluation = {
        submissionId: result.writing_submission_id,
        wordCount: writingSubRes.data?.word_count ?? 0,
        overallBandEstimate: wf ? Number(wf.overall_band_estimate) : null,
        taskResponseBand: wf ? Number(wf.task_response_band) : null,
        coherenceCohesionBand: wf ? Number(wf.coherence_cohesion_band) : null,
        lexicalResourceBand: wf ? Number(wf.lexical_resource_band) : null,
        grammaticalRangeBand: wf
          ? Number(wf.grammatical_range_accuracy_band)
          : null,
        confidence: wf?.confidence ?? null,
        summary: wf?.summary ?? null,
      };
    }

    if (result.speaking_attempt_id) {
      const sf = speakingFeedbackRes.data;
      speakingEvaluation = {
        attemptId: result.speaking_attempt_id,
        overallBandEstimate:
          sf?.estimated_overall_band != null
            ? Number(sf.estimated_overall_band)
            : null,
        fluencyBand:
          sf?.estimated_fluency_band != null
            ? Number(sf.estimated_fluency_band)
            : null,
        lexicalBand:
          sf?.estimated_lexical_band != null
            ? Number(sf.estimated_lexical_band)
            : null,
        grammarBand:
          sf?.estimated_grammar_band != null
            ? Number(sf.estimated_grammar_band)
            : null,
        pronunciationBand:
          sf?.estimated_pronunciation_band != null
            ? Number(sf.estimated_pronunciation_band)
            : null,
        confidence: sf?.confidence ?? null,
        summary: sf?.summary ?? null,
      };
    }
  }

  return {
    test: { id: test.id, slug: test.slug, displayOrder: test.display_order },
    version,
    sections: await resolveSections(sectionRows, attempts ?? [], {
      mockTestSlug: slug,
      sessionId,
    }),
    activeSessionId: session.id,
    activeSessionStatus: session.status as MockSessionStatus,
    session: {
      ...session,
      status: session.status as MockSessionStatus,
    },
    result: result ?? null,
    writingEvaluation,
    speakingEvaluation,
  };
}
