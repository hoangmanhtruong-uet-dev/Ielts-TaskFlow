"use client";

import React, { memo, useMemo } from "react";
import { computeWordDiff } from "@/lib/utils/text-diff";

interface Props {
  correctText: string;
  userInput: string;
}

export const DictationDiffView = memo(function DictationDiffView({
  correctText,
  userInput,
}: Props) {
  const diffs = useMemo(
    () => computeWordDiff(correctText, userInput),
    [correctText, userInput],
  );

  const colorMap = {
    correct: "text-green-700 bg-green-50",
    incorrect: "text-red-700 bg-red-50 line-through",
    missing: "text-orange-700 bg-orange-50 underline decoration-wavy",
    extra: "text-red-500 bg-red-50 line-through opacity-60",
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
        So sánh chi tiết:
      </p>
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-3">
        {diffs.map((diff, index) => (
          <span
            key={index}
            className={`rounded px-1.5 py-0.5 font-mono text-sm ${
              colorMap[diff.type]
            }`}
            title={
              diff.type === "missing"
                ? "Từ bị thiếu"
                : diff.type === "extra"
                  ? "Từ thừa"
                  : diff.type === "correct"
                    ? "Đúng"
                    : "Sai"
            }
          >
            {diff.word}
          </span>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-green-200 bg-green-50" />
          Đúng
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-orange-200 bg-orange-50" />
          Thiếu
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-red-200 bg-red-50" />
          Thừa/Sai
        </span>
      </div>
    </div>
  );
});
