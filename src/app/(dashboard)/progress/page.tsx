import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";

import { ANALYTICS_SKILLS, SKILL_LABELS } from "@/features/analytics/model";
import { getLearnerAnalytics } from "@/features/analytics/server/content";
import { safeResolveTimezone } from "@/features/dashboard/server/dashboard-data";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { TrajectoryWeek } from "./components/ScoreTrajectory3D";
import type { SkillItem } from "./components/SkillRadar3D";
import { ProgressClient, type HeatmapCell, type TimeRangeData } from "./client";

export const metadata: Metadata = {
  title: "Báo cáo & Tiến độ học tập 3D | Indigo Scholar",
  description:
    "Phân tích hiệu suất học tập, xu hướng điểm số, cân bằng 6 kỹ năng IELTS và bản đồ hoạt động từ dữ liệu thực tế.",
};

function formatDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${m}m`;
}

function accuracyToBand(accuracyPercent: number): number {
  const raw = 4.0 + (Math.min(100, Math.max(0, accuracyPercent)) / 100) * 5.0;
  return Math.round(raw * 2) / 2;
}

function localDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export default async function ProgressPage() {
  const [{ account, learnerProfile }, analytics, cookieStore] =
    await Promise.all([
      requireCompletedOnboarding(),
      getLearnerAnalytics(20),
      cookies(),
    ]);

  const timeZone = safeResolveTimezone(
    cookieStore.get("x-user-timezone")?.value ?? account.profile?.timezone,
  );
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const days48AgoIso = new Date(now.getTime() - 48 * 86_400_000).toISOString();

  const [gamificationRes, xpEventsRes, attemptsRes, vaultRes, vocabSummaryRes] =
    await Promise.all([
      supabase
        .from("user_gamification")
        .select("current_streak, longest_streak, total_xp")
        .eq("user_id", account.user.id)
        .maybeSingle(),
      supabase
        .from("xp_events")
        .select("amount, created_at")
        .eq("user_id", account.user.id)
        .gte("created_at", days48AgoIso),
      supabase
        .from("learner_attempts")
        .select("started_at, submitted_at, score, max_score")
        .eq("user_id", account.user.id)
        .eq("is_mock", false)
        .not("submitted_at", "is", null),
      supabase
        .from("vocabulary_vault")
        .select("id", { count: "exact", head: true })
        .eq("user_id", account.user.id),
      supabase.rpc("get_vocabulary_progress_summary"),
    ]);

  const currentStreak = gamificationRes.data?.current_streak ?? 0;
  const lessonCompleted = analytics.overview.lessonCompleted;
  const lessonTotal = analytics.overview.lessonTotal;
  const lessonsPct = Math.round(analytics.overview.lessonProgressPercent);
  const targetBand = learnerProfile.target_band ?? null;

  // Compute hours from submitted practice attempts within window
  const attempts = attemptsRes.data ?? [];
  const minutesInWindow = (windowDays: number | null) => {
    const cutoff = windowDays ? now.getTime() - windowDays * 86_400_000 : 0;
    let total = 0;
    for (const att of attempts) {
      if (!att.started_at || !att.submitted_at) continue;
      const submittedMs = new Date(att.submitted_at).getTime();
      if (cutoff && submittedMs < cutoff) continue;
      const mins = Math.min(
        120,
        Math.max(
          1,
          Math.round(
            (submittedMs - new Date(att.started_at).getTime()) / 60_000,
          ),
        ),
      );
      total += mins;
    }
    return total;
  };

  // Build trajectory points strictly from real mock test history (oldest -> newest)
  const completedMocks = analytics.mockTests
    .filter((m) => m.status === "completed" || m.completedAt || m.submittedAt)
    .toSorted(
      (a, b) =>
        new Date(a.completedAt ?? a.submittedAt ?? a.startedAt).getTime() -
        new Date(b.completedAt ?? b.submittedAt ?? b.startedAt).getTime(),
    );

  const trajectoryWeeks: TrajectoryWeek[] = completedMocks
    .slice(-6)
    .map((mock, idx) => {
      const readingAcc =
        mock.readingMaxScore &&
        mock.readingMaxScore > 0 &&
        mock.readingScore !== null
          ? (mock.readingScore / mock.readingMaxScore) * 100
          : null;
      const listeningAcc =
        mock.listeningMaxScore &&
        mock.listeningMaxScore > 0 &&
        mock.listeningScore !== null
          ? (mock.listeningScore / mock.listeningMaxScore) * 100
          : null;
      const validAccs = [readingAcc, listeningAcc].filter(
        (v): v is number => v !== null,
      );
      const avgAcc =
        validAccs.length > 0
          ? validAccs.reduce((sum, v) => sum + v, 0) / validAccs.length
          : 0;
      const band =
        validAccs.length > 0
          ? accuracyToBand(avgAcc)
          : (learnerProfile.current_band ?? 4.0);
      return {
        id: idx,
        label: `Mock #${idx + 1}`,
        band,
        hours: mock.completedAt
          ? new Date(mock.completedAt).toLocaleDateString("vi-VN")
          : "",
        note: mock.title,
      };
    });

  // Compute overall projected band strictly from real skill progress or baseline profile
  const skillByKey = new Map(analytics.skills.map((s) => [s.skill, s]));
  const scoredBands = analytics.skills
    .filter((s) => s.scoredCount > 0 && s.accuracyPercent !== null)
    .map((s) => accuracyToBand(s.accuracyPercent as number));
  const projectedBand =
    scoredBands.length > 0
      ? Math.round(
          (scoredBands.reduce((sum, b) => sum + b, 0) / scoredBands.length) * 2,
        ) / 2
      : (learnerProfile.current_band ?? null);
  const totalScored = analytics.skills.reduce(
    (acc, s) => acc + s.scoredCount,
    0,
  );
  const confidenceLabel =
    totalScored >= 6
      ? "Cao (≥6 bài chấm điểm)"
      : totalScored >= 1
        ? "Sơ bộ"
        : "Chưa đủ dữ liệu";

  const makeRange = (days: number | null, sub: string): TimeRangeData => ({
    hours: formatDuration(minutesInWindow(days)),
    hoursSub: sub,
    lessons: lessonCompleted,
    lessonTotal,
    lessonsPct,
    band: projectedBand !== null ? projectedBand.toFixed(1) : "—",
    bandBadge:
      totalScored > 0 ? `${totalScored} bài chấm điểm` : "Chưa đánh giá",
    confidence: confidenceLabel,
    streak: `${currentStreak} Ngày`,
    weeks: trajectoryWeeks,
  });

  const ranges: Record<"7d" | "30d" | "all", TimeRangeData> = {
    "7d": makeRange(7, "Thời gian làm bài 7 ngày qua"),
    "30d": makeRange(30, "Thời gian làm bài 30 ngày qua"),
    all: makeRange(null, "Tổng thời gian ghi nhận"),
  };

  // Map 6 core skills without fabricated scores
  const skills: SkillItem[] = ANALYTICS_SKILLS.map((skillKey) => {
    const stat = skillByKey.get(skillKey);
    const hasScore = Boolean(
      stat && stat.scoredCount > 0 && stat.accuracyPercent !== null,
    );
    const acc = hasScore ? Math.round(stat?.accuracyPercent ?? 0) : 0;
    const band = hasScore ? accuracyToBand(acc) : null;
    const status = !hasScore
      ? "Chưa đánh giá"
      : acc >= 75
        ? "Điểm mạnh"
        : acc >= 55
          ? "Ổn định"
          : "Cần chú ý";
    const isStrong = acc >= 75;
    const isOk = acc >= 55;
    return {
      id: skillKey === "vocabulary" ? "vocab" : skillKey,
      name: SKILL_LABELS[skillKey],
      scrollLabel: skillKey === "vocabulary" ? "Vocab" : undefined,
      band,
      progress: acc,
      status,
      barColor: !hasScore
        ? "bg-slate-600"
        : isStrong
          ? "bg-emerald-500"
          : isOk
            ? "bg-indigo-500"
            : "bg-amber-500",
      badgeClass: !hasScore
        ? "bg-slate-900 text-slate-300 border-slate-700"
        : isStrong
          ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/30"
          : isOk
            ? "bg-indigo-950/90 text-indigo-300 border-indigo-500/40"
            : "bg-amber-950/90 text-amber-400 border-amber-500/30",
      statusClass: !hasScore
        ? "text-slate-400"
        : isStrong
          ? "text-emerald-400"
          : isOk
            ? "text-indigo-400"
            : "text-amber-500",
    };
  });

  // Build real 48-day activity heatmap from xp_events & practice attempts
  const xpByDay = new Map<string, number>();
  for (const ev of xpEventsRes.data ?? []) {
    if (!ev.created_at) continue;
    const key = localDateKey(new Date(ev.created_at), timeZone);
    xpByDay.set(key, (xpByDay.get(key) ?? 0) + (ev.amount ?? 0));
  }

  const minsByDay = new Map<string, number>();
  for (const att of attempts) {
    if (!att.started_at || !att.submitted_at) continue;
    const key = localDateKey(new Date(att.submitted_at), timeZone);
    const mins = Math.min(
      120,
      Math.max(
        1,
        Math.round(
          (new Date(att.submitted_at).getTime() -
            new Date(att.started_at).getTime()) /
            60_000,
        ),
      ),
    );
    minsByDay.set(key, (minsByDay.get(key) ?? 0) + mins);
  }

  const heatmapDays: HeatmapCell[] = [];
  for (let offset = -47; offset <= 0; offset += 1) {
    const d = new Date(now.getTime() + offset * 86_400_000);
    const key = localDateKey(d, timeZone);
    const dayXp = xpByDay.get(key) ?? 0;
    const dayMins = minsByDay.get(key) ?? 0;
    const level =
      dayXp >= 100 || dayMins >= 60
        ? 3
        : dayXp >= 30 || dayMins >= 25
          ? 2
          : dayXp > 0 || dayMins > 0
            ? 1
            : 0;
    heatmapDays.push({
      date: key,
      minutes: dayMins,
      xp: dayXp,
      level,
    });
  }

  const vocabRow = vocabSummaryRes.data?.[0];
  const vocabSummary = {
    savedTerms: vaultRes.count ?? 0,
    dueReview: Number(vocabRow?.reviewing ?? 0),
    mastered: Number(vocabRow?.mastered ?? 0),
  };

  const firstWeak = analytics.weakAreas[0];
  const weakArea = firstWeak
    ? {
        skill: firstWeak.skill,
        label: SKILL_LABELS[firstWeak.skill],
        accuracyPercent: Math.round(firstWeak.accuracyPercent ?? 0),
      }
    : null;

  const updatedLabel = new Intl.DateTimeFormat("vi-VN", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0e15]" />}>
      <ProgressClient
        ranges={ranges}
        skills={skills}
        heatmapDays={heatmapDays}
        vocabSummary={vocabSummary}
        weakArea={weakArea}
        targetBand={targetBand}
        lastUpdatedLabel={updatedLabel}
      />
    </Suspense>
  );
}
