"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Trophy, RotateCcw, Sparkles, Volume2, BookOpen } from "lucide-react";
import type { DictationExercise, SentenceDiffResult } from "../model";

interface StoredDictationResult {
  answers: Record<string, string>;
  diffs: Record<string, SentenceDiffResult>;
}

const subscribeNoop = () => () => {};
let cachedResultKey = "";
let cachedResultRaw: string | null = null;
let cachedResultParsed: StoredDictationResult | null = null;

function getStoredDictationResult(slug: string): StoredDictationResult | null {
  if (typeof window === "undefined") return null;
  const key = `dictation_result_${slug}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    if (key === cachedResultKey && raw === cachedResultRaw) {
      return cachedResultParsed;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "answers" in parsed &&
      "diffs" in parsed
    ) {
      cachedResultKey = key;
      cachedResultRaw = raw;
      cachedResultParsed = parsed as StoredDictationResult;
      return cachedResultParsed;
    }
  } catch {
    // ignore error
  }
  return null;
}

export function DictationResult({ exercise }: { exercise: DictationExercise }) {
  const resultData = useSyncExternalStore(
    subscribeNoop,
    () => getStoredDictationResult(exercise.slug),
    () => null,
  );

  const diffsList = resultData ? Object.values(resultData.diffs) : [];
  const totalSentences = exercise.sentences.length;
  const averageAccuracy =
    diffsList.length > 0
      ? Math.round(
          diffsList.reduce((acc, item) => acc + item.accuracyPercent, 0) /
            diffsList.length,
        )
      : 0;

  const totalWords = diffsList.reduce((acc, item) => acc + item.wordCount, 0);
  const totalCorrect = diffsList.reduce(
    (acc, item) => acc + item.correctCount,
    0,
  );

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="animate-in fade-in min-h-[100dvh] bg-slate-50 pb-24 font-sans duration-300">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Victory Hero Card */}
        <section className="relative space-y-6 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-indigo-800 p-8 text-center text-white shadow-xl sm:p-10">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <Trophy size={48} className="animate-bounce text-amber-300" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black sm:text-4xl">
              Hoàn Thành Dictation!
            </h1>
            <p className="mx-auto max-w-lg text-sm text-amber-100">
              Bạn đã hoàn thành bài chép chính tả &quot;{exercise.title}&quot;.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="mx-auto grid max-w-md grid-cols-3 gap-4">
            <div className="rounded-2xl bg-black/20 p-4 backdrop-blur-sm">
              <span className="block text-3xl font-black text-amber-300">
                {averageAccuracy}%
              </span>
              <span className="text-[11px] font-bold text-amber-100 uppercase">
                Độ chính xác
              </span>
            </div>
            <div className="rounded-2xl bg-black/20 p-4 backdrop-blur-sm">
              <span className="block text-3xl font-black text-white">
                {totalCorrect}/{totalWords}
              </span>
              <span className="text-[11px] font-bold text-amber-100 uppercase">
                Từ gõ đúng
              </span>
            </div>
            <div className="rounded-2xl bg-black/20 p-4 backdrop-blur-sm">
              <span className="block text-3xl font-black text-emerald-300">
                {totalSentences}
              </span>
              <span className="text-[11px] font-bold text-amber-100 uppercase">
                Tổng số câu
              </span>
            </div>
          </div>
        </section>

        {/* Detailed Breakdown per Sentence */}
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Sparkles size={20} className="text-amber-500" /> Chi Tiết Từng
              Câu
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              Audio playback available
            </span>
          </div>

          <div className="space-y-4">
            {exercise.sentences.map((sent, index) => {
              const diff = resultData?.diffs[sent.id];
              const userTyped = resultData?.answers[sent.id] || "";
              const accuracy = diff ? diff.accuracyPercent : 0;

              return (
                <div
                  key={sent.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-xs font-extrabold text-amber-800">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Câu {sent.position}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => speakText(sent.text)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                      >
                        <Volume2 size={14} /> Nghe lại
                      </button>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          accuracy >= 90
                            ? "bg-emerald-100 text-emerald-700"
                            : accuracy >= 60
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Target vs Typed */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="mb-0.5 block font-bold tracking-wider text-slate-400 uppercase">
                        Văn bản gốc:
                      </span>
                      <p className="text-sm font-bold text-slate-800">
                        {sent.text}
                      </p>
                    </div>
                    <div>
                      <span className="mb-0.5 block font-bold tracking-wider text-slate-400 uppercase">
                        Bạn đã gõ:
                      </span>
                      <p className="font-semibold text-slate-600">
                        {userTyped || "(Chưa nhập văn bản)"}
                      </p>
                    </div>
                    {sent.translation && (
                      <p className="text-slate-400 italic">
                        Dịch: &quot;{sent.translation}&quot;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href={`/practice/listening/dictation/${exercise.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 sm:w-auto"
          >
            <RotateCcw size={16} /> Luyện lại bài này
          </Link>
          <Link
            href="/practice/listening/dictation"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-3.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 sm:w-auto"
          >
            <BookOpen size={16} /> Danh sách bài Dictation
          </Link>
        </div>
      </div>
    </div>
  );
}
