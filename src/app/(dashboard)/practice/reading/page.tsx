import type { Metadata } from "next";

import { ReadingHubClient } from "./client";
import { getReadingCatalog } from "@/features/reading/server/content";
import { getRecentAttemptHistory } from "@/features/practice/server/content";
import { getCurrentLearnerProfile } from "@/features/onboarding/server/learner-profile";

export const metadata: Metadata = {
  title: "Luyện Đọc IELTS Toàn Diện (Reading Hub) | Indigo Scholar",
  description:
    "Trung tâm luyện đọc hiểu IELTS chuẩn format Cambridge từ Band 4.5 đến 9.0 với Speed Reading WPM meter, bóc tách bẫy True/False/Not Given và Split-View Reader.",
};

export default async function ReadingCatalogPage() {
  const [items, history, profile] = await Promise.all([
    getReadingCatalog().catch(() => []),
    getRecentAttemptHistory(100).catch(() => []),
    getCurrentLearnerProfile().catch(() => null),
  ]);

  const attempts = history.filter((item) => item.domain === "reading");
  const score = attempts.reduce((sum, item) => sum + item.score, 0);
  const maximum = attempts.reduce((sum, item) => sum + item.maxScore, 0);
  const comprehensionRate = maximum
    ? Math.round((score / maximum) * 100)
    : null;

  return (
    <ReadingHubClient
      items={items}
      comprehensionRate={comprehensionRate}
      attemptsCount={attempts.length}
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
