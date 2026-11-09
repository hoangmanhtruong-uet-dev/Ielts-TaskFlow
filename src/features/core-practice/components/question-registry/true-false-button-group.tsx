"use client";

import React from "react";
import { Check, X, HelpCircle } from "lucide-react";

export interface QuestionOption {
  id: string;
  label: string;
  position: number;
}

export interface TrueFalseButtonGroupProps {
  questionId: string;
  options: QuestionOption[];
  selectedOptionIds: string[];
  answerText?: string;
  isYesNo?: boolean;
  onChange: (value: {
    selectedOptionIds: string[];
    answerText: string;
  }) => void;
}

export function TrueFalseButtonGroup({
  questionId,
  options,
  selectedOptionIds,
  answerText = "",
  isYesNo = false,
  onChange,
}: TrueFalseButtonGroupProps) {
  // Nếu có options truyền vào từ DB/question (ví dụ: label là "True", "False", "Not Given")
  // ta dùng chính options đó để đảm bảo id khớp với database.
  const standardChoices = isYesNo
    ? [
        { label: "YES", icon: Check, color: "emerald", key: "Y" },
        { label: "NO", icon: X, color: "rose", key: "N" },
        { label: "NOT GIVEN", icon: HelpCircle, color: "slate", key: "G" },
      ]
    : [
        { label: "TRUE", icon: Check, color: "emerald", key: "T" },
        { label: "FALSE", icon: X, color: "rose", key: "F" },
        { label: "NOT GIVEN", icon: HelpCircle, color: "slate", key: "N" },
      ];

  const items =
    options && options.length > 0
      ? options.map((opt, idx) => {
          const std =
            standardChoices.find(
              (c) => c.label.toLowerCase() === opt.label.trim().toLowerCase(),
            ) || standardChoices[idx % standardChoices.length];
          return {
            id: opt.id,
            label: opt.label,
            icon: std.icon,
            color: std.color,
            key: std.key,
          };
        })
      : standardChoices.map((c) => ({
          id: c.label,
          label: c.label,
          icon: c.icon,
          color: c.color,
          key: c.key,
        }));

  const handleSelect = (item: { id: string; label: string }) => {
    onChange({
      selectedOptionIds: [item.id],
      answerText: item.label,
    });
  };

  const isSelected = (item: { id: string; label: string }) => {
    if (selectedOptionIds.includes(item.id)) return true;
    return answerText.trim().toLowerCase() === item.label.trim().toLowerCase();
  };

  return (
    <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      {items.map((item) => {
        const checked = isSelected(item);
        const Icon = item.icon;

        let activeClasses = "";
        if (checked) {
          if (item.color === "emerald") {
            activeClasses =
              "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm";
          } else if (item.color === "rose") {
            activeClasses =
              "border-rose-600 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20 shadow-sm";
          } else {
            activeClasses =
              "border-slate-600 bg-slate-100 text-slate-900 ring-2 ring-slate-400/20 shadow-sm";
          }
        } else {
          activeClasses =
            "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";
        }

        return (
          <label
            key={item.id}
            className={`group relative flex min-h-14 flex-1 cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-3.5 text-left transition-all duration-150 select-none ${activeClasses}`}
          >
            <input
              type="radio"
              name={`question-${questionId}`}
              value={item.id}
              aria-label={item.label}
              checked={checked}
              onChange={() => handleSelect(item)}
              className="sr-only"
            />
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-black transition-colors ${
                  checked
                    ? item.color === "emerald"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : item.color === "rose"
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-slate-700 bg-slate-700 text-white"
                    : "border-slate-200 bg-slate-100 text-slate-500 group-hover:border-slate-300"
                }`}
              >
                <Icon size={16} />
              </div>
              <span className="text-sm font-bold tracking-wide">
                {item.label}
              </span>
            </div>

            <span className="font-mono text-[11px] font-bold text-slate-400 uppercase opacity-60 group-hover:opacity-100">
              [{item.key}]
            </span>
          </label>
        );
      })}
    </div>
  );
}
