"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { updateDailyStudyMinutesAction } from "@/features/roadmap/actions";

import {
  DEFAULT_ROADMAP_NODES,
  type RoadmapNode,
} from "./components/RoadmapTree3D";
import "./roadmap.css";

const RoadmapTree3D = dynamic(
  () =>
    import("./components/RoadmapTree3D").then((mod) => ({
      default: mod.RoadmapTree3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] w-full animate-pulse items-center justify-center rounded-2xl border border-indigo-500/30 bg-[#070910] text-xs font-semibold text-slate-400">
        Đang khởi tạo không gian 3D WebGL...
      </div>
    ),
  },
);

export interface SkillReadinessMap {
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
}

export interface RoadmapClientProps {
  targetBand?: string | number;
  currentBand?: string | number;
  targetExamDate?: string;
  initialDailyMinutes?: number;
  nodes?: RoadmapNode[];
  estimatedHoursRemaining?: number;
  skillReadiness?: SkillReadinessMap;
}

const EMPTY_SKILL_READINESS: SkillReadinessMap = {
  listening: null,
  reading: null,
  writing: null,
  speaking: null,
};

export function RoadmapClient({
  targetBand = "6.5",
  currentBand = "Chưa đánh giá",
  targetExamDate = "",
  initialDailyMinutes = 30,
  nodes,
  estimatedHoursRemaining = 20,
  skillReadiness = EMPTY_SKILL_READINESS,
}: RoadmapClientProps) {
  const router = useRouter();
  const displayNodes =
    nodes && nodes.length > 0 ? nodes : DEFAULT_ROADMAP_NODES;

  const [activeView, setActiveView] = useState<"3d" | "list" | "cal">("3d");
  const [pacingMinutes, setPacingMinutes] =
    useState<number>(initialDailyMinutes);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handlePacingChange = (val: number) => {
    setPacingMinutes(val);
    setSaveMessage("Đang đồng bộ...");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await updateDailyStudyMinutesAction(val);
        setSaveMessage(
          res.success ? "Đã lưu vào hồ sơ" : (res.error ?? "Chưa thể đồng bộ"),
        );
      } catch {
        setSaveMessage("Chưa thể đồng bộ");
      }
    }, 350);
  };

  const [mountNowMs] = useState(() => Date.now());
  const daysToExam = useMemo(() => {
    if (!targetExamDate) return null;
    const targetTime = new Date(targetExamDate).getTime();
    if (!Number.isFinite(targetTime)) return null;
    const diff = Math.ceil((targetTime - mountNowMs) / 86_400_000);
    return Math.max(0, diff);
  }, [mountNowMs, targetExamDate]);

  const { projectedFinishDateStr, isAheadOfSchedule } = useMemo(() => {
    const safeHours = Math.max(1, estimatedHoursRemaining);
    const daysNeeded = Math.ceil(
      (safeHours * 60) / Math.max(10, pacingMinutes),
    );
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + daysNeeded);

    const projected = finishDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const examTime = targetExamDate ? new Date(targetExamDate).getTime() : NaN;
    const ahead = Number.isFinite(examTime)
      ? finishDate.getTime() <= examTime
      : true;
    return { projectedFinishDateStr: projected, isAheadOfSchedule: ahead };
  }, [estimatedHoursRemaining, pacingMinutes, targetExamDate]);

  const formattedExamDate = useMemo(() => {
    if (!targetExamDate) return "Chưa thiết lập";
    const d = new Date(targetExamDate);
    if (Number.isNaN(d.getTime())) return "Chưa thiết lập";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [targetExamDate]);

  const groupedPhases = useMemo(() => {
    const groups = new Map<number, { title: string; items: RoadmapNode[] }>();
    for (const node of displayNodes) {
      const existing = groups.get(node.phase);
      if (existing) {
        existing.items.push(node);
      } else {
        groups.set(node.phase, { title: node.phaseTitle, items: [node] });
      }
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [displayNodes]);

  const handleContinueLesson = (node?: RoadmapNode) => {
    router.push(node?.targetHref ?? "/learn");
  };

  const handleTestOut = () => {
    router.push("/mock-tests");
  };

  const skillRows: {
    key: keyof SkillReadinessMap;
    label: string;
    colorClass: string;
  }[] = [
    {
      key: "listening",
      label: "Nghe (Listening)",
      colorClass: "bg-indigo-500",
    },
    { key: "reading", label: "Đọc (Reading)", colorClass: "bg-emerald-500" },
    { key: "writing", label: "Viết (Writing)", colorClass: "bg-amber-500" },
    { key: "speaking", label: "Nói (Speaking)", colorClass: "bg-sky-500" },
  ];

  return (
    <div className="roadmap-root min-h-screen w-full py-8">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <span className="rounded-full border border-indigo-500/40 bg-indigo-600/30 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-indigo-300 uppercase">
                MỤC TIÊU IELTS {targetBand}
              </span>
              <span className="text-xs text-slate-400">
                • Trình độ hiện tại: {currentBand}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase md:text-3xl">
              BẢN ĐỒ LỘ TRÌNH CÁ NHÂN HÓA
            </h1>
          </div>

          <div className="inline-flex self-start rounded-xl border border-white/10 bg-[#131722] p-1">
            <button
              onClick={() => setActiveView("3d")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeView === "3d"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-label="Chuyển chế độ Bản đồ cây 3D"
            >
              Bản đồ cây 3D
            </button>
            <button
              onClick={() => setActiveView("list")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeView === "list"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-label="Chuyển chế độ Danh sách"
            >
              Danh sách
            </button>
            <button
              onClick={() => setActiveView("cal")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeView === "cal"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-label="Chuyển chế độ Lịch học"
            >
              Phân bổ tuần
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {activeView === "3d" && (
              <div className="roadmap-fade-in space-y-5">
                <RoadmapTree3D
                  nodes={displayNodes}
                  pacingMinutes={pacingMinutes}
                  onContinueLesson={handleContinueLesson}
                  onTestOut={handleTestOut}
                />
              </div>
            )}

            {activeView === "list" && (
              <div className="roadmap-fade-in space-y-6">
                {groupedPhases.map(([phaseNum, group]) => {
                  const avgProgress = Math.round(
                    group.items.reduce(
                      (sum, item) => sum + item.progressPercent,
                      0,
                    ) / Math.max(1, group.items.length),
                  );
                  return (
                    <div
                      key={phaseNum}
                      className="glass-card space-y-3 rounded-2xl border border-indigo-500/20 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-300">
                          {group.title}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          Tiến độ: {avgProgress}%
                        </span>
                      </div>

                      {group.items.map((node, idx) => (
                        <div
                          key={node.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#161926] p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-bold text-white">
                                {node.title}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {node.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs font-bold text-emerald-400">
                              {node.score}
                            </span>
                            <button
                              onClick={() => router.push(node.targetHref)}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-500"
                            >
                              Học ngay →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {activeView === "cal" && (
              <div className="roadmap-fade-in glass-card space-y-4 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white">
                  Kế hoạch học tập theo chặng ({pacingMinutes} phút/ngày)
                </h3>
                <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                  {groupedPhases.map(([phaseNum, group]) => {
                    const activeItem =
                      group.items.find((i) => i.status !== "completed") ??
                      group.items[0];
                    return (
                      <div
                        key={phaseNum}
                        className="space-y-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4"
                      >
                        <div className="font-bold text-indigo-300">
                          Phase {phaseNum} ({group.items.length} mô-đun)
                        </div>
                        <p className="font-semibold text-white">
                          {activeItem?.title}
                        </p>
                        <p className="text-slate-400">{activeItem?.subtitle}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                  THỜI GIAN BIỂU
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-950 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  {daysToExam !== null
                    ? "Đã đặt mục tiêu"
                    : "Chưa đặt ngày thi"}
                </span>
              </div>
              <div className="my-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400">
                  {daysToExam !== null ? daysToExam : "—"}
                </span>
                <span className="text-base font-bold text-white">
                  ngày đến ngày thi mục tiêu
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ngày thi mục tiêu:{" "}
                <strong className="text-slate-200">{formattedExamDate}</strong>
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                  ĐIỀU CHỈNH TỐC ĐỘ HỌC
                </span>
                {saveMessage ? (
                  <span className="text-[11px] font-medium text-emerald-300">
                    {saveMessage}
                  </span>
                ) : null}
              </div>
              <h3 className="mb-0.5 text-base font-extrabold text-white">
                Tốc độ hiện tại: <span>{pacingMinutes}</span> phút/ngày
              </h3>
              <p className="mb-4 text-xs text-slate-400">
                Ước tính hoàn thành khối lượng còn lại:{" "}
                <strong className="text-white">{projectedFinishDateStr}</strong>
              </p>
              <label
                htmlFor="pacing-slider"
                className="mb-2 block text-xs text-slate-300"
              >
                Thay đổi thời lượng học mỗi ngày (lưu vào hồ sơ học tập):
              </label>
              <input
                id="pacing-slider"
                type="range"
                min="15"
                max="120"
                step="5"
                value={pacingMinutes}
                onChange={(e) => handlePacingChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer rounded-lg bg-slate-800"
                aria-label="Điều chỉnh thời gian học mỗi ngày"
              />
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{pacingMinutes} phút/ngày</span>
                {targetExamDate ? (
                  <span
                    className={
                      isAheadOfSchedule
                        ? "font-semibold text-emerald-400"
                        : "font-semibold text-amber-400"
                    }
                  >
                    {isAheadOfSchedule
                      ? "✓ Kịp tiến độ mục tiêu"
                      : "⚠ Cần tăng thời lượng"}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="glass-card space-y-3.5 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-white uppercase">
                  NĂNG LỰC KỸ NĂNG
                </span>
                <span className="text-[11px] text-slate-400">
                  Dữ liệu thực tế
                </span>
              </div>

              {skillRows.map((row) => {
                const value = skillReadiness[row.key];
                return (
                  <div key={row.key}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-200">
                        {row.label}
                      </span>
                      <span className="font-bold text-indigo-300">
                        {value !== null ? `${value}%` : "Chưa có dữ liệu"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full ${row.colorClass} rounded-full`}
                        style={{ width: `${value ?? 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
