"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Lightbulb,
  Medal,
  PlayCircle,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import {
  ScoreTrajectory3D,
  type TrajectoryWeek,
} from "./components/ScoreTrajectory3D";
import { SkillRadar3D, type SkillItem } from "./components/SkillRadar3D";
import "./progress.css";

export interface TimeRangeData {
  hours: string;
  hoursSub: string;
  lessons: number;
  lessonTotal: number;
  lessonsPct: number;
  band: string;
  bandBadge: string;
  confidence: string;
  streak: string;
  weeks: TrajectoryWeek[];
}

export interface HeatmapCell {
  date: string;
  minutes: number;
  xp: number;
  level: number;
}

export interface ProgressClientProps {
  ranges?: Record<"7d" | "30d" | "all", TimeRangeData>;
  skills?: SkillItem[];
  heatmapDays?: HeatmapCell[];
  vocabSummary?: {
    savedTerms: number;
    dueReview: number;
    mastered: number;
  };
  weakArea?: {
    skill: string;
    label: string;
    accuracyPercent: number;
  } | null;
  targetBand?: number | null;
  lastUpdatedLabel?: string;
}

const HEATMAP_COLORS: Record<number, string> = {
  0: "bg-[#1c1f2e]",
  1: "bg-[#2a2956]",
  2: "bg-[#4338ca]",
  3: "bg-[#6366f1]",
};

const EMPTY_RANGE: TimeRangeData = {
  hours: "0h 0m",
  hoursSub: "Chưa có bài hoàn thành",
  lessons: 0,
  lessonTotal: 0,
  lessonsPct: 0,
  band: "—",
  bandBadge: "Chưa đánh giá",
  confidence: "Chưa đủ dữ liệu",
  streak: "0 Ngày",
  weeks: [],
};

const DEFAULT_EMPTY_RANGES: Record<"7d" | "30d" | "all", TimeRangeData> = {
  "7d": EMPTY_RANGE,
  "30d": EMPTY_RANGE,
  all: EMPTY_RANGE,
};

const EMPTY_SKILLS: SkillItem[] = [
  {
    id: "reading",
    name: "Reading",
    band: null,
    progress: 0,
    status: "Chưa đánh giá",
    barColor: "bg-slate-600",
    badgeClass: "bg-slate-900 text-slate-300 border-slate-700",
    statusClass: "text-slate-400",
  },
  {
    id: "listening",
    name: "Listening",
    band: null,
    progress: 0,
    status: "Chưa đánh giá",
    barColor: "bg-slate-600",
    badgeClass: "bg-slate-900 text-slate-300 border-slate-700",
    statusClass: "text-slate-400",
  },
  {
    id: "speaking",
    name: "Speaking",
    band: null,
    progress: 0,
    status: "Chưa đánh giá",
    barColor: "bg-slate-600",
    badgeClass: "bg-slate-900 text-slate-300 border-slate-700",
    statusClass: "text-slate-400",
  },
  {
    id: "writing",
    name: "Writing",
    band: null,
    progress: 0,
    status: "Chưa đánh giá",
    barColor: "bg-slate-600",
    badgeClass: "bg-slate-900 text-slate-300 border-slate-700",
    statusClass: "text-slate-400",
  },
  {
    id: "vocab",
    name: "Vocabulary",
    scrollLabel: "Vocab",
    band: null,
    progress: 0,
    status: "Chưa đánh giá",
    barColor: "bg-slate-600",
    badgeClass: "bg-slate-900 text-slate-300 border-slate-700",
    statusClass: "text-slate-400",
  },
  {
    id: "grammar",
    name: "Grammar",
    band: null,
    progress: 0,
    status: "Chưa đánh giá",
    barColor: "bg-slate-600",
    badgeClass: "bg-slate-900 text-slate-300 border-slate-700",
    statusClass: "text-slate-400",
  },
];

function getSkillPracticeHref(skill: string): string {
  if (skill === "vocabulary" || skill === "grammar") {
    return `/learn/${skill}`;
  }
  return `/practice/${skill}`;
}

