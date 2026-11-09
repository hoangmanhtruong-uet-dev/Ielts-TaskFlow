import { cache } from "react";

import {
  getWeakAreas,
  isAnalyticsSkill,
  isFeedbackStatus,
  type LearnerProgressOverview,
  type MockTestHistory,
  type RecentActivity,
  type SkillProgress,
} from "@/features/analytics/model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";

export class AnalyticsReadError extends Error {
  constructor() {
    super("Không thể tải dữ liệu tiến độ lúc này.");
    this.name = "AnalyticsReadError";
  }
}

const emptyOverview: LearnerProgressOverview = {
  lessonTotal: 0,
  lessonCompleted: 0,
  lessonInProgress: 0,
  lessonProgressPercent: 0,
  activePractice: 0,
  activeWriting: 0,
  activeSpeaking: 0,
  activeMockTests: 0,
  completedMockTests: 0,
};

export const getLearnerAnalytics = cache(async (limit = 8) => {
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const safeLimit = Math.min(20, Math.max(1, Math.trunc(limit)));
  const [overviewResult, skillsResult, activityResult, mockResult] =
    await Promise.all([
      supabase.rpc("get_learner_progress_overview"),
      supabase.rpc("get_learner_skill_progress"),
      supabase.rpc("get_learner_recent_activity", { p_limit: safeLimit }),
      supabase.rpc("get_learner_mock_test_history", { p_limit: safeLimit }),
    ]);

  if (
    overviewResult.error ||
    skillsResult.error ||
    activityResult.error ||
    mockResult.error
  ) {
    console.error(
      JSON.stringify({
        event: "analytics.rpc_failed",
        overview: overviewResult.error
          ? { code: overviewResult.error.code }
          : null,
        skills: skillsResult.error ? { code: skillsResult.error.code } : null,
        activity: activityResult.error
          ? { code: activityResult.error.code }
          : null,
        mock: mockResult.error ? { code: mockResult.error.code } : null,
      }),
    );
    throw new AnalyticsReadError();
  }

  const overviewRow = overviewResult.data[0];
  const overview: LearnerProgressOverview = overviewRow
    ? {
        lessonTotal: overviewRow.lesson_total,
        lessonCompleted: overviewRow.lesson_completed,
        lessonInProgress: overviewRow.lesson_in_progress,
        lessonProgressPercent: overviewRow.lesson_progress_percent,
        activePractice: overviewRow.active_practice,
        activeWriting: overviewRow.active_writing,
        activeSpeaking: overviewRow.active_speaking,
        activeMockTests: overviewRow.active_mock_tests,
        completedMockTests: overviewRow.completed_mock_tests,
      }
    : emptyOverview;

  const skills: SkillProgress[] = skillsResult.data.flatMap((row) => {
    if (!isAnalyticsSkill(row.skill)) return [];
    return [
      {
        skill: row.skill,
        activityCount: row.activity_count,
        scoredCount: row.scored_count,
        totalScore: row.total_score,
        totalMaxScore: row.total_max_score,
        accuracyPercent: row.accuracy_percent,
        latestActivityAt: row.latest_activity_at,
        feedbackStatus: isFeedbackStatus(row.feedback_status)
          ? row.feedback_status
          : null,
      },
    ];
  });

  const recentActivity: RecentActivity[] = activityResult.data.map((row) => ({
    activityType: row.activity_type,
    skill: row.skill,
    entityId: row.entity_id,
    title: row.title,
    status: row.status,
    occurredAt: row.occurred_at,
    href: row.href,
    score: row.score,
    maxScore: row.max_score,
    feedbackStatus: isFeedbackStatus(row.feedback_status)
      ? row.feedback_status
      : null,
  }));

  const mockTests: MockTestHistory[] = mockResult.data.map((row) => ({
    sessionId: row.session_id,
    mockTestSlug: row.mock_test_slug,
    title: row.title,
    status: row.status,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    completedAt: row.completed_at,
    readingScore: row.reading_score,
    readingMaxScore: row.reading_max_score,
    listeningScore: row.listening_score,
    listeningMaxScore: row.listening_max_score,
    href: row.href,
  }));

  return {
    overview,
    skills,
    recentActivity,
    mockTests,
    weakAreas: getWeakAreas(skills),
  };
});

export type LearnerAnalytics = Awaited<ReturnType<typeof getLearnerAnalytics>>;
