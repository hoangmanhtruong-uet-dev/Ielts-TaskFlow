"use client";

import React from "react";
import type { DictationExercise, DictationProgress } from "@/types/dictation";
import { DictationExerciseCard } from "./DictationExerciseCard";

interface Props {
  exercises: DictationExercise[];
  progressMap: Map<string, DictationProgress>;
}

export function DictationExerciseList({ exercises, progressMap }: Props) {
  if (exercises.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg">Chưa có bài tập nào.</p>
        <p className="mt-1 text-sm">Hãy quay lại sau nhé!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <DictationExerciseCard
          key={exercise.id}
          exercise={exercise}
          progress={progressMap.get(exercise.id) ?? null}
        />
      ))}
    </div>
  );
}
