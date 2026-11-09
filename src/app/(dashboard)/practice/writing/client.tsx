"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PenLine,
  Sparkles,
  Search,
  ArrowRight,
  ChevronDown,
  Layers,
  Clock,
  BarChart3,
  RefreshCw,
} from "lucide-react";

import "./writing.css";
import { ThreeLexicalCore } from "./components/ThreeLexicalCore";
import { LiveWritingLab } from "./components/LiveWritingLab";
import { QuickWritingModal } from "./components/QuickWritingModal";
import {
  CURATED_WRITING_TASKS,
  WRITING_BAND_STAGES,
  type CuratedWritingTask,
} from "./components/writing-curated-data";
import type { WritingCatalogItem } from "@/features/writing/server/content";

interface WritingHubClientProps {
  items: WritingCatalogItem[];
  submissionsCount?: number;
  avgScore?: number | null;
  totalWords?: number;
  latestCriteria?: {
    taskResponse?: number | null;
    coherenceCohesion?: number | null;
    lexicalResource?: number | null;
    grammaticalRangeAccuracy?: number | null;
  } | null;
  profile?: {
    current_band?: number | null;
    target_band?: number | null;
    daily_study_minutes?: number | null;
    target_exam_date?: string | null;
  } | null;
}

export function WritingHubClient({
  items,
  submissionsCount = 0,
  avgScore = null,
  totalWords = 0,
  latestCriteria = null,
  profile,
}: WritingHubClientProps) {
  const [selectedBand, setSelectedBand] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "task1" | "task2">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal state
  const [activeTaskModal, setActiveTaskModal] =
    useState<CuratedWritingTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Band descriptor computed
  const currentStage = useMemo(() => {
    if (selectedBand === "all") return WRITING_BAND_STAGES[2]; // 7.0-7.5 default
    return (
      WRITING_BAND_STAGES.find((s) => s.band === selectedBand) ||
      WRITING_BAND_STAGES[2]
    );
  }, [selectedBand]);

  // Filtered curated tasks
  const filteredTasks = useMemo(() => {
    return CURATED_WRITING_TASKS.filter((task) => {
      // Type filter
      if (selectedType !== "all" && task.taskType !== selectedType)
        return false;

      // Band filter
      if (selectedBand !== "all") {
        const [lowStr, highStr] = selectedBand.split(" - ");
        const low = parseFloat(lowStr);
        const high = parseFloat(highStr);
        if (task.targetBand < low || task.targetBand > high) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesTopic = task.topic.toLowerCase().includes(q);
        const matchesPrompt = task.prompt.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesPrompt) return false;
      }

      return true;
    });
  }, [selectedType, selectedBand, searchQuery]);

  const handleOpenModal = (task: CuratedWritingTask) => {
    setActiveTaskModal(task);
    setIsModalOpen(true);
  };

  const taskResp = latestCriteria?.taskResponse ?? null;
  const coherence = latestCriteria?.coherenceCohesion ?? null;
  const lexical = latestCriteria?.lexicalResource ?? null;
  const grammar = latestCriteria?.grammaticalRangeAccuracy ?? null;
  const formatCriterion = (score: number | null) =>
    score !== null ? score.toFixed(1) : "--";
  const criterionWidth = (score: number | null) =>
    score !== null
      ? `${Math.round(Math.min(100, Math.max(0, (score / 9) * 100)))}%`
      : "0%";

  return (
    <div className="space-y-8 pb-16 font-sans text-[#EEF0FF]">
      {/* 1. Cybernetic Holographic Lexical Core Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[#242A4E] bg-gradient-to-br from-[#0C0E1D] via-[#14122B] to-[#1F183D] p-6 shadow-2xl sm:p-10">
        {/* Glow ambient background lights */}
        <div className="pointer-events-none absolute -top-20 -left-20 size-80 rounded-full bg-[#A855F7]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-[#5B5FEF]/15 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column: Title, Descriptor & 4 Criteria HUD */}
          <div className="space-y-5 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A855F7]/30 bg-[#A855F7]/20 px-3 py-1 font-mono text-xs font-bold tracking-wider text-[#C084FC] uppercase">
                <Sparkles size={13} className="text-[#00F0FF]" /> IELTS Writing
                Studio v3.2
              </span>

              {/* Band stage dropdown selector */}
              <div className="relative inline-block">
                <select
                  value={selectedBand}
                  onChange={(e) => setSelectedBand(e.target.value)}
                  className="cursor-pointer appearance-none rounded-full border border-[#2E3660] bg-[#0C0E1D] px-3.5 py-1 pr-8 text-xs font-bold text-[#A855F7] focus:border-[#5B5FEF] focus:outline-none"
                  aria-label="Chọn giai đoạn band điểm Writing"
                >
                  <option value="all">Tất cả Band điểm</option>
                  {WRITING_BAND_STAGES.map((s) => (
                    <option key={s.band} value={s.band}>
                      Band {s.band} — {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#94A3B8]"
                />
              </div>
            </div>

            <div>
              <h1 className="text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Zen Focus Writing & Lexical Architecture
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                Làm chủ cấu trúc bài luận Academic Task 1 & Task 2, rèn luyện
                nghệ thuật liên kết ý Cohesion mượt mà và mở rộng vốn từ vựng
                học thuật C1/C2.
              </p>
            </div>

            {/* Assessment Criteria Matrix HUD (4 IELTS Writing Criteria) */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4">
              <div className="rounded-xl border border-[#242A4E] bg-[#0C0E1D]/80 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                    Task Resp
                  </span>
                  <span className="font-mono text-xs font-bold text-[#00F0FF]">
                    {formatCriterion(taskResp)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2442]">
                  <div
                    className="h-full rounded-full bg-[#00F0FF]"
                    style={{ width: criterionWidth(taskResp) }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#242A4E] bg-[#0C0E1D]/80 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                    Coherence
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C084FC]">
                    {formatCriterion(coherence)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2442]">
                  <div
                    className="h-full rounded-full bg-[#A855F7]"
                    style={{ width: criterionWidth(coherence) }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#242A4E] bg-[#0C0E1D]/80 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                    Lexical
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {formatCriterion(lexical)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2442]">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: criterionWidth(lexical) }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#242A4E] bg-[#0C0E1D]/80 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#94A3B8] uppercase">
                    Grammar
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {formatCriterion(grammar)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2442]">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: criterionWidth(grammar) }}
                  />
                </div>
              </div>
            </div>

            {/* Target band guidance card */}
            <div className="flex items-center justify-between rounded-xl border border-[#1E2442] bg-[#0C0E1D]/50 p-3 text-xs text-[#94A3B8]">
              <div>
                <strong className="text-[#EEF0FF]">
                  {currentStage.name} Focus:{" "}
                </strong>
                <span>{currentStage.taskResponseTarget}</span>
              </div>
              <span className="shrink-0 rounded bg-[#A855F7]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#C084FC]">
                {currentStage.band}
              </span>
            </div>
          </div>

          {/* Right Column: 3D Holographic Lexical Crystal */}
          <div className="flex flex-col items-center justify-center space-y-4 lg:col-span-5">
            <ThreeLexicalCore isTyping={false} />

            {/* Writing Quick Stats Widget */}
            <div className="flex w-full max-w-[340px] items-center justify-between rounded-2xl border border-[#242A4E] bg-[#0C0E1D]/90 p-4 backdrop-blur-md">
              <div>
                <p className="font-mono text-[10px] text-[#94A3B8] uppercase">
                  Essays Submitted
                </p>
                <p className="text-lg font-black text-white">
                  {submissionsCount} bài viết
                </p>
              </div>
              <div className="h-8 w-px bg-[#1E2442]" />
              <div>
                <p className="font-mono text-[10px] text-[#94A3B8] uppercase">
                  {avgScore !== null ? "Avg Score" : "Target Band"}
                </p>
                <p className="text-lg font-black text-[#A855F7]">
                  {avgScore !== null
                    ? `${avgScore.toFixed(1)} Band`
                    : profile?.target_band
                      ? `Target ${profile.target_band.toFixed(1)}`
                      : "--"}
                </p>
              </div>
              <div className="h-8 w-px bg-[#1E2442]" />
              <div>
                <p className="font-mono text-[10px] text-[#94A3B8] uppercase">
                  Total Words
                </p>
                <p className="text-lg font-black text-emerald-400">
                  {totalWords.toLocaleString("en-US")}w
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Mini-Lab: Paraphrase Forge, Cohesion Matrix, Lexicon Swap */}
      <LiveWritingLab />

      {/* 3. Bento Grid 4 Practice Modes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#A855F7]" />
            <h2 className="text-lg font-extrabold text-white">
              4 Chế Độ Luyện Viết Chuyên Sâu
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Academic Task 1 & Task 2
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Mode 1: Task 1 Visual Data Synthesis */}
          <div className="writing-glow-card flex flex-col justify-between rounded-2xl border border-[#242A4E] bg-[#12162B] p-5">
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#5B5FEF]/20 text-[#7A7DF5]">
                <BarChart3 size={20} />
              </div>
              <span className="font-mono text-[10px] font-bold text-[#7A7DF5] uppercase">
                TASK 1 REPORT
              </span>
              <h3 className="mt-0.5 text-sm font-bold text-white">
                Visual Data Synthesis
              </h3>
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                Rèn viết Overview 2 câu đắt giá, chọn lọc số liệu quan trọng và
                làm chủ các biểu đồ Line, Bar, Pie, Process.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(CURATED_WRITING_TASKS[1])}
              className="mt-4 flex items-center justify-between text-xs font-bold text-[#00F0FF] hover:underline"
            >
              <span>Vào Task 1</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mode 2: Task 2 Argumentative Essay */}
          <div className="writing-glow-card flex flex-col justify-between rounded-2xl border border-[#242A4E] bg-[#12162B] p-5">
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#A855F7]/20 text-[#C084FC]">
                <PenLine size={20} />
              </div>
              <span className="font-mono text-[10px] font-bold text-[#C084FC] uppercase">
                TASK 2 ESSAY
              </span>
              <h3 className="mt-0.5 text-sm font-bold text-white">
                Argumentative Essay
              </h3>
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                Xây dựng dàn ý 4 đoạn chặt chẽ, phát triển luận điểm với ví dụ
                thực tiễn cho Opinion, Discussion và Problem-Solution.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(CURATED_WRITING_TASKS[0])}
              className="mt-4 flex items-center justify-between text-xs font-bold text-[#00F0FF] hover:underline"
            >
              <span>Vào Task 2</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mode 3: Paraphrase Forge */}
          <div className="writing-glow-card flex flex-col justify-between rounded-2xl border border-[#242A4E] bg-[#12162B] p-5">
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <RefreshCw size={20} />
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase">
                SYNTAX FORGE
              </span>
              <h3 className="mt-0.5 text-sm font-bold text-white">
                Paraphrase & Complex Sentences
              </h3>
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                Biến câu đơn thành câu phức với mệnh đề quan hệ rút gọn, đảo ngữ
                và danh từ hóa (nominalization).
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(CURATED_WRITING_TASKS[2])}
              className="mt-4 flex items-center justify-between text-xs font-bold text-[#00F0FF] hover:underline"
            >
              <span>Luyện Syntax</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mode 4: 5-Minute Outline Sprint */}
          <div className="writing-glow-card flex flex-col justify-between rounded-2xl border border-[#242A4E] bg-[#12162B] p-5">
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
                <Clock size={20} />
              </div>
              <span className="font-mono text-[10px] font-bold text-amber-400 uppercase">
                OUTLINE SPRINT
              </span>
              <h3 className="mt-0.5 text-sm font-bold text-white">
                5-Minute Outline Sprint
              </h3>
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                Thử thách giới hạn 5 phút bóc tách đề bài, lên Thesis Statement
                và 2 luận điểm thân bài không chần chừ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(CURATED_WRITING_TASKS[0])}
              className="mt-4 flex items-center justify-between text-xs font-bold text-[#00F0FF] hover:underline"
            >
              <span>Vào Sprint</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Filterable Practice Tasks Library */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Thư Viện Đề Thi Writing Chuẩn Format
            </h2>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Tổng hợp {filteredTasks.length} đề thi IELTS Writing có kèm dàn ý
              mẫu 4 đoạn và từ vựng gợi ý C1/C2.
            </p>
          </div>

          {/* Filter Chips: All, Task 1, Task 2 */}
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "Tất cả đề" },
              { id: "task1", label: "Task 1 Report" },
              { id: "task2", label: "Task 2 Essay" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setSelectedType(t.id as "all" | "task1" | "task2")
                }
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedType === t.id
                    ? "bg-[#5B5FEF] text-white shadow-sm"
                    : "border border-[#242A4E] bg-[#12162B] text-[#94A3B8] hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm chủ đề bài viết (Energy, Technology, Environment, Remote Work...)"
            className="w-full rounded-2xl border border-[#242A4E] bg-[#12162B] py-3.5 pr-4 pl-11 text-xs text-[#EEF0FF] shadow-sm placeholder:text-[#64748B] focus:border-[#5B5FEF] focus:outline-none"
          />
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="writing-glow-card flex flex-col justify-between rounded-2xl border border-[#242A4E] bg-[#12162B] p-5 sm:p-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded border border-[#A855F7]/30 bg-[#A855F7]/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#C084FC] uppercase">
                    {task.taskType.toUpperCase()} · {task.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-2 py-0.5 font-mono text-[11px] text-[#00F0FF]">
                      Band {task.targetBand.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                      <Clock size={12} /> {task.timeLimitMinutes}m
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold tracking-wide text-[#A5B4FC] uppercase">
                    {task.topic}
                  </span>
                  <h3 className="mt-0.5 text-base leading-snug font-extrabold text-white">
                    {task.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-[#94A3B8]">
                    {task.prompt}
                  </p>
                </div>

                {/* Vocabulary pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {task.recommendedVocabulary.map((v, i) => (
                    <span
                      key={i}
                      className="rounded border border-[#1E2442] bg-[#0C0E1D] px-2 py-0.5 font-mono text-[10px] text-[#EEF0FF]"
                    >
                      {v.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-3 border-t border-[#1E2442] pt-5">
                <button
                  type="button"
                  onClick={() => handleOpenModal(task)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#5B5FEF] py-2.5 text-xs font-bold text-white shadow-md shadow-[#5B5FEF]/20 transition-all hover:bg-[#4D51DE]"
                >
                  <PenLine size={14} /> Mở Zen Writing Studio
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenModal(task)}
                  className="rounded-xl border border-[#242A4E] bg-[#1E2442] px-4 py-2.5 text-xs font-bold text-[#EEF0FF] transition-all hover:bg-[#2A335E]"
                >
                  Xem dàn ý
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="col-span-full space-y-3 rounded-2xl border border-[#242A4E] bg-[#12162B] p-10 text-center">
              <Search size={32} className="mx-auto text-[#64748B]" />
              <p className="text-sm font-bold text-white">
                Không tìm thấy bài viết phù hợp
              </p>
              <p className="text-xs text-[#94A3B8]">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Tất cả đề&quot; để
                xem toàn bộ danh mục.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("all");
                  setSelectedBand("all");
                  setSearchQuery("");
                }}
                className="rounded-xl bg-[#5B5FEF] px-4 py-2 text-xs font-bold text-white"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Supabase Dynamic Tasks Integration */}
      {items.length > 0 && (
        <section className="space-y-4 border-t border-[#242A4E] pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Nhiệm Vụ Writing Từ Hệ Thống Đã Lưu
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Dữ liệu bài tập Writing được đồng bộ từ Supabase
              </p>
            </div>
            <span className="font-mono text-xs text-[#00F0FF]">
              {items.length} nhiệm vụ
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.slug}
                className="writing-glow-card flex flex-col justify-between rounded-2xl border border-[#242A4E] bg-[#12162B] p-5"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded bg-[#A855F7]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#C084FC]">
                      {item.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {Math.round(item.timeLimitSeconds / 60)}m
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-[#94A3B8]">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={`/practice/writing/${item.slug}`}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-[#1E2442] py-2 text-center text-xs font-bold text-[#EEF0FF] transition-all hover:bg-[#5B5FEF] hover:text-white"
                >
                  <span>Mở bài viết</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Writing Zen Focus Modal */}
      <QuickWritingModal
        task={activeTaskModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
