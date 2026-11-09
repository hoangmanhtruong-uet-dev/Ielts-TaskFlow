import type { Metadata } from "next";
import { Suspense } from "react";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { getLearningOverview } from "@/features/learning/server/content";
import { LearnClient } from "./client";

export const metadata: Metadata = {
  title: "Thư viện học | Indigo Scholar",
  description: "Chọn một kỹ năng IELTS để luyện, hoặc làm tiếp bài đang dở.",
};

export default async function LearnPage() {
  const [_, overview] = await Promise.all([
    requireCompletedOnboarding(),
    getLearningOverview(),
  ]);

  const continueLessonData = overview.continueLesson ?? overview.nextLesson;
  const continueLesson = continueLessonData
    ? {
        title:
          continueLessonData.title ||
          continueLessonData.moduleTitle ||
          "Tiếp tục lộ trình IELTS",
        progressPercent: Math.round(continueLessonData.progressPercent ?? 0),
        href:
          continueLessonData.slug && continueLessonData.moduleSlug
            ? `/learn/${continueLessonData.moduleSlug}/${continueLessonData.slug}`
            : "/practice/listening",
      }
    : undefined;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0E1D]" />}>
      <LearnClient continueLesson={continueLesson} />
    </Suspense>
  );
}
