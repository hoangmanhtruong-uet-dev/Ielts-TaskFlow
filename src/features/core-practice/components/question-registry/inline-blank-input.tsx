"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface InlineBlankInputProps {
  questionId: string;
  promptMarkdown: string;
  answerText: string;
  maxAnswerWords?: number | null;
  onChange: (value: {
    answerText: string;
    selectedOptionIds: string[];
  }) => void;
}

export function InlineBlankInput({
  questionId,
  promptMarkdown,
  answerText,
  maxAnswerWords,
  onChange,
}: InlineBlankInputProps) {
  const words = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const isOverLimit = maxAnswerWords ? words > maxAnswerWords : false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      answerText: e.target.value,
      selectedOptionIds: [],
    });
  };

  // Kiểm tra nếu prompt chứa placeholder ___
  const hasInlinePlaceholder = /_{2,}|\[_{2,}\]/.test(promptMarkdown);

  if (hasInlinePlaceholder) {
    const parts = promptMarkdown.split(/_{2,}|\[_{2,}\]/);
    return (
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-base leading-loose font-medium text-slate-800">
          {parts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span>{part}</span>
              {idx < parts.length - 1 && (
                <span className="relative mx-1.5 inline-flex align-middle">
                  <input
                    id={`blank-input-${questionId}`}
                    type="text"
                    value={answerText}
                    onChange={handleInputChange}
                    placeholder="Điền từ..."
                    maxLength={150}
                    autoComplete="off"
                    spellCheck="false"
                    className={`max-w-xs min-w-36 rounded-lg border-2 bg-white px-3 py-1 text-center text-sm font-bold text-slate-900 shadow-sm transition-all outline-none ${
                      isOverLimit
                        ? "border-rose-500 bg-rose-50/50 text-rose-700 focus:border-rose-600"
                        : words > 0
                          ? "border-emerald-500 focus:border-emerald-600"
                          : "border-slate-300 focus:border-emerald-500"
                    }`}
                  />
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Word Counter & Help */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-slate-500">
            {maxAnswerWords
              ? `Quy định: Không quá ${maxAnswerWords} từ`
              : "Nhập câu trả lời ngắn"}
          </span>

          {maxAnswerWords ? (
            <div
              className={`flex items-center gap-1 font-bold ${
                isOverLimit
                  ? "text-rose-600"
                  : words > 0
                    ? "text-emerald-600"
                    : "text-slate-400"
              }`}
            >
              {isOverLimit ? (
                <>
                  <AlertCircle size={13} />
                  <span>
                    Vượt quá giới hạn ({words}/{maxAnswerWords} từ)
                  </span>
                </>
              ) : words > 0 ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>
                    Hợp lệ ({words}/{maxAnswerWords} từ)
                  </span>
                </>
              ) : (
                <span>0/{maxAnswerWords} từ</span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Fallback: prompt ở trên, ô input ở dưới
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`blank-input-${questionId}`}
          className="text-xs font-bold tracking-wider text-slate-600 uppercase"
        >
          Câu trả lời của bạn
        </label>

        {maxAnswerWords ? (
          <span
            className={`flex items-center gap-1 text-xs font-bold ${
              isOverLimit
                ? "text-rose-600"
                : words > 0
                  ? "text-emerald-600"
                  : "text-slate-400"
            }`}
          >
            {isOverLimit ? (
              <>
                <AlertCircle size={13} />
                <span>
                  Vượt quá giới hạn ({words}/{maxAnswerWords} từ)
                </span>
              </>
            ) : words > 0 ? (
              <>
                <CheckCircle2 size={13} />
                <span>
                  Hợp lệ ({words}/{maxAnswerWords} từ)
                </span>
              </>
            ) : (
              <span>Tối đa {maxAnswerWords} từ</span>
            )}
          </span>
        ) : null}
      </div>

      <input
        id={`blank-input-${questionId}`}
        type="text"
        value={answerText}
        onChange={handleInputChange}
        placeholder="Nhập câu trả lời tại đây..."
        maxLength={200}
        autoComplete="off"
        spellCheck="false"
        className={`min-h-14 w-full rounded-2xl border-2 bg-white px-5 text-base font-semibold text-slate-900 shadow-sm transition-all outline-none ${
          isOverLimit
            ? "border-rose-500 bg-rose-50/20 text-rose-800 focus:border-rose-600"
            : words > 0
              ? "border-emerald-500 focus:border-emerald-600"
              : "border-slate-200 hover:border-slate-300 focus:border-emerald-500"
        }`}
      />
    </div>
  );
}
