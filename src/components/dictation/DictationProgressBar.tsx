"use client";

import React, { memo } from "react";

interface Props {
  current: number;
  total: number;
  completedSentenceIds: Set<string>;
  sentenceIds: string[];
  onSentenceClick: (index: number) => void;
}

export const DictationProgressBar = memo(function DictationProgressBar({
  current,
  total,
  completedSentenceIds,
  sentenceIds,
  onSentenceClick,
}: Props) {
  const percentage =
    total > 0 ? Math.round((completedSentenceIds.size / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Câu {current + 1} / {total}
        </span>
        <span>{percentage}% hoàn thành</span>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Sentence dots */}
      <div className="flex flex-wrap gap-1">
        {sentenceIds.map((id, index) => (
          <button
            key={id}
            onClick={() => onSentenceClick(index)}
            className={`h-6 w-6 rounded-full text-xs font-medium transition-all ${
              index === current
                ? "bg-blue-600 text-white ring-2 ring-blue-300"
                : completedSentenceIds.has(id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
});
