"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sliders,
  ChevronDown,
  Layers,
  Activity,
  Target,
  Search,
  X,
  Compass,
  Bookmark,
  Award,
  Check,
  Radio,
  Gauge,
  BookA,
} from "lucide-react";

import type { ReadingCatalogItem } from "@/features/reading/server/content";
import {
  CURATED_PASSAGES,
  READING_BAND_STAGES,
  READING_TOPIC_TRACKS,
  type CuratedPassage,
  type ReadingBandStage,
} from "./components/reading-curated-data";
import { LiveReadingLab } from "./components/LiveReadingLab";
import { QuickReadingModal } from "./components/QuickReadingModal";
import type { ReadingVisualMode } from "./components/ThreeReadingVisualizer";
import "./reading.css";

export { READING_BAND_STAGES };

// Dynamic import for Three.js 3D canvas (prevents SSR hydration error)
const ThreeReadingVisualizer = dynamic(
  () =>
    import("./components/ThreeReadingVisualizer").then(
      (mod) => mod.ThreeReadingVisualizer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center font-mono text-xs text-emerald-300">
        <Activity className="mr-2 h-5 w-5 animate-spin" />
        Đang nạp 3D Lexical Matrix...
      </div>
    ),
  },
);

export interface ReadingHubProps {
  items: ReadingCatalogItem[];
  comprehensionRate: number | null;
  attemptsCount: number;
  profile: {
    current_band: number | null;
    target_band: number | null;
    daily_study_minutes: number | null;
    target_exam_date: string | null;
  } | null;
}

