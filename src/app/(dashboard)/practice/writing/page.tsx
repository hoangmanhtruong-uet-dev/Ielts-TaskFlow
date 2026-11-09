import type { Metadata } from "next";

import { WritingHubClient } from "./client";
import {
  getWritingCatalog,
  getWritingHistoryDashboard,
} from "@/features/writing/server/content";
import { getCurrentLearnerProfile } from "@/features/onboarding/server/learner-profile";

export const metadata: Metadata = {
  title: "Zen Focus Writing Studio & Lexical Architecture | Indigo Scholar",
  description:
    "Trung tâm luyện viết IELTS Task 1 & Task 2 chuẩn học thuật Cambridge, bộ đếm từ vựng thời gian thực, ma trận liên từ Cohesion và Zen Focus Studio từ Band 5.0 đến 9.0.",
};

export default async function WritingCatalogPage() {
  const [items, submissions, profile] = await Promise.all([
    getWritingCatalog().catch(() => []),
    getWritingHistoryDashboard(24).catch(() => []),
    getCurrentLearnerProfile().catch(() => null),
  ]);

  const totalWords = submissions.reduce((sum, item) => sum + item.wordCount, 0);
  const ratedBands = submissions
    .map((item) => item.feedback?.overallBandEstimate)
    .filter((value): value is number => typeof value === "number");
  const avgScore = ratedBands.length
    ? Math.round(
        (ratedBands.reduce((sum, value) => sum + value, 0) /
          ratedBands.length) *
          2,
      ) / 2
    : null;
  const latestFeedback = submissions.find((item) => item.feedback)?.feedback;
  const latestCriteria = latestFeedback
    ? {
        taskResponse: latestFeedback.criteria.taskResponse.band,
        coherenceCohesion: latestFeedback.criteria.coherenceCohesion.band,
        lexicalResource: latestFeedback.criteria.lexicalResource.band,
        grammaticalRangeAccuracy:
          latestFeedback.criteria.grammaticalRangeAccuracy.band,
      }
    : null;

  return (
    <WritingHubClient
      items={items}
      submissionsCount={submissions.length}
      avgScore={avgScore}
      totalWords={totalWords}
      latestCriteria={latestCriteria}
      profile={
        profile
          ? {
              current_band: profile.current_band,
              target_band: profile.target_band,
              daily_study_minutes: profile.daily_study_minutes,
              target_exam_date: profile.target_exam_date,
            }
          : null
      }
    />
  );
}
