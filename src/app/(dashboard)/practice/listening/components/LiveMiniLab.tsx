"use client";

import { useState, useMemo } from "react";
import {
  Zap,
  Mic,
  Sparkles,
  BarChart3,
  Volume2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  DICTATION_SENTENCES,
  PARAPHRASE_PAIRS,
  DIAGNOSTIC_SKILLS,
  type DictationSentence,
  type ParaphrasePair,
} from "./listening-curated-data";

export interface LiveMiniLabProps {
  playbackSpeed: number;
  onSpeak: (text: string, lang?: string, rate?: number) => void;
}

export function LiveMiniLab({ playbackSpeed, onSpeak }: LiveMiniLabProps) {
  const [activeTab, setActiveTab] = useState<
    "dictation" | "paraphrase" | "diagnostic"
  >("dictation");
  const [dictationIdx, setDictationIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedParaphraseId, setSelectedParaphraseId] = useState("p1");

  const currentDictation: DictationSentence =
    DICTATION_SENTENCES[dictationIdx] ?? DICTATION_SENTENCES[0];

  // Real-time word diff calculation for IELTS
  const dictationWordDiff = useMemo(() => {
    const targetWords = currentDictation.text.split(" ");
    const typedWords = userInput.trim().split(/\s+/).filter(Boolean);

    return targetWords.map((tWord, index) => {
      const cleanTarget = tWord.replace(/[.,?!;:"]/g, "").toLowerCase();
      const typed = typedWords[index]
        ? typedWords[index].replace(/[.,?!;:"]/g, "").toLowerCase()
        : "";

      if (!typed) return { word: tWord, status: "pending" as const };
      if (typed === cleanTarget)
        return { word: tWord, status: "correct" as const };

      // Check for missing -s or -ed endings (most common IELTS trap)
      if (
        cleanTarget.startsWith(typed) &&
        (cleanTarget.endsWith("s") ||
          cleanTarget.endsWith("ed") ||
          cleanTarget.endsWith("es"))
      ) {
        return { word: tWord, status: "ending-missed" as const, typed };
      }

      return { word: tWord, status: "wrong" as const, typed };
    });
  }, [currentDictation, userInput]);

  const activePair: ParaphrasePair =
    PARAPHRASE_PAIRS.find((item) => item.id === selectedParaphraseId) ??
    PARAPHRASE_PAIRS[0];

  return (
    <section
      id="live-mini-lab"
      className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#141731] via-[#10132B] to-[#0C0E1D] p-5 shadow-xl sm:p-7"
    >
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header & Tabs */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-[#2B3060]/70 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-300">
            <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Trạm Phản Xạ Âm Thanh Tức Thì (Live Mini-Lab)
              </h2>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase">
                Tương tác trực tiếp
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">
              Khởi động tai nghe trong 30 giây: bắt lỗi âm đuôi (-s/-ed) theo
              thời gian thực & giải mã bẫy Paraphrase
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex shrink-0 items-center gap-1.5 self-start rounded-2xl border border-[#2B3060] bg-[#0C0E1D] p-1.5 md:self-auto">
          <button
            onClick={() => setActiveTab("dictation")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "dictation"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Mic size={14} />
            <span>Chép Chính Tả 1 Câu</span>
          </button>
          <button
            onClick={() => setActiveTab("paraphrase")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "paraphrase"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Sparkles size={14} />
            <span>Bẫy Paraphrase</span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === "diagnostic"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <BarChart3 size={14} />
            <span>Radar Kỹ Năng</span>
          </button>
        </div>
      </div>

      {/* TAB 1: QUICK DICTATION */}
      {activeTab === "dictation" && (
        <div className="relative z-10 grid grid-cols-1 items-start gap-6 pt-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                  Câu #{dictationIdx + 1}/{DICTATION_SENTENCES.length}
                </span>
                <span className="rounded-lg border border-[#2B3060] bg-[#1B1F40] px-2.5 py-1 text-xs font-medium text-zinc-300">
                  {currentDictation.accent}
                </span>
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  {currentDictation.band}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onSpeak(
                      currentDictation.text,
                      currentDictation.lang,
                      playbackSpeed,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Nghe câu mẫu ({playbackSpeed}x)</span>
                </button>
                <button
                  onClick={() => {
                    setDictationIdx(
                      (prev) => (prev + 1) % DICTATION_SENTENCES.length,
                    );
                    setUserInput("");
                    setShowAnswer(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#2B3060] bg-[#1B1F40] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-[#252A56]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Đổi câu</span>
                </button>
              </div>
            </div>

            {/* Input area */}
            <div className="relative">
              <textarea
                rows={2}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Bấm 'Nghe câu mẫu' rồi gõ lại chính xác từng từ bạn nghe được vào đây (chú ý âm đuôi -s, -ed)..."
                className="w-full resize-none rounded-2xl border border-indigo-500/30 bg-[#0C0E1D] p-4 text-sm leading-relaxed text-white placeholder-zinc-500 transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span className="text-[11px] sm:text-xs">
                  💡 Mẹo: Hệ thống tự động bắt lỗi thiếu âm đuôi (-s, -ed) theo
                  thời gian thực.
                </span>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="ml-2 flex shrink-0 items-center gap-1 font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {showAnswer ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  <span>{showAnswer ? "Ẩn đáp án" : "Hiện đáp án chuẩn"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Diff Box */}
          <div className="space-y-3 rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/90 p-4 shadow-inner lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                So khớp Diff Ký Tự Tức Thì
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-medium text-emerald-400">● Đúng</span>
                <span className="font-medium text-amber-400">
                  ● Thiếu -s/-ed
                </span>
                <span className="font-medium text-rose-400">● Sai</span>
              </div>
            </div>

            <div className="flex min-h-[72px] flex-wrap items-center gap-1.5 rounded-xl border border-[#2B3060]/60 bg-[#141731]/70 p-3.5">
              {dictationWordDiff.map((item, idx) => {
                if (item.status === "correct") {
                  return (
                    <span
                      key={idx}
                      className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300"
                    >
                      {item.word}
                    </span>
                  );
                }
                if (item.status === "ending-missed") {
                  return (
                    <span
                      key={idx}
                      title="Bạn gõ thiếu âm đuôi -s hoặc -ed!"
                      className="animate-pulse rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300"
                    >
                      {item.typed}
                      <u className="ml-0.5 font-black text-amber-200">
                        [-s/-ed?]
                      </u>
                    </span>
                  );
                }
                if (item.status === "wrong") {
                  return (
                    <span
                      key={idx}
                      className="rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-xs text-rose-300 line-through"
                    >
                      {item.typed}
                    </span>
                  );
                }
                return (
                  <span
                    key={idx}
                    className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-zinc-500"
                  >
                    {showAnswer ? (
                      <span className="text-indigo-300">{item.word}</span>
                    ) : (
                      "•".repeat(Math.min(item.word.length, 7))
                    )}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 text-[11px] text-zinc-400">
                Bẫy âm thanh trong câu:
              </span>
              {currentDictation.traps.map((trap, i) => (
                <span
                  key={i}
                  className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300"
                >
                  {trap}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARAPHRASE TRAPS */}
      {activeTab === "paraphrase" && (
        <div className="relative z-10 grid grid-cols-1 items-center gap-6 pt-6 md:grid-cols-12">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-7">
            {PARAPHRASE_PAIRS.map((p) => {
              const isSelected = selectedParaphraseId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedParaphraseId(p.id);
                    onSpeak(p.audio, "en-GB", 1.0);
                  }}
                  className={`rounded-2xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-600/20 shadow-lg shadow-indigo-600/20"
                      : "border-[#2B3060] bg-[#0C0E1D]/80 hover:border-zinc-500"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-indigo-300">
                    <span>🎧 TRONG BĂNG NGHE</span>
                    <Volume2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm font-bold tracking-tight text-white">
                    "{p.audio}"
                  </div>
                  <div className="mt-2 border-t border-[#2B3060]/60 pt-2 text-xs font-medium text-emerald-300">
                    📝 Đề bài: "{p.question}"
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-[#0C0E1D] p-5 md:col-span-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>GIẢI MÃ BẪY PARAPHRASE CAMBRIDGE</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-200">
              {activePair.explanation}
            </p>
            <div className="rounded-xl border border-[#2B3060] bg-[#141731] p-3 text-xs text-zinc-400">
              Hơn{" "}
              <strong className="text-white">75% câu hỏi Section 3 & 4</strong>{" "}
              không lặp lại từ nguyên gốc trong băng mà dùng cấu trúc tương
              đương ngữ nghĩa như trên.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IELTS LISTENING EXAM BENCHMARKS & SKILLS */}
      {activeTab === "diagnostic" && (
        <div className="relative z-10 grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIAGNOSTIC_SKILLS.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between space-y-2.5 rounded-2xl border border-[#2B3060] bg-[#0C0E1D] p-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-zinc-400">
                    {s.focusLevel}
                  </span>
                  <span className="text-xs font-extrabold text-indigo-300">
                    {s.weight}
                  </span>
                </div>
                <div className="text-sm font-bold text-zinc-100">{s.label}</div>
                <p className="text-xs leading-relaxed text-zinc-400">
                  {s.description}
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1B1F40]">
                <div
                  className={`h-full w-full bg-gradient-to-r ${s.color} rounded-full opacity-80`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
