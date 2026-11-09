"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Play,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { formatSkillLabel, getLevelBadge, type CoursePlan } from "../model";

export function CoursePlanDetail({ plan }: { plan: CoursePlan }) {
  const router = useRouter();
  const badge = getLevelBadge(plan.level);

  // Interactive study time simulator
  const [dailyMins, setDailyMins] = useState<number>(plan.recommendedDailyMins);
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);

  // Dynamic calculations based on simulator
  const calculatedDays = Math.ceil(
    (plan.totalDays * plan.recommendedDailyMins) / dailyMins,
  );
  const [mountNowMs] = useState(() => Date.now());
  const formattedFinishDate = useMemo(() => {
    const finishDate = new Date(mountNowMs);
    finishDate.setDate(finishDate.getDate() + calculatedDays);
    return finishDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [calculatedDays, mountNowMs]);

  const activatePlan = () => {
    setIsActivated(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("active_course_plan", JSON.stringify(plan));
        // Also map to stage ID 1-6 for plans.enrolled in localStorage
        const stageMatch = plan.slug.match(/stage-(\d+)/);
        if (stageMatch) {
          localStorage.setItem(
            "plans.enrolled",
            JSON.stringify(Number(stageMatch[1])),
          );
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="animate-in fade-in mx-auto max-w-[1240px] space-y-10 px-4 py-8 pb-24 text-[#EEF0FF] duration-300 sm:px-8">
      {/* Top Back Navigation */}
      <button
        onClick={() => router.push("/plans")}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#98A0CF] transition-colors hover:text-[#EEF0FF]"
      >
        <ArrowLeft size={16} /> Trở về danh sách Lộ trình
      </button>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#2B3060] bg-gradient-to-br from-[#141731] via-[#1B1F40] to-[#141731] p-8 text-[#EEF0FF] shadow-2xl sm:p-12">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-extrabold ${badge.color}`}
            >
              {badge.label}
            </span>
            <span className="rounded-full border border-[#5B5FEF]/30 bg-[#5B5FEF]/20 px-3 py-1 text-xs font-bold text-[#EEF0FF]">
              {plan.durationWeeks} Tuần ({plan.totalDays} Ngày)
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#F6E85C]/20 bg-[#F6E85C]/10 px-3 py-1 text-xs font-bold text-[#F6E85C]">
              <Users size={14} />{" "}
              {plan.enrolledLearnersCount.toLocaleString("vi-VN")} Học viên đang
              học
            </span>
          </div>

          <div>
            <h1 className="text-3xl leading-tight font-black text-[#EEF0FF] sm:text-5xl">
              {plan.title}
            </h1>
            <p className="mt-2 text-base font-bold text-[#98A0CF] sm:text-lg">
              {plan.subtitle}
            </p>
          </div>

          <p className="max-w-3xl text-sm leading-relaxed text-[#98A0CF]">
            {plan.description}
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/60 p-4">
              <span className="block text-[10px] font-bold text-[#98A0CF] uppercase">
                Trình độ đầu vào
              </span>
              <span className="text-sm font-black text-[#EEF0FF]">
                {plan.startingLevel}
              </span>
            </div>
            <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/60 p-4">
              <span className="block text-[10px] font-bold text-[#98A0CF] uppercase">
                Band điểm mục tiêu
              </span>
              <span className="text-sm font-black text-[#F6E85C]">
                {plan.targetBand}
              </span>
            </div>
            <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/60 p-4">
              <span className="block text-[10px] font-bold text-[#98A0CF] uppercase">
                Thời lượng gợi ý
              </span>
              <span className="text-sm font-black text-[#5EE0A0]">
                {plan.recommendedDailyMins} phút/ngày
              </span>
            </div>
            <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/60 p-4">
              <span className="block text-[10px] font-bold text-[#98A0CF] uppercase">
                Tỷ lệ hoàn thành
              </span>
              <span className="text-sm font-black text-[#7C80FF]">
                {plan.completionRatePercent}% thành công
              </span>
            </div>
          </div>

          {/* Activate Button */}
          <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
            <button
              onClick={activatePlan}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-black shadow-xl transition-all sm:w-auto ${
                isActivated
                  ? "bg-[#5EE0A0] text-[#0C0E1D] shadow-[#5EE0A0]/20"
                  : "bg-[#F6E85C] text-[#0C0E1D] shadow-[#F6E85C]/20 hover:scale-105 hover:bg-[#F6E85C]/90"
              }`}
            >
              {isActivated ? (
                <>
                  <CheckCircle2 size={20} /> Lộ Trình Đã Được Kích Hoạt!
                </>
              ) : (
                <>
                  <Zap size={20} /> Kích Hoạt Lộ Trình Này Làm Kế Hoạch Chính
                </>
              )}
            </button>
            {isActivated && (
              <p className="flex items-center gap-1 text-xs font-bold text-[#5EE0A0]">
                <Check size={14} /> Hệ thống đã cập nhật bài học hàng ngày lên
                Dashboard & Roadmap của bạn.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Study Time Simulator */}
      <section className="space-y-6 rounded-3xl border border-[#2B3060] bg-[#141731] p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold tracking-wider text-[#7C80FF] uppercase">
              AI Simulator
            </span>
            <h2 className="flex items-center gap-2 text-xl font-black text-[#EEF0FF]">
              <Sparkles className="text-[#F6E85C]" size={20} /> Mô Phỏng Tốc Độ
              Học & Ngày Cán Đích
            </h2>
          </div>
          <span className="rounded-full border border-[#5B5FEF]/30 bg-[#5B5FEF]/20 px-3 py-1 text-xs font-bold text-[#EEF0FF]">
            Realtime Projection
          </span>
        </div>

        <div className="grid items-center gap-8 rounded-2xl border border-[#2B3060] bg-[#1B1F40] p-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-7">
            <label className="flex justify-between text-xs font-bold text-[#EEF0FF]">
              <span>Thời gian bạn học mỗi ngày:</span>
              <span className="text-sm font-black text-[#F6E85C]">
                {dailyMins} phút / ngày
              </span>
            </label>
            <input
              type="range"
              min={15}
              max={90}
              step={5}
              value={dailyMins}
              onChange={(e) => setDailyMins(Number(e.target.value))}
              className="h-2 w-full cursor-pointer rounded-lg bg-[#0C0E1D] accent-[#F6E85C]"
            />
            <div className="flex justify-between text-[11px] font-bold text-[#98A0CF]">
              <span>15 phút (Thư thả)</span>
              <span>45 phút (Chuẩn)</span>
              <span>90 phút (Cấp tốc)</span>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#2B3060] bg-[#141731] p-5 shadow-sm md:col-span-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#98A0CF]">
                Dự kiến hoàn thành:
              </span>
              <span className="text-sm font-black text-[#7C80FF]">
                {calculatedDays} ngày
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#98A0CF]">
                Ngày về đích:
              </span>
              <span className="text-sm font-black text-[#5EE0A0]">
                {formattedFinishDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#98A0CF]">
                Xác suất đạt band:
              </span>
              <span className="text-sm font-black text-[#F6E85C]">
                {dailyMins >= 45
                  ? "95% Rất cao"
                  : dailyMins >= 30
                    ? "88% Khá cao"
                    : "75% Trung bình"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Curriculum Syllabus Stepper */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold tracking-wider text-[#98A0CF] uppercase">
              Syllabus Matrix
            </span>
            <h2 className="text-2xl font-black text-[#EEF0FF]">
              Nội Dung Chi Tiết Theo Giai Đoạn & Tuần Học
            </h2>
          </div>
          <span className="text-xs font-bold text-[#98A0CF]">
            {plan.phases.length} Giai đoạn lớn
          </span>
        </div>

        {plan.phases.map((phase) => (
          <div
            key={phase.phaseNumber}
            className="space-y-6 rounded-3xl border border-[#2B3060] bg-[#141731] p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-start justify-between border-b border-[#2B3060] pb-4">
              <div>
                <span className="rounded-full bg-[#5B5FEF] px-3 py-1 text-[11px] font-black text-[#EEF0FF] uppercase">
                  Giai Đoạn {phase.phaseNumber}
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-[#EEF0FF]">
                  {phase.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#98A0CF]">
                  Mục tiêu: {phase.targetOutcome}
                </p>
              </div>
            </div>

            {/* Weeks Accordion */}
            <div className="space-y-4">
              {phase.weeks.map((week) => {
                const isExpanded = expandedWeek === week.weekNumber;
                return (
                  <div
                    key={week.weekNumber}
                    className="overflow-hidden rounded-2xl border border-[#2B3060] transition-all duration-200"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() =>
                        setExpandedWeek(isExpanded ? 0 : week.weekNumber)
                      }
                      className={`flex w-full items-center justify-between p-4 text-left transition-colors ${
                        isExpanded ? "bg-[#1B1F40]" : "hover:bg-[#1B1F40]/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5B5FEF] text-xs font-black text-white">
                          W{week.weekNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#EEF0FF]">
                            {week.title}
                          </h4>
                          <p className="text-xs text-[#98A0CF]">
                            {week.summary}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-[#7C80FF]" />
                      ) : (
                        <ChevronDown size={20} className="text-[#98A0CF]" />
                      )}
                    </button>

                    {/* Accordion Days Body */}
                    {isExpanded && (
                      <div className="space-y-3 border-t border-[#2B3060] bg-[#0C0E1D]/50 p-4">
                        {week.days.map((day) => (
                          <div
                            key={day.dayNumber}
                            className={`flex flex-col items-start justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                              day.isMilestone
                                ? "border-[#F6E85C]/30 bg-[#F6E85C]/10"
                                : "border-[#2B3060] bg-[#1B1F40] hover:border-[#5B5FEF]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#2B3060] bg-[#141731] text-xs font-bold text-[#EEF0FF]">
                                D{day.dayNumber}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-[#F6E85C]/15 px-2 py-0.5 text-[10px] font-black tracking-wider text-[#F6E85C] uppercase">
                                    {formatSkillLabel(day.skill)}
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#98A0CF]">
                                    {day.durationMins} phút
                                  </span>
                                </div>
                                <h5 className="mt-1 text-xs font-bold text-[#EEF0FF]">
                                  {day.title}
                                </h5>
                              </div>
                            </div>

                            <Link
                              href={day.linkHref}
                              className="flex items-center gap-1.5 self-end rounded-xl bg-[#5B5FEF] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#7C80FF] sm:self-auto"
                            >
                              <Play size={12} fill="currentColor" /> Học Ngay
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
