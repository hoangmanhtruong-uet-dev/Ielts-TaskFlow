"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Headphones,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from "lucide-react";

import type { CuratedExercise } from "./listening-curated-data";

export interface QuickPracticeModalProps {
  exercise: CuratedExercise;
  hasFullRunner?: boolean;
  fallbackSlug?: string;
  playbackSpeed: number;
  onClose: () => void;
  onSeekTo: (seconds: number) => void;
  onSpeak: (text: string, lang?: string, rate?: number) => void;
}

export function QuickPracticeModal({
  exercise,
  hasFullRunner = false,
  fallbackSlug,
  playbackSpeed,
  onClose,
  onSeekTo,
  onSpeak,
}: QuickPracticeModalProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const scoreCount = exercise.questions.reduce((count, q) => {
    const userAns = (answers[q.id] || "").trim().toLowerCase();
    return userAns === q.answer.toLowerCase() ? count + 1 : count;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
      <div className="relative my-8 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-indigo-500/40 bg-[#0C0E1D] shadow-2xl">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#2B3060] bg-[#141731] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 uppercase">
                  {exercise.section}
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  Band {exercise.band}
                </span>
                <span className="text-xs text-zinc-400">
                  • {exercise.accent}
                </span>
              </div>
              <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
                {exercise.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bài tập"
            className="rounded-xl bg-white/[0.06] p-2 text-zinc-300 transition-colors hover:bg-white/[0.12] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-12">
          {/* Question List (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold tracking-wider text-indigo-300 uppercase">
                <span>📝 Phiếu Trả Lời Câu Hỏi (NO MORE THAN TWO WORDS)</span>
              </h4>
              {submitted && (
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  Kết quả: {scoreCount}/{exercise.questions.length} câu đúng
                </span>
              )}
            </div>

            <div className="space-y-3">
              {exercise.questions.map((qItem, idx) => {
                const userAns = (answers[qItem.id] || "").trim().toLowerCase();
                const isCorrect = userAns === qItem.answer.toLowerCase();

                return (
                  <div
                    key={qItem.id}
                    className="space-y-2.5 rounded-2xl border border-[#2B3060] bg-[#141731] p-4 shadow-sm"
                  >
                    <div className="text-sm leading-relaxed font-medium text-zinc-200">
                      <span className="mr-2 font-bold text-indigo-400">
                        Câu {idx + 1}:
                      </span>
                      {qItem.q}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={answers[qItem.id] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [qItem.id]: e.target.value })
                        }
                        placeholder="Nhập đáp án của bạn..."
                        className="flex-1 rounded-xl border border-[#2B3060] bg-[#0C0E1D] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors outline-none focus:border-indigo-400"
                      />
                      {submitted && (
                        <span
                          className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
                            isCorrect
                              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                              : "border border-rose-500/30 bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {isCorrect
                            ? "✓ Chính xác"
                            : `✗ Đáp án: ${qItem.answer}`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-amber-300/90">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Gợi ý Paraphrase: {qItem.hint}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => setSubmitted(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 hover:from-indigo-400 hover:to-violet-500 active:scale-95"
              >
                Chấm điểm & Giải thích chi tiết
              </button>

              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#2B3060] bg-[#1B1F40] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-[#252A56]"
              >
                <RotateCcw size={13} />
                <span>Làm lại</span>
              </button>

              {/* Link to Full Exercise Runner (only valid DB slug) */}
              {(hasFullRunner || fallbackSlug) && (
                <Link
                  href={`/practice/listening/${hasFullRunner ? exercise.slug : fallbackSlug}`}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#F6E85C] px-4 py-2.5 text-xs font-extrabold text-[#0C0E1D] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#F6E85C]/90"
                >
                  <span>
                    {hasFullRunner
                      ? "Vào phòng thi đầy đủ (Full Runner)"
                      : "Mở bài luyện Listening đầy đủ"}
                  </span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>

          {/* Interactive Live Transcript & Vocab (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                🎧 Transcript Đồng Bộ (Bấm để nghe)
              </span>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
              >
                {showTranscript ? "Ẩn Transcript" : "Hiện Transcript"}
              </button>
            </div>

            {showTranscript ? (
              <div className="max-h-64 space-y-2.5 overflow-y-auto rounded-2xl border border-[#2B3060] bg-[#141731] p-4">
                {exercise.transcript.map((line, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onSeekTo(line.time);
                      const lang = exercise.accent.includes("US")
                        ? "en-US"
                        : exercise.accent.includes("AUS")
                          ? "en-AU"
                          : "en-GB";
                      onSpeak(line.text, lang, playbackSpeed);
                    }}
                    className="cursor-pointer rounded-xl border border-transparent p-2.5 text-xs leading-relaxed text-zinc-300 transition-colors hover:border-indigo-500/30 hover:bg-[#1B1F40]"
                    title="Bấm để phát câu này"
                  >
                    <span className="mr-2 font-mono font-bold text-indigo-400 tabular-nums">
                      [{formatTime(line.time)}]
                    </span>
                    {line.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#2B3060] bg-[#141731] p-8 text-center text-xs text-zinc-400">
                Transcript đang được ẩn để rèn khả năng nghe thực chiến.
              </div>
            )}

            {/* Key Vocabulary Card */}
            {exercise.vocab.length > 0 && (
              <div className="space-y-2.5 rounded-2xl border border-[#2B3060] bg-[#141731] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <BookOpen size={14} />
                  <span>TỪ VỰNG TRỌNG TÂM TRONG BÀI</span>
                </div>
                <div className="space-y-2">
                  {exercise.vocab.map((v, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-0.5 rounded-xl border border-[#2B3060]/60 bg-[#0C0E1D] p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{v.word}</span>
                        <span className="font-mono text-[11px] text-cyan-400">
                          {v.ipa}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {v.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
