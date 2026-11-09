"use client";

import React, { useState } from "react";
import { ChevronDown, Check, X, BookmarkCheck } from "lucide-react";
import type { QuestionOption } from "./true-false-button-group";

export interface MatchingHeadingsSelectorProps {
  questionId: string;
  options: QuestionOption[];
  selectedOptionIds: string[];
  answerText?: string;
  onChange: (value: {
    selectedOptionIds: string[];
    answerText: string;
  }) => void;
}

export function MatchingHeadingsSelector({
  questionId: _questionId,
  options,
  selectedOptionIds,
  answerText: _answerText,
  onChange,
}: MatchingHeadingsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => selectedOptionIds.includes(o.id));

  const handleSelectOption = (opt: QuestionOption) => {
    onChange({
      selectedOptionIds: [opt.id],
      answerText: opt.label,
    });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      selectedOptionIds: [],
      answerText: "",
    });
  };

  return (
    <div className="relative mt-4 space-y-3">
      <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
        Chọn tiêu đề phù hợp (Heading):
      </label>

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex min-h-14 w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-3 text-left transition-all duration-150 ${
          selectedOption
            ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-sm"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3 pr-2">
          {selectedOption ? (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <BookmarkCheck size={16} />
            </div>
          ) : (
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
              ?
            </span>
          )}
          <span className="truncate text-sm font-semibold">
            {selectedOption
              ? selectedOption.label
              : "-- Chọn tiêu đề từ danh sách --"}
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          {selectedOption && (
            <span
              onClick={handleClear}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              title="Xóa lựa chọn"
            >
              <X size={15} />
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl duration-150">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Danh sách Headings ({options.length})
          </div>

          <div className="space-y-1 py-1">
            {options.map((opt) => {
              const isChecked = selectedOptionIds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    isChecked
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="pr-4 leading-relaxed">{opt.label}</span>
                  {isChecked && (
                    <Check
                      size={16}
                      className="flex-shrink-0 text-emerald-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
