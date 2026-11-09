"use client";

import React from "react";
import type {
  DictationSubmitResult,
  DictationSentence,
} from "@/types/dictation";
import { DictationDiffView } from "./DictationDiffView";
import Link from "next/link";

interface Props {
  exerciseId: string;
  exerciseTitle: string;
  sentences: DictationSentence[];
  results: Map<string, DictationSubmitResult>;
  onRestart: () => void;
}

export function DictationResultPanel({
  exerciseId: _exerciseId,
  exerciseTitle,
  sentences,
  results,
  onRestart,
}: Props) {
  const allResults = Array.from(results.values());
  const avgScore =
    allResults.length > 0
      ? Math.round(
          allResults.reduce((sum, r) => sum + r.accuracy_score, 0) /
            allResults.length,
        )
      : 0;

  const perfectCount = allResults.filter(
    (r) => r.accuracy_score === 100,
  ).length;
  const goodCount = allResults.filter(
    (r) => r.accuracy_score >= 80 && r.accuracy_score < 100,
  ).length;
  const needsWorkCount = allResults.filter((r) => r.accuracy_score < 80).length;

  const getGrade = (score: number) => {
    if (score >= 95)
      return { label: "S", color: "text-purple-600", bg: "bg-purple-50" };
    if (score >= 90)
      return { label: "A", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 80)
      return { label: "B", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 70)
      return { label: "C", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { label: "D", color: "text-red-600", bg: "bg-red-50" };
  };

  const grade = getGrade(avgScore);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Summary Card */}
      <div className="space-y-4 rounded-2xl bg-white p-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">Kết quả luyện nghe</h2>
        <p className="text-gray-500">{exerciseTitle}</p>

        <div
          className={`inline-flex h-24 w-24 items-center justify-center rounded-full ${grade.bg}`}
        >
          <span className={`text-4xl font-black ${grade.color}`}>
            {grade.label}
          </span>
        </div>

        <div className="text-5xl font-black text-gray-800">{avgScore}%</div>

        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {perfectCount}
            </div>
            <div className="text-xs text-gray-500">Hoàn hảo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{goodCount}</div>
            <div className="text-xs text-gray-500">Khá tốt</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {needsWorkCount}
            </div>
            <div className="text-xs text-gray-500">Cần luyện</div>
          </div>
        </div>
      </div>

      {/* Detailed results per sentence */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">
          Chi tiết từng câu
        </h3>
        {sentences.map((sentence, index) => {
          const result = results.get(sentence.id);
          if (!result) return null;
          return (
            <div
              key={sentence.id}
              className="space-y-2 rounded-xl border bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Câu {index + 1}
                </span>
                <span
                  className={`text-sm font-bold ${
                    result.accuracy_score >= 80
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {result.accuracy_score}%
                </span>
              </div>
              <DictationDiffView
                correctText={result.correct_text}
                userInput={result.user_input_normalized}
              />
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-4">
        <button
          onClick={onRestart}
          className="rounded-xl border-2 border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          Làm lại bài này
        </button>
        <Link
          href="/dictation"
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Chọn bài khác
        </Link>
      </div>
    </div>
  );
}
