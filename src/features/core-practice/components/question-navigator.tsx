"use client";

import { Check } from "lucide-react";

type QuestionStatus = "unanswered" | "answered" | "review";

interface QuestionNavigatorProps {
  questions: { id: string; status: QuestionStatus; index: number }[];
  onSelectQuestion: (index: number) => void;
  currentIndex: number;
}

export function QuestionNavigator({
  questions,
  onSelectQuestion,
  currentIndex,
}: QuestionNavigatorProps) {
  return (
    <div className="sticky top-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Điều hướng câu hỏi
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q) => {
          const isActive = q.index === currentIndex;
          let bgColor =
            "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";

          if (q.status === "answered") {
            bgColor =
              "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
          } else if (q.status === "review") {
            bgColor =
              "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
          }

          if (isActive) {
            bgColor +=
              " ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.index)}
              className={`relative flex aspect-square w-full items-center justify-center rounded-lg text-sm font-medium transition-all hover:opacity-80 ${bgColor}`}
            >
              {q.index + 1}
              {q.status === "answered" && (
                <div className="absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"></div>
          <span>Chưa trả lời</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-900/40"></div>
          <span>Đã trả lời</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-amber-200 bg-amber-100 dark:border-amber-800 dark:bg-amber-900/40"></div>
          <span>Đánh dấu xem lại</span>
        </div>
      </div>
    </div>
  );
}
