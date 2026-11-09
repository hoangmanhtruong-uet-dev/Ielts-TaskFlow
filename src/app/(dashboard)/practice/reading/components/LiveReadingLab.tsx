"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Target,
  Gauge,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpenCheck,
  Timer,
} from "lucide-react";

import {
  TRUE_FALSE_TRAPS,
  SPEED_READING_TEXTS,
  MATCHING_HEADING_TRAPS,
  type TrueFalseTrap,
  type SpeedReadingText,
  type MatchingHeadingTrap,
} from "./reading-curated-data";

export interface LiveReadingLabProps {
  onWpmUpdate?: (wpm: number) => void;
}

export function LiveReadingLab({ onWpmUpdate }: LiveReadingLabProps) {
  const [activeTab, setActiveTab] = useState<"tfng" | "speed" | "headings">(
    "tfng",
  );

  // Tab 1: TFNG State
  const [tfngIdx, setTfngIdx] = useState(0);
  const [selectedTfngAnswer, setSelectedTfngAnswer] = useState<
    "TRUE" | "FALSE" | "NOT GIVEN" | null
  >(null);

  // Tab 2: Speed WPM State
  const [speedIdx, setSpeedIdx] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [calculatedWpm, setCalculatedWpm] = useState<number | null>(null);
  const [selectedComprehensionAns, setSelectedComprehensionAns] = useState<
    string | null
  >(null);

  // Tab 3: Matching Headings State
  const [headingIdx] = useState(0);
  const [selectedHeadingOptionId, setSelectedHeadingOptionId] = useState<
    string | null
  >(null);

  const currentTfng: TrueFalseTrap =
    TRUE_FALSE_TRAPS[tfngIdx] ?? TRUE_FALSE_TRAPS[0];
  const currentSpeedText: SpeedReadingText =
    SPEED_READING_TEXTS[speedIdx] ?? SPEED_READING_TEXTS[0];
  const currentHeading: MatchingHeadingTrap =
    MATCHING_HEADING_TRAPS[headingIdx] ?? MATCHING_HEADING_TRAPS[0];

  // Timer for Speed Reading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReading) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReading]);

  const handleStartReading = () => {
    setIsReading(true);
    setElapsedSeconds(0);
    setCalculatedWpm(null);
    setSelectedComprehensionAns(null);
  };

  const handleFinishReading = () => {
    setIsReading(false);
    const secs = Math.max(1, elapsedSeconds);
    const wpm = Math.round((currentSpeedText.wordCount / secs) * 60);
    setCalculatedWpm(wpm);
    if (onWpmUpdate) onWpmUpdate(wpm);
  };

  return (
    <section
      id="live-reading-lab"
      className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#141731] via-[#10132B] to-[#0C0E1D] p-5 shadow-xl sm:p-7"
    >
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header & Tabs */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-[#2B3060]/70 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
            <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Trạm Phản Xạ Đọc Hiểu Tức Thì (Live Reading Mini-Lab)
              </h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 uppercase">
                Thực chiến 30s
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">
              Giải mã bẫy True/False/Not Given, đo tốc độ đọc từ/phút (WPM) và
              phân tích câu chủ đề đoạn văn
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex shrink-0 items-center gap-1.5 self-start rounded-2xl border border-[#2B3060] bg-[#0C0E1D] p-1.5 md:self-auto">
          <button
            onClick={() => setActiveTab("tfng")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "tfng"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Target size={14} />
            <span>Bẫy True/False/NG</span>
          </button>
          <button
            onClick={() => setActiveTab("speed")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "speed"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Gauge size={14} />
            <span>Speed WPM Meter</span>
          </button>
          <button
            onClick={() => setActiveTab("headings")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "headings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <BookOpenCheck size={14} />
            <span>Matching Headings</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRUE / FALSE / NOT GIVEN DETECTIVE */}
      {activeTab === "tfng" && (
        <div className="relative z-10 grid grid-cols-1 items-start gap-6 pt-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                Câu #{tfngIdx + 1}/{TRUE_FALSE_TRAPS.length} • Bẫy:{" "}
                {currentTfng.trapType}
              </span>

              <button
                onClick={() => {
                  setTfngIdx((prev) => (prev + 1) % TRUE_FALSE_TRAPS.length);
                  setSelectedTfngAnswer(null);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-[#2B3060] bg-[#1B1F40] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-[#252A56]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Đổi câu bẫy</span>
              </button>
            </div>

            {/* Passage Quote */}
            <div className="space-y-1.5 rounded-2xl border border-indigo-500/30 bg-[#0C0E1D] p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-indigo-300 uppercase">
                <Sparkles size={13} className="text-[#F6E85C]" />
                Đoạn trích từ bài đọc:
              </div>
              <p className="text-sm leading-relaxed text-zinc-200 italic">
                "{currentTfng.passageSnippet}"
              </p>
            </div>

            {/* Statement to verify */}
            <div className="space-y-3 rounded-2xl border border-[#2B3060] bg-[#141731] p-4">
              <div className="text-xs font-bold text-amber-300">
                Khẳng định trong đề bài:
              </div>
              <div className="text-sm leading-relaxed font-semibold text-white">
                "{currentTfng.statement}"
              </div>

              {/* 3 Answer Choices */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((choice) => {
                  const isSelected = selectedTfngAnswer === choice;
                  const isCorrect = choice === currentTfng.answer;

                  let btnStyle =
                    "bg-[#0C0E1D] border-[#2B3060] text-zinc-300 hover:text-white hover:border-indigo-400";
                  if (selectedTfngAnswer) {
                    if (isCorrect) {
                      btnStyle =
                        "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500/20 border-rose-400 text-rose-300";
                    }
                  }

                  return (
                    <button
                      key={choice}
                      onClick={() => setSelectedTfngAnswer(choice)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold tracking-wider transition-all ${btnStyle}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Logic Explanation Box */}
          <div className="space-y-3 rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/90 p-5 lg:col-span-5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              <HelpCircle size={15} className="text-indigo-400" />
              <span>Giải mã bẫy logic Cambridge</span>
            </div>

            {selectedTfngAnswer ? (
              <div className="animate-fadeIn space-y-3">
                <div className="flex items-center gap-2">
                  {selectedTfngAnswer === currentTfng.answer ? (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                      <CheckCircle2 size={18} />
                      <span>Chính xác! Đáp án là {currentTfng.answer}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-rose-400">
                      <XCircle size={18} />
                      <span>
                        Chưa đúng! Đáp án chuẩn là {currentTfng.answer}
                      </span>
                    </div>
                  )}
                </div>

                <p className="rounded-xl border border-[#2B3060] bg-[#141731] p-3.5 text-sm leading-relaxed text-zinc-300">
                  {currentTfng.explanation}
                </p>

                <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-[11px] text-zinc-400">
                  💡 <strong>Quy tắc vàng:</strong> False nghĩa là thông tin đối
                  lập trực tiếp. Not Given nghĩa là bài đọc có thể nhắc từ khóa
                  nhưng không khẳng định mối quan hệ đề bài nêu.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                Bấm chọn một trong 3 phương án <strong>TRUE, FALSE</strong> hoặc{" "}
                <strong>NOT GIVEN</strong> để xem phân tích bẫy chi tiết.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SPEED READING WPM METER */}
      {activeTab === "speed" && (
        <div className="relative z-10 grid grid-cols-1 items-start gap-6 pt-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  {currentSpeedText.title}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {currentSpeedText.wordCount} từ
                </span>
                {SPEED_READING_TEXTS.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpeedIdx(
                        (prev) => (prev + 1) % SPEED_READING_TEXTS.length,
                      );
                      setIsReading(false);
                      setElapsedSeconds(0);
                      setCalculatedWpm(null);
                      setSelectedComprehensionAns(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#2B3060] bg-[#1B1F40] px-2.5 py-1 text-[11px] font-semibold text-zinc-200 transition-colors hover:bg-[#252A56]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Đổi đoạn đọc</span>
                  </button>
                )}
              </div>

              {!isReading && !calculatedWpm && (
                <button
                  onClick={handleStartReading}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  Bắt đầu bấm giờ đọc
                </button>
              )}

              {isReading && (
                <button
                  onClick={handleFinishReading}
                  className="animate-pulse rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md"
                >
                  Đã đọc xong ({elapsedSeconds}s)
                </button>
              )}

              {calculatedWpm && (
                <button
                  onClick={handleStartReading}
                  className="rounded-xl border border-[#2B3060] bg-[#1B1F40] px-3 py-1.5 text-xs font-semibold text-zinc-200"
                >
                  Đo lại
                </button>
              )}
            </div>

            {/* Reading Box */}
            <div className="relative rounded-2xl border border-emerald-500/30 bg-[#0C0E1D] p-5 font-serif text-sm leading-relaxed text-zinc-200 sm:text-base">
              {currentSpeedText.text}
            </div>
          </div>

          {/* WPM Result & Comprehension Check */}
          <div className="space-y-4 rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/90 p-5 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Chỉ số Tốc độ Đọc (WPM)
              </span>
              <Timer size={16} className="text-emerald-400" />
            </div>

            {calculatedWpm ? (
              <div className="animate-fadeIn space-y-4">
                <div className="flex items-baseline justify-between rounded-xl border border-[#2B3060] bg-[#141731] p-4">
                  <div>
                    <span className="text-3xl font-black text-emerald-400">
                      {calculatedWpm}
                    </span>
                    <span className="ml-1.5 text-xs font-bold text-zinc-400">
                      WPM (Từ/Phút)
                    </span>
                  </div>
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      calculatedWpm >= 240
                        ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {calculatedWpm >= 240
                      ? "Đạt chuẩn IELTS Academic"
                      : "Cần tăng tốc độ"}
                  </span>
                </div>

                {/* Comprehension Check */}
                <div className="space-y-2 border-t border-[#2B3060]/70 pt-2">
                  <div className="text-xs font-bold text-indigo-300">
                    Kiểm tra độ hiểu (Comprehension Check):
                  </div>
                  <div className="text-xs font-medium text-white">
                    {currentSpeedText.checkQuestion.q}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {currentSpeedText.checkQuestion.options.map((opt) => {
                      const isCorrect =
                        opt === currentSpeedText.checkQuestion.answer;
                      const isChosen = selectedComprehensionAns === opt;

                      let optStyle =
                        "bg-[#141731] border-[#2B3060] text-zinc-300 hover:text-white";
                      if (selectedComprehensionAns) {
                        if (isCorrect)
                          optStyle =
                            "bg-emerald-500/20 border-emerald-400 text-emerald-300";
                        else if (isChosen)
                          optStyle =
                            "bg-rose-500/20 border-rose-400 text-rose-300";
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => setSelectedComprehensionAns(opt)}
                          className={`w-full rounded-xl border p-2.5 text-left text-xs font-medium transition-colors ${optStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-zinc-500">
                Bấm <strong>"Bắt đầu bấm giờ đọc"</strong>, đọc hết đoạn trích
                và bấm <strong>"Đã đọc xong"</strong> để xem tốc độ WPM thực tế
                của bạn.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MATCHING HEADINGS STRATEGIST */}
      {activeTab === "headings" && (
        <div className="relative z-10 grid grid-cols-1 items-start gap-6 pt-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                {currentHeading.paragraphLabel}
              </span>
              <span className="text-xs text-zinc-400">
                Chọn 1 tiêu đề tóm lược toàn bộ đoạn văn
              </span>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-[#0C0E1D] p-4 font-serif text-sm leading-relaxed text-zinc-200">
              "{currentHeading.paragraphText}"
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-zinc-400">
                Các lựa chọn tiêu đề (Headings):
              </div>
              {currentHeading.options.map((opt) => {
                const isSelected = selectedHeadingOptionId === opt.id;
                let optStyle =
                  "bg-[#141731] border-[#2B3060] text-zinc-300 hover:border-indigo-400 hover:text-white";
                if (selectedHeadingOptionId) {
                  if (opt.isCorrect)
                    optStyle =
                      "bg-emerald-500/20 border-emerald-400 text-emerald-300";
                  else if (isSelected)
                    optStyle = "bg-rose-500/20 border-rose-400 text-rose-300";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedHeadingOptionId(opt.id)}
                    className={`w-full rounded-2xl border p-3.5 text-left text-xs font-semibold transition-all ${optStyle}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Heading Explanation */}
          <div className="space-y-3 rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/90 p-5 lg:col-span-5">
            <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
              Phân tích Bẫy Tiêu Đề
            </div>

            {selectedHeadingOptionId ? (
              <div className="animate-fadeIn space-y-3">
                {currentHeading.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`rounded-xl border p-3 text-xs leading-relaxed ${
                      opt.isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-[#2B3060] bg-[#141731] text-zinc-400"
                    }`}
                  >
                    <div className="mb-1 font-bold text-white">
                      {opt.isCorrect ? "✓ Tiêu đề đúng" : "✗ Bẫy thường gặp"}:
                    </div>
                    {opt.reason}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                Bấm vào một trong các tiêu đề bên trái để xem bóc tách chi tiết.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
