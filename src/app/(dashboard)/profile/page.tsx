import {
  Flame,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getAccountLabel } from "@/features/auth/server/account";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { DeleteAccountCard } from "@/features/profile/components/delete-account-card";
import { LearningPreferencesForm } from "@/features/profile/components/learning-preferences-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Hồ sơ & Cài đặt tài khoản",
  description:
    "Quản lý thông tin cá nhân, mục tiêu IELTS, hạn mức AI thực tế và quyền dữ liệu cá nhân.",
};

type AiQuotaUsage = {
  tier: "free" | "pro";
  weeklyLimitPerSkill: number;
  writingUsedWeekly: number;
  writingUsedToday: number;
  speakingUsedWeekly: number;
  speakingUsedToday: number;
};

function resolveCefrBadge(band: number | null) {
  if (band === null || band < 3.5) return "A1";
  if (band < 4.5) return "A2";
  if (band < 5.5) return "B1";
  if (band < 7.0) return "B2";
  if (band < 8.5) return "C1";
  return "C2";
}

function getDaysUntilExam(targetExamDate: string | null) {
  if (!targetExamDate) return null;
  const parsed = new Date(`${targetExamDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays;
}

export default async function ProfilePage() {
  const { account, learnerProfile } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();

  const [gamificationRes, quotaRes] = await Promise.all([
    supabase
      .from("user_gamification")
      .select(
        "total_xp, current_level, current_streak, longest_streak, streak_freezes_available",
      )
      .eq("user_id", account.user.id)
      .maybeSingle(),
    supabase.rpc("get_learner_ai_quota_usage"),
  ]);

  const displayName =
    account.profile?.display_name?.trim() || getAccountLabel(account);
  const currentBand =
    learnerProfile.current_band === null
      ? null
      : Number(learnerProfile.current_band);
  const targetBand =
    learnerProfile.target_band === null
      ? null
      : Number(learnerProfile.target_band);

  const gamification = gamificationRes.data as {
    total_xp?: number;
    current_level?: number;
    current_streak?: number;
    longest_streak?: number;
    streak_freezes_available?: number;
  } | null;

  const currentStreak = Math.max(0, Number(gamification?.current_streak ?? 0));
  const totalXp = Math.max(0, Number(gamification?.total_xp ?? 0));
  const cefrCode = resolveCefrBadge(currentBand);
  const daysToExam = getDaysUntilExam(learnerProfile.target_exam_date);

  const rawQuota = (quotaRes.data ?? null) as Partial<AiQuotaUsage> | null;
  const quota: AiQuotaUsage = {
    tier: rawQuota?.tier === "pro" ? "pro" : "free",
    weeklyLimitPerSkill: Math.max(
      1,
      Number(rawQuota?.weeklyLimitPerSkill ?? 5),
    ),
    writingUsedWeekly: Math.max(0, Number(rawQuota?.writingUsedWeekly ?? 0)),
    writingUsedToday: Math.max(0, Number(rawQuota?.writingUsedToday ?? 0)),
    speakingUsedWeekly: Math.max(0, Number(rawQuota?.speakingUsedWeekly ?? 0)),
    speakingUsedToday: Math.max(0, Number(rawQuota?.speakingUsedToday ?? 0)),
  };

  const writingPercent = Math.min(
    100,
    Math.round((quota.writingUsedWeekly / quota.weeklyLimitPerSkill) * 100),
  );
  const speakingPercent = Math.min(
    100,
    Math.round((quota.speakingUsedWeekly / quota.weeklyLimitPerSkill) * 100),
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] px-4 pt-6 pb-16 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header Profile Card */}
        <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
          <div className="h-36 w-full bg-gradient-to-r from-[#4338ca] to-[#3b82f6]" />
          <div className="flex flex-col gap-5 p-6 pt-0 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative -mt-14 inline-block w-fit">
                <div className="grid size-28 place-items-center rounded-full border-4 border-white bg-[#efedff] text-[#4338CA] shadow-md">
                  <UserRound size={44} aria-hidden="true" />
                </div>
                <span className="absolute bottom-1 left-0 rounded-full border-2 border-white bg-[#4338CA] px-2.5 py-0.5 text-xs font-bold text-white">
                  {cefrCode}
                </span>
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[var(--foreground)]">
                    {displayName}
                  </h1>
                  <span className="rounded-full bg-[#efedff] px-2.5 py-0.5 text-xs font-bold text-[#4338CA]">
                    {quota.tier === "pro" ? "Gói Pro" : "Tài khoản Học viên"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {account.user.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Target
                      size={15}
                      className="text-[#4338CA]"
                      aria-hidden="true"
                    />
                    Mục tiêu:{" "}
                    <strong className="text-[var(--foreground)]">
                      {targetBand !== null
                        ? `IELTS ${targetBand.toFixed(1)}`
                        : "Chưa đặt band"}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame
                      size={15}
                      className="text-[#F59E0B]"
                      aria-hidden="true"
                    />
                    Chuỗi học:{" "}
                    <strong className="text-[var(--foreground)]">
                      {currentStreak} ngày
                    </strong>
                  </span>
                  <span>
                    XP tích lũy:{" "}
                    <strong className="text-[var(--foreground)]">
                      {totalXp.toLocaleString("vi-VN")} XP
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <Link
                href="/placement-test"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <GraduationCap size={16} aria-hidden="true" />
                Kiểm tra trình độ
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4338CA] px-4 py-2 text-sm font-bold text-white hover:bg-[#3730a3]"
              >
                <Sparkles size={16} aria-hidden="true" />
                Xem gói học tập
              </Link>
            </div>
          </div>
        </section>

        {/* 2-Column Layout (Note: AppShell already wraps inside <main id="main-content">) */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <nav
              aria-label="Điều hướng cài đặt hồ sơ"
              className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
            >
              <a
                href="#account-profile"
                className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold whitespace-nowrap text-[var(--foreground)] shadow-sm hover:bg-[#efedff] hover:text-[#4338CA]"
              >
                <UserRound size={18} aria-hidden="true" /> Thông tin tài khoản
              </a>
              <a
                href="#learning-goals"
                className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold whitespace-nowrap text-[var(--foreground)] shadow-sm hover:bg-[#efedff] hover:text-[#4338CA]"
              >
                <Target size={18} aria-hidden="true" /> Mục tiêu &amp; Lộ trình
              </a>
              <a
                href="#ai-quota"
                className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold whitespace-nowrap text-[var(--foreground)] shadow-sm hover:bg-[#efedff] hover:text-[#4338CA]"
              >
                <Sparkles size={18} aria-hidden="true" /> Hạn mức AI tuần này
              </a>
              <a
                href="#account-deletion"
                className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold whitespace-nowrap text-[#dc2626] shadow-sm hover:bg-[#fef2f2]"
              >
                <ShieldAlert size={18} aria-hidden="true" /> Xóa tài khoản
              </a>
            </nav>
          </aside>

          <div className="space-y-6 lg:col-span-9">
            {/* Section 1: Profile Form */}
            <section
              id="account-profile"
              className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Thông tin cá nhân
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Tên hiển thị được đồng bộ trên toàn bộ bảng điều khiển và hồ
                    sơ học tập của bạn.
                  </p>
                </div>
                <span className="rounded-lg bg-[#fbf9ff] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                  Múi giờ:{" "}
                  <strong className="text-[var(--foreground)]">
                    {account.profile?.timezone || "Asia/Ho_Chi_Minh"}
                  </strong>
                </span>
              </div>

              <ProfileForm displayName={displayName} />
            </section>

            {/* Section 2: Learning Goals Form */}
            <section
              id="learning-goals"
              className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Kỳ thi &amp; Mục tiêu học tập
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Cấu hình trực tiếp mục tiêu band, ngày thi dự kiến và kỹ
                    năng ưu tiên.
                  </p>
                </div>
                {daysToExam !== null ? (
                  <span className="rounded-full bg-[#efedff] px-3 py-1 text-xs font-bold text-[#4338CA]">
                    {daysToExam >= 0
                      ? `Còn ${daysToExam} ngày đến kỳ thi dự kiến`
                      : "Ngày thi dự kiến đã qua"}
                  </span>
                ) : null}
              </div>

              <LearningPreferencesForm profile={learnerProfile} />
            </section>

            {/* Section 3: Real AI Quota */}
            <section
              id="ai-quota"
              className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    Hạn mức chấm bài AI (7 ngày gần nhất)
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Số liệu thực tế từ lượt gửi chấm Writing AI và Speaking AI
                    của bạn.
                  </p>
                </div>
                <span className="rounded-full bg-[#efedff] px-3 py-1 text-xs font-bold text-[#4338CA]">
                  {quota.tier === "pro"
                    ? "Gói Pro (50/tuần)"
                    : "Gói Free (5/tuần)"}
                </span>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[#fbf9ff] p-5">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>Writing AI Feedback</span>
                    <span className="text-[#4338CA]">
                      {quota.writingUsedWeekly} / {quota.weeklyLimitPerSkill}{" "}
                      lượt
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-[#4338CA]"
                      style={{ width: `${writingPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Hôm nay đã dùng: {quota.writingUsedToday} lượt
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[#fbf9ff] p-5">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>Speaking AI Feedback</span>
                    <span className="text-[#4338CA]">
                      {quota.speakingUsedWeekly} / {quota.weeklyLimitPerSkill}{" "}
                      lượt
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full bg-[#4338CA]"
                      style={{ width: `${speakingPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Hôm nay đã dùng: {quota.speakingUsedToday} lượt
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Self-Service DSR Account Deletion */}
            <DeleteAccountCard email={account.user.email} />
          </div>
        </div>
      </div>
    </div>
  );
}
