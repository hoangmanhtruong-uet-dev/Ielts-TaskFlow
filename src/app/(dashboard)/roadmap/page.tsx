import type { Metadata } from "next";
import { Suspense } from "react";

import { getLearnerAnalytics } from "@/features/analytics/server/content";
import { getLearningCatalog } from "@/features/learning/server/content";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";

import type { RoadmapNode } from "./components/RoadmapTree3D";
import { RoadmapClient } from "./client";

export const metadata: Metadata = {
  title: "Bản đồ lộ trình cá nhân hóa | Indigo Scholar",
  description:
    "Bản đồ lộ trình học tập từ dữ liệu mục tiêu cá nhân, tiến độ mô-đun và năng lực kỹ năng thực tế.",
};

function difficultyToPhase(
  difficulty: string,
  index: number,
): { phase: number; title: string } {
  if (difficulty === "beginner" || index < 3) {
    return { phase: 1, title: "Phase 1: Nền tảng & Từ vựng/Ngữ pháp" };
  }
  if (difficulty === "intermediate" || index < 6) {
    return { phase: 2, title: "Phase 2: Củng cố kỹ năng IELTS" };
  }
  return { phase: 3, title: "Phase 3: Luyện đề chuyên sâu" };
}

export default async function RoadmapPage() {
  const [{ learnerProfile }, catalog, analytics] = await Promise.all([
    requireCompletedOnboarding(),
    getLearningCatalog(),
    getLearnerAnalytics(8),
  ]);

  const targetBand =
    learnerProfile.target_band != null
      ? String(learnerProfile.target_band)
      : "6.5";
  const currentBand =
    learnerProfile.current_band != null
      ? String(learnerProfile.current_band)
      : "Chưa đánh giá";
  const targetExamDate = learnerProfile.target_exam_date
    ? String(learnerProfile.target_exam_date)
    : "";
  const initialDailyMinutes = learnerProfile.daily_study_minutes
    ? Number(learnerProfile.daily_study_minutes)
    : 30;

  const slicedCatalog = catalog.slice(0, 9);
  const firstActiveIndex = slicedCatalog.findIndex(
    (mod) =>
      !(mod.totalLessons > 0 && mod.completedLessons === mod.totalLessons),
  );
  const nodes: RoadmapNode[] = slicedCatalog.map((mod, idx) => {
    const pct = Math.round(mod.progressPercent);
    const isCompleted =
      mod.totalLessons > 0 && mod.completedLessons === mod.totalLessons;
    const status: RoadmapNode["status"] = isCompleted
      ? "completed"
      : idx === firstActiveIndex
        ? "active"
        : "upcoming";

    const { phase, title: phaseTitle } = difficultyToPhase(mod.difficulty, idx);
    const x = -12 + idx * 3;
    const y = 0.8 + idx * 0.45;
    const z = idx % 2 === 0 ? 2.5 : -1.5;

    return {
      id: mod.id,
      phase,
      phaseTitle,
      title: mod.title,
      subtitle: `${mod.completedLessons}/${mod.totalLessons} bài đã hoàn thành • ~${mod.estimatedMinutes} phút`,
      score: isCompleted
        ? "Hoàn thành 100%"
        : pct > 0
          ? `Đang học (${pct}%)`
          : "Chưa bắt đầu",
      progressPercent: pct,
      status,
      pos: [x, y, z],
      color: isCompleted ? 0x10b981 : status === "active" ? 0x6366f1 : 0x38bdf8,
      targetHref: `/learn/${mod.slug}`,
    };
  });

  const remainingMinutes = catalog.reduce(
    (sum, mod) => sum + mod.estimatedMinutes * (1 - mod.progressPercent / 100),
    0,
  );
  const estimatedHoursRemaining = Math.max(
    1,
    Math.round(remainingMinutes / 60),
  );

  const skillByName = new Map(analytics.skills.map((s) => [s.skill, s]));
  const skillScore = (
    name: "listening" | "reading" | "writing" | "speaking",
  ): number | null => {
    const entry = skillByName.get(name);
    if (!entry || entry.scoredCount === 0 || entry.accuracyPercent === null)
      return null;
    return Math.round(entry.accuracyPercent);
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0d14]" />}>
      <RoadmapClient
        targetBand={targetBand}
        currentBand={currentBand}
        targetExamDate={targetExamDate}
        initialDailyMinutes={initialDailyMinutes}
        nodes={nodes}
        estimatedHoursRemaining={estimatedHoursRemaining}
        skillReadiness={{
          listening: skillScore("listening"),
          reading: skillScore("reading"),
          writing: skillScore("writing"),
          speaking: skillScore("speaking"),
        }}
      />
    </Suspense>
  );
}
