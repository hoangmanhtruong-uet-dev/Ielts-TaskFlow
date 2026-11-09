"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookA,
  Clock,
  Layers,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { CuratedPassage } from "./reading-curated-data";

export interface QuickReadingModalProps {
  passage: CuratedPassage;
  hasFullRunner?: boolean;
  fallbackSlug?: string;
  onClose: () => void;
}

export function QuickReadingModal({
  passage,
  hasFullRunner = false,
  fallbackSlug,
  onClose,
}: QuickReadingModalProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  const fontSizeClass =
    fontSize === "sm"
      ? "text-xs leading-relaxed"
      : fontSize === "lg"
        ? "text-base leading-loose"
        : "text-sm leading-relaxed";

  const scoreCount = passage.questions.reduce((count, q) => {
    const userAns = (answers[q.id] || "").trim().toUpperCase();
    return userAns === q.answer.trim().toUpperCase() ? count + 1 : count;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-5">
      <div className="relative my-4 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-indigo-500/40 bg-[#0C0E1D] shadow-2xl">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#2B3060] bg-[#141731] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                  Passage {passage.passageNumber}
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  Band {passage.bandRange}
                </span>
                <span className="text-xs text-zinc-400">
                  • {passage.category}
                </span>
              </div>
              <h3 className="mt-0.5 max-w-lg truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                {passage.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Scaler */}
            <div className="hidden items-center gap-1 rounded-xl border border-[#2B3060] bg-[#0C0E1D] p-1 sm:flex">
              <button
                onClick={() => setFontSize("sm")}
                title="Cỡ chữ nhỏ"
                className={`rounded-lg p-1.5 text-xs font-bold ${fontSize === "sm" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <ZoomOut size={13} />
              </button>
              <button
                onClick={() => setFontSize("base")}
                title="Cỡ chữ vừa"
                className={`rounded-lg px-2 py-0.5 text-xs font-bold ${fontSize === "base" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                title="Cỡ chữ lớn"
                className={`rounded-lg p-1.5 text-xs font-bold ${fontSize === "lg" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng bài đọc"
              className="rounded-xl bg-white/[0.06] p-2 text-zinc-300 transition-colors hover:bg-white/[0.12] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Split-View Body */}
        <div className="grid flex-1 grid-cols-1 divide-y divide-[#2B3060] overflow-hidden lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* LEFT COLUMN: PASSAGE TEXT (7 COLS) */}
          <div className="max-h-[45vh] space-y-6 overflow-y-auto p-6 lg:col-span-7 lg:max-h-full">
            <div className="flex items-center justify-between border-b border-[#2B3060]/60 pb-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-400" />
                Thời gian đọc chuẩn: ~{passage.estimatedMinutes} phút
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Layers size={14} className="text-indigo-400" />
                {passage.wordCount} từ
              </span>
            </div>

            <div
              className={`space-y-5 font-serif text-zinc-200 ${fontSizeClass}`}
            >
              {passage.paragraphs.map((para) => (
                <div key={para.id} className="space-y-1.5">
                  <span className="inline-block rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 font-sans text-xs font-bold text-indigo-300">
                    {para.label}
                  </span>
                  <p className="indent-4 leading-relaxed text-zinc-200">
                    {para.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Vocab Glossary */}
            {passage.vocab.length > 0 && (
              <div className="mt-6 space-y-2 rounded-2xl border border-[#2B3060] bg-[#141731] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <BookA size={14} />
                  <span>TỪ VỰNG TRỌNG TÂM TRONG BÀI</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {passage.vocab.map((v, i) => (
                    <div
                      key={i}
                      className="space-y-0.5 rounded-xl border border-[#2B3060]/50 bg-[#0C0E1D] p-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{v.word}</span>
                        <span className="font-mono text-[10px] text-cyan-400">
                          {v.ipa}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {v.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: QUESTION SHEET (5 COLS) */}
          <div className="flex max-h-[45vh] flex-col justify-between space-y-5 overflow-y-auto bg-[#0C0E1D]/50 p-6 lg:col-span-5 lg:max-h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-wider text-indigo-300 uppercase">
                  📝 Phiếu Câu Hỏi Thực Chiến ({passage.questions.length} câu)
                </h4>
                {submitted && (
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                    {scoreCount}/{passage.questions.length} câu đúng
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {passage.questions.map((qItem, idx) => {
                  const userAns = (answers[qItem.id] || "")
                    .trim()
                    .toUpperCase();
                  const isCorrect =
                    userAns === qItem.answer.trim().toUpperCase();

                  return (
                    <div
                      key={qItem.id}
                      className="space-y-2.5 rounded-2xl border border-[#2B3060] bg-[#141731] p-4 shadow-sm"
                    >
                      <div className="text-xs leading-relaxed font-semibold text-zinc-200">
                        <span className="mr-1.5 font-bold text-indigo-400">
                          Q{idx + 1}:
                        </span>
                        {qItem.q}
                      </div>

                      {/* True/False/Not Given quick pills */}
                      {qItem.type === "true_false_not_given" ? (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {(["TRUE", "FALSE", "NOT GIVEN"] as const).map(
                            (opt) => {
                              const isChosen = userAns === opt;
                              let optStyle =
                                "bg-[#0C0E1D] border-[#2B3060] text-zinc-300 hover:text-white";
                              if (submitted) {
                                if (opt === qItem.answer)
                                  optStyle =
                                    "bg-emerald-500/20 border-emerald-400 text-emerald-300";
                                else if (isChosen)
                                  optStyle =
                                    "bg-rose-500/20 border-rose-400 text-rose-300";
                              } else if (isChosen) {
                                optStyle =
                                  "bg-indigo-600 border-indigo-500 text-white";
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() =>
                                    setAnswers({ ...answers, [qItem.id]: opt })
                                  }
                                  className={`rounded-xl border py-1.5 text-[11px] font-bold transition-colors ${optStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={answers[qItem.id] || ""}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [qItem.id]: e.target.value,
                              })
                            }
                            placeholder="Gõ đáp án..."
                            className="flex-1 rounded-xl border border-[#2B3060] bg-[#0C0E1D] px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
                          />
                        </div>
                      )}

                      {submitted && (
                        <div
                          className={`pt-1 text-xs font-bold ${
                            isCorrect ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCorrect
                            ? "✓ Chính xác"
                            : `✗ Đáp án chuẩn: ${qItem.answer}`}
                        </div>
                      )}

                      <div className="flex items-center gap-1 pt-0.5 text-[11px] text-amber-300/80">
                        <Sparkles
                          size={12}
                          className="shrink-0 text-amber-400"
                        />
                        <span>Gợi ý: {qItem.hint}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 border-t border-[#2B3060]/70 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSubmitted(true)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] hover:from-indigo-400 hover:to-violet-500 active:scale-[0.98]"
                >
                  Chấm điểm & Giải thích
                </button>
                <button
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="rounded-xl border border-[#2B3060] bg-[#1B1F40] p-2.5 text-zinc-300 hover:text-white"
                  title="Làm lại"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Full Runner CTA (only valid DB slug) */}
              {(hasFullRunner || fallbackSlug) && (
                <Link
                  href={`/practice/reading/${hasFullRunner ? passage.slug : fallbackSlug}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F6E85C] px-4 py-2.5 text-xs font-extrabold text-[#0C0E1D] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#F6E85C]/90"
                >
                  <span>
                    {hasFullRunner
                      ? "Vào phòng thi đầy đủ (Full Runner)"
                      : "Mở bài luyện Reading đầy đủ"}
                  </span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
