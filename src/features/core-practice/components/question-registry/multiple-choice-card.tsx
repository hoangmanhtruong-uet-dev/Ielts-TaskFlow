"use client";

import React from "react";
import type { QuestionOption } from "./true-false-button-group";

export interface MultipleChoiceCardProps {
  questionId: string;
  options: QuestionOption[];
  selectedOptionIds: string[];
  isMultiple?: boolean;
  onChange: (value: {
    selectedOptionIds: string[];
    answerText: string;
  }) => void;
}

export function MultipleChoiceCard({
  questionId,
  options,
  selectedOptionIds,
  isMultiple = false,
  onChange,
}: MultipleChoiceCardProps) {
  const handleToggle = (option: QuestionOption) => {
    if (isMultiple) {
      const exists = selectedOptionIds.includes(option.id);
      const nextIds = exists
        ? selectedOptionIds.filter((id) => id !== option.id)
        : [...selectedOptionIds, option.id];
      onChange({
        selectedOptionIds: nextIds,
        answerText: nextIds.join(","),
      });
    } else {
      onChange({
        selectedOptionIds: [option.id],
        answerText: option.label,
      });
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {options.map((option, index) => {
        const isChecked = selectedOptionIds.includes(option.id);
        const letter = String.fromCharCode(65 + index); // A, B, C, D...

        return (
          <label
            key={option.id}
            className={`group flex min-h-14 cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-3.5 transition-all duration-150 select-none ${
              isChecked
                ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={`question-${questionId}`}
              value={option.id}
              aria-label={option.label}
              checked={isChecked}
              onChange={() => handleToggle(option)}
              className="sr-only"
            />
            <div className="flex min-w-0 items-center gap-4 pr-3">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-colors ${
                  isChecked
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-slate-100 text-slate-600 group-hover:border-slate-300"
                }`}
              >
                {letter}
              </div>
              <span className="text-sm leading-relaxed font-semibold">
                {option.label}
              </span>
            </div>

            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-${
                isMultiple ? "md" : "full"
              } border-2 transition-colors ${
                isChecked
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-transparent"
              }`}
            >
              {isChecked && (
                <div
                  className={
                    isMultiple
                      ? "h-2 w-2 rounded-xs bg-white"
                      : "h-2 w-2 rounded-full bg-white"
                  }
                />
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
