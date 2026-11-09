"use client";

import React from "react";
import { Check, HelpCircle } from "lucide-react";
import type { QuestionOption } from "./true-false-button-group";

export interface MatchingPillSelectorProps {
  questionId: string;
  options: QuestionOption[];
  selectedOptionIds: string[];
  answerText?: string;
  onChange: (draft: {
    answerText: string;
    selectedOptionIds: string[];
  }) => void;
}

export function MatchingPillSelector({
  questionId: _questionId,
  options,
  selectedOptionIds,
  answerText: _answerText = "",
  onChange,
}: MatchingPillSelectorProps) {
  // Option letter helper (e.g. "A", "B", "C")
  const getOptionLetter = (opt: QuestionOption, index: number) => {
    const match = opt.label.match(/^([A-Z])[\.\:\s]/i);
    if (match) return match[1].toUpperCase();
    return String.fromCharCode(65 + index);
  };

  const getOptionText = (opt: QuestionOption) => {
    return opt.label.replace(/^[A-Z][\.\:\s]+/i, "").trim();
  };

  const selectedOption = options.find((opt) =>
    selectedOptionIds.includes(opt.id),
  );

  const handleSelect = (opt: QuestionOption, letter: string) => {
    onChange({
      answerText: letter,
      selectedOptionIds: [opt.id],
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Reference Options Box */}
      {options.length > 0 && (
        <div className="rounded-2xl border border-[#2B3060] bg-[#141731]/80 p-4 backdrop-blur-sm">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-300 uppercase">
            <HelpCircle size={14} className="text-[#F6E85C]" />
            Khung phương án phân loại:
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((opt, idx) => {
              const letter = getOptionLetter(opt, idx);
              const text = getOptionText(opt);
              const isSelected = selectedOptionIds.includes(opt.id);

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt, letter)}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-all select-none ${
                    isSelected
                      ? "border-indigo-500/60 bg-indigo-600/25 text-white"
                      : "border-[#2B3060]/70 bg-[#1B1F40]/60 text-zinc-300 hover:bg-[#1B1F40] hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isSelected
                        ? "bg-[#F6E85C] text-[#0C0E1D]"
                        : "bg-[#2B3060] text-indigo-200"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="pt-0.5 leading-relaxed font-medium">
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 1-Touch Pill Selection Row */}
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-400">
          Chọn phương án tương ứng cho câu hỏi này:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt, idx) => {
            const letter = getOptionLetter(opt, idx);
            const isSelected = selectedOptionIds.includes(opt.id);

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt, letter)}
                aria-pressed={isSelected}
                aria-label={`Chọn phương án ${letter}`}
                className={`flex h-11 min-w-[3.5rem] items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition-all ${
                  isSelected
                    ? "scale-105 border-[#F6E85C] bg-[#F6E85C] text-[#0C0E1D] shadow-lg shadow-[#F6E85C]/20"
                    : "border-[#2B3060] bg-[#141731] text-zinc-200 hover:bg-[#1B1F40] hover:text-white"
                }`}
              >
                <span>{letter}</span>
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {/* Selected Confirmation Banner */}
        {selectedOption && (
          <p className="animate-in fade-in mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Đã chọn:{" "}
            <strong className="text-white">{selectedOption.label}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