export function ReadingHubClient({
  items,
  comprehensionRate,
  attemptsCount,
  profile,
}: ReadingHubProps) {
  // 1. Initial Band Stage
  const userTargetBand = profile?.target_band ?? 6.5;
  const initialStage = useMemo(() => {
    return (
      READING_BAND_STAGES.find((s) => {
        if (s.maxBand === 9.0) {
          return userTargetBand >= s.minBand && userTargetBand <= 9.0;
        }
        return userTargetBand >= s.minBand && userTargetBand < s.maxBand;
      }) ?? READING_BAND_STAGES[1] // Default Intermediate (5.5 - 6.5)
    );
  }, [userTargetBand]);

  const [selectedStage, setSelectedStage] =
    useState<ReadingBandStage>(initialStage);
  const [showBandDropdown, setShowBandDropdown] = useState(false);

  // 2. 3D Visualizer & Speed States
  const [isScanning, setIsScanning] = useState(false);
  const [visualMode, setVisualMode] = useState<ReadingVisualMode>("matrix");
  const [readingSpeedWpm, setReadingSpeedWpm] = useState<number>(240);

  // 3. Exercise Library & Filtering States
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUncompleted, setOnlyUncompleted] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    "rd-1",
    "rd-3",
  ]);
  const [vocabPopoverId, setVocabPopoverId] = useState<string | null>(null);

  // 4. Quick Reading Modal State
  const [activePracticePassage, setActivePracticePassage] =
    useState<CuratedPassage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Merge Curated Passages with real Supabase database items
  const allPassages = useMemo<CuratedPassage[]>(() => {
    const curated = [...CURATED_PASSAGES];

    if (items && items.length > 0) {
      items.forEach((item, idx) => {
        const exists = curated.some((c) => c.slug === item.slug);
        if (!exists) {
          curated.push({
            id: `db-${item.slug || idx}`,
            slug: item.slug,
            title: item.title,
            subtitle: item.summary,
            badge: "OFFICIAL",
            badgeColor:
              "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
            passageNumber: ((idx % 3) + 1) as 1 | 2 | 3,
            category: item.difficulty || "Academic Reading",
            bandRange: item.difficulty || "Academic",
            bandGroup: "Band 6.5 - 7.5",
            estimatedMinutes: Math.max(
              1,
              Math.round((item.timeLimitSeconds || 960) / 60),
            ),
            questionsCount: item.questionCount || 10,
            completed: false,
            paragraphs: [
              {
                id: "p1",
                label: "Passage Overview",
                text: item.summary || item.title,
              },
            ],
            vocab: [
              {
                word: "Analysis",
                meaning: "Sự phân tích chuyên sâu",
                ipa: "/əˈnæl.ə.sɪs/",
                context: "in-depth textual analysis",
              },
            ],
            questions: [
              {
                id: 1,
                type: "true_false_not_given",
                q: `${item.title}: Information is directly verified in Paragraph A.`,
                answer: "TRUE",
                hint: "Xem kỹ nội dung tóm tắt trong đoạn văn mở đầu.",
              },
            ],
          });
        }
      });
    }

    return curated;
  }, [items]);

  // Filtered Passages
  const filteredPassages = useMemo(() => {
    return allPassages.filter((p) => {
      if (onlyUncompleted && p.completed) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSub = p.subtitle.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchCat) return false;
      }

      if (activeFilter === "ALL") return true;
      if (activeFilter === "PASSAGE_1") return p.passageNumber === 1;
      if (activeFilter === "PASSAGE_2") return p.passageNumber === 2;
      if (activeFilter === "PASSAGE_3") return p.passageNumber === 3;
      if (activeFilter === "TFNG")
        return p.questions.some((q) => q.type === "true_false_not_given");
      if (activeFilter === "MATCHING")
        return p.questions.some((q) => q.type === "matching_headings");
      if (activeFilter === "BAND_LOW") return p.bandGroup === "Band 4.5 - 6.5";
      if (activeFilter === "BAND_MID") return p.bandGroup === "Band 6.5 - 7.5";
      if (activeFilter === "BAND_HIGH") return p.bandGroup === "Band 7.5 - 9.0";
      return true;
    });
  }, [allPassages, activeFilter, searchQuery, onlyUncompleted]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    showToast(
      bookmarkedIds.includes(id)
        ? "Đã gỡ bài đọc"
        : "Đã lưu bài đọc vào yêu thích",
    );
  };

  return (
    <div className="reading-theme-root relative overflow-x-hidden pb-32 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-fadeIn fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-600/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-md">
          <Sparkles size={14} className="text-[#F6E85C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute top-1/4 right-0 h-[450px] w-[450px] rounded-full bg-teal-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-10 px-4 pt-4 sm:px-6 lg:px-8">
        {/* =========================================================
            1. HERO SECTION WITH 3D LEXICAL MATRIX SCANNER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-[#2B3060] bg-gradient-to-br from-[#141731] via-[#0E1528] to-[#122238] shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          <div className="relative grid grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:p-10">
            {/* Left 7 Columns */}
            <div className="relative z-10 space-y-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-300 uppercase">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                  <span className="-ml-4 h-2 w-2 rounded-full bg-emerald-400" />
                  READING TRAINING ARENA
                </div>

                {/* Band Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowBandDropdown(!showBandDropdown)}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/30"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>
                      {selectedStage.name} (Band {selectedStage.bandRange})
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>

                  {showBandDropdown && (
                    <div className="absolute left-0 z-50 mt-2 w-72 rounded-2xl border border-[#2B3060] bg-[#141731] p-2 shadow-2xl backdrop-blur-xl">
                      {READING_BAND_STAGES.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedStage(b);
                            setShowBandDropdown(false);
                            showToast(
                              `Đã chọn mục tiêu Reading: ${b.name} (${b.bandRange})`,
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                            selectedStage.id === b.id
                              ? "bg-emerald-600 text-white"
                              : "text-zinc-300 hover:bg-[#1B1F40]"
                          }`}
                        >
                          <div>
                            <div className="font-bold">
                              {b.name} ({b.bandRange})
                            </div>
                            <div className="text-[10px] font-normal text-zinc-400">
                              {b.vietnameseTitle}
                            </div>
                          </div>
                          {selectedStage.id === b.id && (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl leading-[1.15] font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Luyện Đọc IELTS Thực Chiến{" "}
                  <span className="mt-1 block bg-gradient-to-r from-emerald-400 via-teal-300 to-[#F6E85C] bg-clip-text text-transparent">
                    Skimming Nhanh & Bóc Tách Bẫy Logic.
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  Làm chủ kỹ thuật quét thông tin trong{" "}
                  <span className="font-medium text-emerald-300">
                    Passage 1, 2 và 3
                  </span>
                  , giải mã triệt để bẫy{" "}
                  <span className="font-medium text-[#F6E85C]">
                    True/False/Not Given
                  </span>{" "}
                  và nâng tốc độ đọc học thuật lên trên{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-emerald-300">
                    250 WPM
                  </code>
                  .
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById("live-reading-lab");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98]"
                >
                  <Target className="h-4 w-4 stroke-[2.5]" />
                  <span>Luyện Bẫy True/False/NG Ngay</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById("passage-library");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-600/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-indigo-600/45"
                >
                  <span>Khám phá kho bài đọc</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    isScanning
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                      : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Radio
                    className={`h-4 w-4 ${
                      isScanning
                        ? "animate-spin text-emerald-400"
                        : "text-emerald-400"
                    }`}
                  />
                  <span>
                    {isScanning
                      ? "Đang Quét Laser 3D"
                      : "Kích hoạt Quét Laser 3D"}
                  </span>
                </button>
              </div>

              {/* Mini Metrics */}
              <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                    TIẾN ĐỘ LUYỆN TẬP
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-white">
                      {Math.min(attemptsCount, 5)}
                    </span>
                    <span className="text-xs text-zinc-400">/ 5 bài</span>
                    <span className="ml-auto text-[11px] font-semibold text-emerald-300">
                      {attemptsCount} lượt làm
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1B1F40]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${Math.min(100, attemptsCount * 20)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <Target className="h-3.5 w-3.5 text-teal-400" />
                    ĐỘ HIỂU BÀI
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-black text-teal-300">
                      {comprehensionRate !== null
                        ? `${comprehensionRate}%`
                        : "--"}
                    </span>
                    <span className="rounded border border-teal-500/30 bg-teal-500/15 px-1.5 py-0.5 text-[10px] text-teal-300/80">
                      {comprehensionRate !== null
                        ? "Đã chấm điểm"
                        : "Chưa có dữ liệu"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1B1F40]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${comprehensionRate ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <Gauge className="h-3.5 w-3.5 text-amber-400" />
                    TỐC ĐỘ ĐỌC (WPM)
                  </div>
                  <div className="mt-1">
                    <span className="block truncate text-xl font-black text-amber-300">
                      {readingSpeedWpm} WPM
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Chuẩn IELTS: 240+ WPM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: 3D Cybernetic Lexical Matrix */}
            <div className="relative flex flex-col gap-4 lg:col-span-5">
              <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0C0E1D]/90 shadow-2xl">
                <div className="relative z-10 flex items-center justify-between border-b border-[#2B3060]/70 bg-[#0C0E1D]/50 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Activity
                      className={`h-4 w-4 ${
                        isScanning
                          ? "animate-pulse text-emerald-400"
                          : "text-indigo-400"
                      }`}
                    />
                    <span className="text-xs font-bold tracking-wide text-zinc-200">
                      3D LEXICAL MATRIX SCANNER
                    </span>
                  </div>

                  {/* Mode Buttons */}
                  <div className="flex items-center gap-1 rounded-lg border border-[#2B3060] bg-[#141731] p-0.5">
                    {(
                      [
                        { id: "matrix" as const, label: "Matrix" },
                        { id: "laser" as const, label: "Laser" },
                        { id: "cluster" as const, label: "Cluster" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setVisualMode(m.id)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                          visualMode === m.id
                            ? "bg-emerald-600 text-white shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Canvas */}
                <div className="relative flex flex-1 items-center justify-center">
                  <ThreeReadingVisualizer
                    isScanning={isScanning}
                    visualMode={visualMode}
                    readingSpeedWpm={readingSpeedWpm}
                  />

                  {/* Overlay Info */}
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-[#2B3060] bg-[#141731]/85 px-3 py-2 text-[11px] backdrop-blur-md">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isScanning
                            ? "animate-ping bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <span className="truncate font-medium text-zinc-300">
                        {isScanning
                          ? "Đang quét trường ngữ nghĩa..."
                          : "Di chuột để xoay ma trận từ vựng"}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 font-mono font-bold text-emerald-300">
                      {readingSpeedWpm} WPM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. LIVE READING MINI-LAB (T/F/NG, WPM & MATCHING HEADINGS)
        ========================================================= */}
        <LiveReadingLab onWpmUpdate={(wpm) => setReadingSpeedWpm(wpm)} />

        {/* =========================================================
            3. 4 CHẾ ĐỘ ĐỌC CHUYÊN SÂU (BENTO GRID)
        ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                <Sliders className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                4 Chế Độ Luyện Đọc Chuyên Sâu
              </h2>
            </div>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Chọn phương pháp phù hợp với từng giai đoạn ôn luyện
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Bento 1: Skimming & Scanning */}
            <div
              onClick={() => {
                const el = document.getElementById("live-reading-lab");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#141731] via-[#10132B] to-[#132A33] p-6 shadow-lg transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-500/10 lg:col-span-5"
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-extrabold tracking-wide text-emerald-300 uppercase">
                    ★ TỐC ĐỘ CAO
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white transition-colors group-hover:text-emerald-200">
                    Skimming & Scanning (Đọc Lướt & Định Vị)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Luyện mắt quét tìm mốc thời gian, tên riêng, thuật ngữ trong
                    30 giây để định vị đoạn chứa đáp án mà không cần đọc từng
                    chữ.
                  </p>
                </div>

                <div className="space-y-1 rounded-2xl border border-[#2B3060] bg-[#0C0E1D] p-3 font-mono text-xs">
                  <div className="text-zinc-400">
                    Scanning keywords: "multispectral", "LiDAR", "Guatemala"
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span>✓ Định vị xong trong 12 giây</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#2B3060]/70 pt-4 text-xs font-bold text-emerald-400 transition-colors group-hover:text-emerald-300">
                <span className="underline underline-offset-4">
                  Thử thách bấm giờ đọc ngay
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Bento 2: Deep Academic Passages */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-cyan-500/40 lg:col-span-4">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-400">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Deep Academic Passages
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Đọc hiểu sâu các bài nghiên cứu học thuật phức tạp (Passage
                    2 & 3) về sinh thái, khảo cổ học và vật lý học.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Passage 1 (Dễ)", "Passage 2 (Vừa)", "Passage 3 (Khó)"].map(
                    (p, idx) => (
                      <button
                        key={p}
                        onClick={() => {
                          setActiveFilter(`PASSAGE_${idx + 1}`);
                          document
                            .getElementById("passage-library")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-xl border border-[#2B3060] bg-[#0C0E1D] px-2.5 py-1.5 text-xs font-bold text-zinc-300 transition-colors hover:text-white"
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveFilter("PASSAGE_3");
                  document
                    .getElementById("passage-library")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 flex items-center justify-between border-t border-[#2B3060]/70 pt-4 text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300"
              >
                <span>Xem các bài đọc Passage 3</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Bento 3: Vocabulary in Context */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-indigo-500/40 lg:col-span-3">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-400">
                  <BookA className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Từ Vựng Ngữ Cảnh
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Học từ vựng học thuật C1/C2 trực tiếp trong ngữ cảnh bài đọc
                    thực tế thay vì học thuộc lòng.
                  </p>
                </div>

                <div className="space-y-1 rounded-xl border border-[#2B3060] bg-[#0C0E1D] p-2.5 text-[11px] text-zinc-300">
                  <div className="font-bold text-indigo-300">
                    Academic Word List (AWL):
                  </div>
                  <div className="text-zinc-400">
                    • Anthropogenic, Eschew, Periphery...
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveFilter("ALL");
                  document
                    .getElementById("passage-library")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 flex items-center justify-between border-t border-[#2B3060]/70 pt-4 text-xs font-bold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                <span>Luyện từ vựng theo bài</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Bento Banner 4: Full Test Banner */}
          <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-r from-[#141731] via-[#10242E] to-[#123630] p-6 shadow-xl sm:p-7 lg:flex-row lg:items-center">
            <div className="relative z-10 flex items-start gap-4 sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/25 text-emerald-300 shadow-lg shadow-emerald-500/20">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white sm:text-xl">
                    Full Reading Comprehension Test (Đề Thi Chuẩn 60 Phút)
                  </h3>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                    CAMBRIDGE FORMAT
                  </span>
                </div>
                <p className="max-w-3xl text-xs leading-relaxed text-zinc-300 sm:text-sm">
                  Mô phỏng áp lực phòng thi thật với{" "}
                  <strong className="text-white">
                    3 Passages (40 câu hỏi, 60 phút)
                  </strong>
                  . Bấm giờ đếm ngược, giao diện chia đôi cột chuẩn thi máy và
                  chấm điểm thang 9.0.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivePracticePassage(allPassages[0])}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] sm:w-auto"
            >
              <span>Vào thi thử Full Reading</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* =========================================================
            4. KHO BÀI ĐỌC THỰC CHIẾN (PASSAGE LIBRARY)
        ========================================================= */}
        <section id="passage-library" className="scroll-mt-20 space-y-6 pt-2">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <Compass className="h-6 w-6 text-emerald-400" />
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  Kho Bài Đọc Thực Chiến ({filteredPassages.length})
                </h2>
              </div>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Đang lọc theo:{" "}
                <strong className="text-emerald-300">
                  {selectedStage.name} (Band {selectedStage.bandRange})
                </strong>{" "}
                • Tích hợp Split-View & tra cứu từ vựng
              </p>
            </div>

            {/* Search & Only Uncompleted */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài đọc, chủ đề, Passage..."
                  className="w-full rounded-2xl border border-[#2B3060] bg-[#141731] py-2.5 pr-4 pl-10 text-xs text-white placeholder-zinc-500 transition-colors outline-none focus:border-emerald-400 sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setOnlyUncompleted(!onlyUncompleted)}
                className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  onlyUncompleted
                    ? "border-emerald-400 bg-emerald-600/25 text-emerald-200"
                    : "border-[#2B3060] bg-[#141731] text-zinc-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Chưa đọc</span>
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "ALL", label: "Tất cả bài đọc" },
              { id: "PASSAGE_1", label: "Passage 1 (Dễ)" },
              { id: "PASSAGE_2", label: "Passage 2 (Vừa)" },
              { id: "PASSAGE_3", label: "Passage 3 (Học thuật)" },
              { id: "TFNG", label: "🎯 Bẫy True/False/NG" },
              { id: "MATCHING", label: "📑 Matching Headings" },
              { id: "BAND_LOW", label: "Band 4.5 - 6.5" },
              { id: "BAND_MID", label: "Band 6.5 - 7.5" },
              { id: "BAND_HIGH", label: "Band 7.5 - 9.0" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === chip.id
                    ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "border-[#2B3060] bg-[#141731] text-zinc-300 hover:bg-[#1B1F40] hover:text-white"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Passages Grid */}
          {filteredPassages.length === 0 ? (
            <div className="space-y-3 rounded-3xl border border-[#2B3060] bg-[#141731] p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-zinc-500" />
              <div className="text-base font-bold text-white">
                Không tìm thấy bài đọc phù hợp
              </div>
              <p className="text-xs text-zinc-400">
                Hãy thử xóa bộ lọc hoặc tìm kiếm bằng từ khóa khác.
              </p>
              <button
                onClick={() => {
                  setActiveFilter("ALL");
                  setSearchQuery("");
                  setOnlyUncompleted(false);
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredPassages.map((passage) => {
                const isBookmarked = bookmarkedIds.includes(passage.id);

                return (
                  <article
                    key={passage.id}
                    className="group flex flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#1B1F40] hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-md border bg-gradient-to-r px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${passage.badgeColor}`}
                          >
                            Passage {passage.passageNumber}
                          </span>
                          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                            Band {passage.bandRange}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleBookmark(passage.id)}
                          title={
                            isBookmarked ? "Gỡ khỏi yêu thích" : "Lưu bài đọc"
                          }
                          aria-label="Lưu bài đọc"
                          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                            isBookmarked
                              ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                              : "border-[#2B3060] bg-[#0C0E1D] text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Bookmark
                            className={`h-3.5 w-3.5 ${isBookmarked ? "fill-emerald-400 text-emerald-400" : ""}`}
                          />
                        </button>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white transition-colors group-hover:text-emerald-300">
                          <span>{passage.title}</span>
                          {passage.completed && (
                            <span title="Đã hoàn thành">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            </span>
                          )}
                        </h3>
                        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                          {passage.subtitle}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex items-center justify-between border-t border-[#2B3060]/60 pt-3 text-xs text-zinc-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />~
                            {passage.estimatedMinutes}m
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Layers className="h-3.5 w-3.5 text-zinc-500" />
                            {passage.wordCount
                              ? `${passage.wordCount} từ`
                              : `${passage.questionsCount} câu hỏi`}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-300/90">
                          {passage.category}
                        </span>
                      </div>

                      {/* Paraphrase & Vocab Trigger */}
                      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#2B3060]/60 bg-[#0C0E1D] px-3 py-1.5 text-[11px]">
                        <span className="font-medium text-amber-300/90">
                          {passage.paraphraseTraps !== undefined
                            ? `🎯 ${passage.paraphraseTraps} bẫy Paraphrase`
                            : `📘 ${passage.questionsCount} câu hỏi chuẩn đề`}
                        </span>
                        <button
                          onClick={() =>
                            setVocabPopoverId(
                              vocabPopoverId === passage.id ? null : passage.id,
                            )
                          }
                          className="font-semibold text-cyan-300 hover:underline"
                        >
                          {vocabPopoverId === passage.id
                            ? "Đóng từ vựng"
                            : "+ Xem từ vựng key"}
                        </button>
                      </div>

                      {/* Vocab Accordion */}
                      {vocabPopoverId === passage.id && (
                        <div className="animate-fadeIn mt-2 space-y-1.5 rounded-2xl border border-cyan-500/30 bg-[#0C0E1D] p-3 text-xs">
                          {passage.vocab.map((v, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="font-bold text-white">
                                {v.word}
                              </span>
                              <span className="text-zinc-400">{v.meaning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons: Đọc thử & Làm bài */}
                    <div className="mt-5 grid grid-cols-12 gap-2.5 pt-1">
                      <button
                        onClick={() => setActivePracticePassage(passage)}
                        className="col-span-7 flex items-center justify-center gap-1.5 rounded-xl border border-[#2B3060] bg-[#1B1F40] px-4 py-2.5 text-xs font-bold text-zinc-200 transition-colors hover:bg-[#252A56]"
                      >
                        <BookOpen size={14} className="text-emerald-400" />
                        <span>Đọc thử Split-View</span>
                      </button>

                      {passage.id.startsWith("db-") ? (
                        <Link
                          href={`/practice/reading/${passage.slug}`}
                          className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 px-4 py-2.5 text-xs font-extrabold text-emerald-300 shadow-sm transition-all hover:from-emerald-500 hover:to-teal-500 hover:text-slate-950"
                        >
                          <span>Làm bài</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => setActivePracticePassage(passage)}
                          className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 px-4 py-2.5 text-xs font-extrabold text-emerald-300 shadow-sm transition-all hover:from-emerald-500 hover:to-teal-500 hover:text-slate-950"
                        >
                          <span>Làm bài</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================
            5. CHUYÊN ĐỀ LUYỆN ĐỌC THEO CHỦ ĐỀ (TOPIC TRACKS)
        ========================================================= */}
        <section className="space-y-5 pt-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-6 w-6 text-emerald-400" />
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  Chuyên Đề Luyện Đọc Theo Lĩnh Vực
                </h2>
              </div>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Bao quát toàn diện các chủ đề học thuật Cambridge IELTS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {READING_TOPIC_TRACKS.map((track) => {
              const IconComponent = track.icon;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setSearchQuery(track.title.split(" ")[0]);
                    document
                      .getElementById("passage-library")
                      ?.scrollIntoView({ behavior: "smooth" });
                    showToast(`Lọc bài đọc theo chủ đề: ${track.title}`);
                  }}
                  className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#1B1F40]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2B3060] bg-[#0C0E1D] text-emerald-300 transition-transform group-hover:scale-110">
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                        {track.focusBadge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white transition-colors group-hover:text-emerald-300 sm:text-lg">
                        {track.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        {track.subtitle}
                      </p>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-[#2B3060] bg-[#0C0E1D] px-2 py-0.5 text-[10px] text-zinc-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Topic filter footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#2B3060]/60 pt-3 text-xs">
                    <span className="font-medium text-zinc-400">
                      {track.passagesCount} bài tham khảo
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-300 transition-transform group-hover:translate-x-0.5">
                      <span>Lọc chủ đề</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* =========================================================
          6. QUICK READING MODAL (SPLIT-VIEW PASSAGE & QUESTIONS)
      ========================================================= */}
      {activePracticePassage && (
        <QuickReadingModal
          passage={activePracticePassage}
          hasFullRunner={items.some(
            (item) => item.slug === activePracticePassage.slug,
          )}
          fallbackSlug={items[0]?.slug}
          onClose={() => setActivePracticePassage(null)}
        />
      )}
    </div>
  );
}