export function ProgressClient({
  ranges = DEFAULT_EMPTY_RANGES,
  skills = EMPTY_SKILLS,
  heatmapDays = [],
  vocabSummary = { savedTerms: 0, dueReview: 0, mastered: 0 },
  weakArea = null,
  targetBand = null,
  lastUpdatedLabel = "Dữ liệu thời gian thực",
}: ProgressClientProps) {
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    skills[0]?.id ?? "reading",
  );
  const [isHeatmap3D, setIsHeatmap3D] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    title: string;
    desc: string;
    open: boolean;
  }>({
    title: "",
    desc: "",
    open: false,
  });

  const showToast = (title: string, desc: string) => {
    setToast({ title, desc, open: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3500);
  };

  const currentData = ranges[timeRange] ?? EMPTY_RANGE;
  const displayCells: HeatmapCell[] =
    heatmapDays.length > 0
      ? heatmapDays
      : Array.from({ length: 48 }, (_, i) => ({
          date: `Ngày -${48 - i}`,
          minutes: 0,
          xp: 0,
          level: 0,
        }));

  const safeWeekIdx =
    currentData.weeks.length > 0
      ? Math.min(selectedWeekIdx, currentData.weeks.length - 1)
      : 0;

  return (
    <div className="progress-root w-full py-8">
      <div className="mx-auto w-full max-w-[1380px] space-y-6 px-4 sm:px-6 lg:px-8">
        {/* 1. HEADER & FILTER CONTROLS */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2.5">
              <span className="rounded-md border border-indigo-500/40 bg-[#1e1b4b] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider text-indigo-300 uppercase">
                ANALYTICS HUB
              </span>
              <span className="text-xs font-medium text-gray-400">
                • Cập nhật:{" "}
                <strong className="text-gray-300">{lastUpdatedLabel}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-[32px]">
              Báo cáo &amp; Tiến độ học tập
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="inline-flex items-center rounded-xl border border-[#232637] bg-[#141621] p-1">
              {(["7d", "30d", "all"] as const).map((range) => {
                const label =
                  range === "7d"
                    ? "7 ngày qua"
                    : range === "30d"
                      ? "Tháng này"
                      : "Toàn thời gian";
                const isSelected = timeRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-indigo-500/40 bg-[#252347] text-indigo-300 shadow-sm"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95"
              aria-label="Xuất báo cáo PDF"
            >
              <Download className="h-4 w-4" />
              <span>Xuất báo cáo PDF</span>
            </button>
          </div>
        </div>

        {/* 2. FOUR TOP KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          <div className="kpi-card rounded-2xl border border-[#232637] bg-[#141621] p-5">
            <div className="kpi-corner-circle bg-indigo-500/10" />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Tổng giờ học
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-[#1c1e2f] text-indigo-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mb-2 text-3xl font-black tracking-tight text-white">
              {currentData.hours}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{currentData.hoursSub}</span>
            </div>
          </div>

          <div className="kpi-card rounded-2xl border border-[#232637] bg-[#141621] p-5">
            <div className="kpi-corner-circle bg-indigo-500/10" />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Bài học đã xong
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-[#1c1e2f] text-indigo-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mb-2.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight text-white">
                {currentData.lessons}
              </span>
              <span className="text-base font-bold text-gray-400">
                / {currentData.lessonTotal} bài
              </span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[#232637]">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${currentData.lessonsPct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Hoàn thành {currentData.lessonsPct}% lộ trình
            </p>
          </div>

          <div className="kpi-card rounded-2xl border border-[#232637] bg-[#141621] p-5">
            <div className="kpi-corner-circle bg-indigo-500/10" />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Band ước tính
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-[#1c1e2f] text-indigo-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mb-2 flex items-center gap-2.5">
              <span className="text-3xl font-black tracking-tight text-white">
                {currentData.band}
              </span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-950/90 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                {currentData.bandBadge}
              </span>
            </div>
            <p className="text-xs font-medium text-indigo-400">
              Độ tin cậy: <strong>{currentData.confidence}</strong>
            </p>
          </div>

          <div className="kpi-card rounded-2xl border border-[#232637] bg-[#141621] p-5">
            <div className="kpi-corner-circle bg-amber-500/10" />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Chuỗi liên tục (Streak)
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/20 bg-[#27201c] text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="mb-2 text-3xl font-black tracking-tight text-white">
              {currentData.streak}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <Medal className="h-3.5 w-3.5" />
              <span>Ghi nhận theo ngày hoạt động</span>
            </div>
          </div>
        </div>

        {/* 3. LEARNING RECOMMENDATION BANNER (Strictly data-driven) */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#171829] via-[#181a2c] to-[#151724] p-4 shadow-lg sm:p-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-wider text-indigo-400 uppercase">
                  PHÂN TÍCH ĐIỂM YẾU
                </span>
                <span className="text-xs text-gray-400">
                  • Dựa trên lịch sử làm bài thực tế
                </span>
              </div>
              <p className="text-sm font-bold text-white sm:text-base">
                {weakArea
                  ? `Kỹ năng ${weakArea.label} hiện đạt ${weakArea.accuracyPercent}% — nên ưu tiên luyện tập bổ sung.`
                  : "Chưa phát hiện kỹ năng dưới ngưỡng 70% (cần tối thiểu 2 bài có chấm điểm trên mỗi kỹ năng)."}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              router.push(
                weakArea ? getSkillPracticeHref(weakArea.skill) : "/mock-tests",
              )
            }
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#232637] bg-[#11131d] px-4 py-2.5 text-xs font-bold text-gray-100 shadow transition hover:border-indigo-500/50 hover:bg-[#1d2032] lg:w-auto"
          >
            <PlayCircle className="h-4 w-4 text-indigo-400" />
            <span>
              {weakArea
                ? `Luyện ngay: ${weakArea.label}`
                : "Làm bài thi thử đánh giá"}
            </span>
          </button>
        </div>

        {/* 4. MAIN 12-COLUMN ANALYTICS GRID */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <ScoreTrajectory3D
              weeks={currentData.weeks}
              selectedWeekIndex={safeWeekIdx}
              onSelectWeek={(idx) => setSelectedWeekIdx(idx)}
              targetBand={targetBand}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-white sm:text-lg">
                  Chi tiết 6 Kỹ năng cốt lõi
                </h2>
                <span className="text-xs font-medium text-gray-400">
                  Tính từ các bài tập đã chấm điểm • Click để chọn trên Radar
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {skills.map((s) => {
                  const isSelected = s.id === selectedSkillId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSkillId(s.id)}
                      className={`group cursor-pointer rounded-2xl border bg-[#141621] p-5 transition hover:bg-[#191c2b] ${
                        isSelected
                          ? "border-indigo-500 ring-1 ring-indigo-500/40"
                          : "border-[#232637]"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-white transition group-hover:text-indigo-300">
                          {s.name}
                        </h3>
                        <span
                          className={`rounded-md border px-2.5 py-0.5 text-[11px] font-bold ${s.badgeClass}`}
                        >
                          {s.band !== null
                            ? `Band ${s.band.toFixed(1)}`
                            : "Chưa có điểm"}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-400">
                          Độ chính xác:{" "}
                          <strong className="text-gray-200">
                            {s.progress}%
                          </strong>
                        </span>
                        <span className={`font-bold ${s.statusClass}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#232637]">
                        <div
                          className={`h-full ${s.barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <SkillRadar3D
              skills={skills}
              selectedSkillId={selectedSkillId}
              onSelectSkill={(id) => setSelectedSkillId(id)}
            />

            <div className="rounded-2xl border border-[#232637] bg-[#141621] p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">
                  Vocabulary Vault
                </h3>
                <BookOpen className="h-4 w-4 text-indigo-400" />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#232637] bg-[#191c2a] p-4">
                <div>
                  <p className="mb-1 text-[11px] text-gray-400">Từ đã lưu</p>
                  <p className="text-2xl leading-tight font-black text-white">
                    {vocabSummary.savedTerms.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs font-semibold text-gray-400">
                    {vocabSummary.mastered} đã thuộc
                  </p>
                </div>

                <div className="border-l border-[#232637] pl-3">
                  <p className="mb-1 text-[11px] text-gray-400">Cần ôn tập</p>
                  <p className="text-2xl leading-tight font-black text-amber-500">
                    {vocabSummary.dueReview.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs font-semibold text-amber-400">
                    từ đang ôn
                  </p>
                </div>

                <button
                  onClick={() => router.push("/learn/vocabulary")}
                  className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95"
                  aria-label="Ôn tập từ vựng"
                >
                  Ôn tập
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#232637] bg-[#141621] p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Bản đồ hoạt động
                  </h3>
                  <p className="text-[11px] text-gray-400">48 ngày gần nhất</p>
                </div>
                <button
                  onClick={() => setIsHeatmap3D((prev) => !prev)}
                  className="rounded-lg border border-indigo-500/30 bg-[#1d2030] px-2.5 py-1 text-[10px] font-bold text-indigo-300 transition hover:bg-indigo-600/30"
                  aria-label="Bật tắt khối nổi 3D Heatmap"
                >
                  Khối nổi 3D: {isHeatmap3D ? "Bật" : "Tắt"}
                </button>
              </div>

              <div
                className={`grid grid-cols-12 gap-1.5 py-2 transition-transform duration-500 ${
                  isHeatmap3D ? "heatmap-grid-3d" : ""
                }`}
              >
                {displayCells.map((cell, idx) => (
                  <div
                    key={cell.date || idx}
                    data-level={cell.level}
                    onClick={() =>
                      showToast(
                        cell.date,
                        cell.minutes > 0 || cell.xp > 0
                          ? `Đã học ${cell.minutes} phút • ${cell.xp} XP`
                          : "Chưa ghi nhận hoạt động",
                      )
                    }
                    title={`${cell.date}: ${cell.minutes} phút, ${cell.xp} XP`}
                    className={`heatmap-cell aspect-square rounded-[4px] ${HEATMAP_COLORS[cell.level] ?? HEATMAP_COLORS[0]} cursor-pointer hover:ring-2 hover:ring-indigo-300`}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#232637]/60 pt-2 text-[11px] text-gray-400">
                <span>Ít hoạt động</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1c1f2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2956]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4338ca]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1] shadow-[0_0_6px_#6366f1]" />
                </div>
                <span>Tích cực</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-title"
        >
          <div className="glass-panel w-full max-w-md space-y-4 rounded-2xl border border-indigo-500/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3
                id="export-title"
                className="flex items-center gap-2 text-base font-extrabold text-white"
              >
                <Download className="h-4 w-4 text-indigo-400" />
                Xuất báo cáo tiến độ học tập
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-lg bg-white/5 p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Đóng hộp thoại xuất"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-gray-300">
              Báo cáo tiến độ tổng hợp dữ liệu kỹ năng, lịch sử bài làm và từ
              vựng được lưu trên Indigo Scholar.
            </p>

            <div className="space-y-1 rounded-xl border border-[#232637] bg-[#0e1018] p-3 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Khoảng thời gian:</span>
                <span className="font-bold text-white">
                  {timeRange === "7d"
                    ? "7 ngày qua"
                    : timeRange === "30d"
                      ? "Tháng này"
                      : "Toàn thời gian"}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Band ước tính:</span>
                <span className="font-bold text-indigo-400">
                  {currentData.band}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tổng giờ học:</span>
                <span className="font-bold text-emerald-400">
                  {currentData.hours}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  if (typeof window !== "undefined") window.print();
                }}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
              >
                In / Lưu file PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.open && (
        <div className="glass-panel animate-in fade-in slide-in-from-bottom-2 fixed right-6 bottom-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-indigo-500/40 px-4 py-3 shadow-2xl">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/40 bg-indigo-600/30 text-indigo-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toast.title}</p>
            <p className="text-[11px] text-gray-300">{toast.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
