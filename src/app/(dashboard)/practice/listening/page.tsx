import type { Metadata } from "next";

import { ListeningHubClient } from "./client";
import { getListeningCatalog } from "@/features/listening/server/content";
import { getRecentAttemptHistory } from "@/features/practice/server/content";
import { getCurrentLearnerProfile } from "@/features/onboarding/server/learner-profile";

export const metadata: Metadata = {
  title: "Luyện Nghe IELTS Toàn Diện (Listening Hub) | Indigo Scholar",
  description:
    "Trung tâm luyện nghe IELTS đa cấp độ từ Band 0.0 đến 9.0 với 4 chế độ: Dictation, Speed Run, Luyện giọng Accents và Full Test.",
};

export default async function ListeningCatalogPage() {
  const [items, history, profile] = await Promise.all([
    getListeningCatalog().catch(() => []),
    getRecentAttemptHistory(100).catch(() => []),
    getCurrentLearnerProfile().catch(() => null),
  ]);

  const attempts = history.filter((item) => item.domain === "listening");
  const score = attempts.reduce((sum, item) => sum + item.score, 0);
  const maximum = attempts.reduce((sum, item) => sum + item.maxScore, 0);
  const accuracy = maximum ? Math.round((score / maximum) * 100) : null;

  return (
    <ListeningHubClient
      items={items}
      accuracy={accuracy}
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
