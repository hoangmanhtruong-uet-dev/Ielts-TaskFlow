import type { Metadata } from "next";

import { SpeakingHubClient } from "./client";
import {
  getSpeakingCatalog,
  getSpeakingDashboardData,
} from "@/features/speaking/server/content";
import { getCurrentLearnerProfile } from "@/features/onboarding/server/learner-profile";

export const metadata: Metadata = {
  title: "AI Speaking Studio & Acoustic Resonance | Indigo Scholar",
  description:
    "Trung tâm luyện nói IELTS phản xạ cao, chấm âm vị ngữ âm IPA, kiểm soát từ đệm và phòng thu âm tương tác 3D chuẩn Cambridge từ Band 5.0 đến 9.0.",
};

export default async function SpeakingCatalogPage() {
  const [items, attempts, profile] = await Promise.all([
    getSpeakingCatalog().catch(() => []),
    getSpeakingDashboardData(24).catch(() => []),
    getCurrentLearnerProfile().catch(() => null),
  ]);

  const latestFeedbackAttempt = attempts.find(
    (item) => item.feedback,
  )?.feedback;

  const latestFeedback = latestFeedbackAttempt
    ? {
        pronunciationBand: latestFeedbackAttempt.estimatedPronunciationBand,
        fluencyBand: latestFeedbackAttempt.estimatedFluencyBand,
        lexicalBand: latestFeedbackAttempt.estimatedLexicalBand,
        grammarBand: latestFeedbackAttempt.estimatedGrammarBand,
      }
    : null;

  return (
    <SpeakingHubClient
      items={items}
      attemptsCount={attempts.length}
      latestFeedback={latestFeedback}
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
