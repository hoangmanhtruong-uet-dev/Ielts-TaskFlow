"use client";

import React, { memo } from "react";
import Link from "next/link";
import type { DictationExercise, DictationProgress } from "@/types/dictation";

interface Props {
  exercise: DictationExercise;
  progress?: DictationProgress | null;
}

const difficultyLabels = ["", "Dễ", "Cơ bản", "Trung bình", "Khó", "Rất khó"];
const difficultyColors = [
  "",
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-yellow-100 text-yellow-700",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
];

export const DictationExerciseCard = memo(function DictationExerciseCard({
  exercise,
  progress,
}: Props) {
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Link
      href={`/dictation/${exercise.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="line-clamp-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
          {exercise.title}
        </h3>
        {progress?.completed && (
          <span className="ml-2 flex-shrink-0 text-lg text-green-500">✓</span>
        )}
      </div>

      {exercise.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-500">
          {exercise.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            difficultyColors[exercise.difficulty]
          }`}
        >
          {difficultyLabels[exercise.difficulty]}
        </span>
        <span className="text-xs text-gray-400">
          {exercise.total_sentences} câu
        </span>
        <span className="text-xs text-gray-400">
          {formatDuration(exercise.duration_seconds)}
        </span>
      </div>

      {progress && !progress.completed && progress.attempts_count > 0 && (
        <div className="mt-3 border-t pt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Tiến độ</span>
            <span>
              {progress.completed_sentences}/{progress.total_sentences}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all"
              style={{
                width: `${
                  (progress.completed_sentences / progress.total_sentences) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </Link>
  );
});
