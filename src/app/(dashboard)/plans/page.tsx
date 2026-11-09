import type { Metadata } from "next";
import { Suspense } from "react";

import { getLearningOverview } from "@/features/learning/server/content";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";

import { PlansClient, stageOf } from "./client";

export const metadata: Metadata = {
  title: "Lộ trình khóa học chi tiết | Indigo Scholar",
  description:
    "Kế hoạch học tập từng chặng, cá nhân hóa theo trình độ khởi điểm, thời gian rảnh và mục tiêu band điểm của bạn.",
};

export default async function PlansPage() {
  const [{ learnerProfile }, overview] = await Promise.all([
    requireCompletedOnboarding(),
    getLearningOverview(),
  ]);

  const initialBand =
    learnerProfile.current_band != null
      ? Number(learnerProfile.current_band)
      : 2.0;
  const initialEnrolledId = stageOf(initialBand) + 1;
  const realProgress = Math.round(overview.progressPercent ?? 0);
  const initialProg = { [initialEnrolledId]: realProgress };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0E1D]" />}>
      <PlansClient
        initialBand={initialBand}
        initialEnrolledId={initialEnrolledId}
        initialProg={initialProg}
      />
    </Suspense>
  );
}
