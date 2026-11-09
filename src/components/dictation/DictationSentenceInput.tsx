"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { DictationSubmitResult } from "@/types/dictation";
import { DictationDiffView } from "./DictationDiffView";

interface Props {
  sentenceId: string;
  hint?: string | null;
  isSubmitting: boolean;
  existingResult?: DictationSubmitResult | null;
  onSubmit: (userInput: string) => Promise<DictationSubmitResult | null>;
  onNext: () => void;
  isLast: boolean;
}

export function DictationSentenceInput({
  sentenceId: _sentenceId,
  hint,
  isSubmitting,
  existingResult,
  onSubmit,
  onNext,
  isLast,
}: Props) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DictationSubmitResult | null>(
    existingResult ?? null,
  );
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isSubmitting) return;
    const res = await onSubmit(input.trim());
    if (res) setResult(res);
  }, [input, isSubmitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (result) {
          onNext();
        } else {
          handleSubmit();
        }
      }
    },
    [result, handleSubmit, onNext],
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Hint */}
      {hint && (
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-blue-600 underline hover:text-blue-700"
          >
            {showHint ? "Ẩn gợi ý" : "Xem gợi ý"}
          </button>
          {showHint && (
            <p className="mt-1 rounded bg-yellow-50 p-2 text-sm text-gray-500 italic">
              💡 {hint}
            </p>
          )}
        </div>
      )}

      {/* Input area */}
      {!result ? (
        <div className="space-y-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nghe và gõ lại câu bạn nghe được..."
            rows={3}
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Enter để kiểm tra • Shift+Enter xuống dòng
            </span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isSubmitting}
              className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Đang kiểm tra..." : "Kiểm tra ✓"}
            </button>
          </div>
        </div>
      ) : (
        /* Result display */
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div
              className={`text-3xl font-bold ${getScoreColor(
                result.accuracy_score,
              )}`}
            >
              {result.accuracy_score}%
            </div>
            <div className="text-sm text-gray-600">
              <p>
                Đúng: {result.correct_words}/{result.total_words} từ
              </p>
              <p>
                {result.accuracy_score >= 90
                  ? "🎉 Xuất sắc!"
                  : result.accuracy_score >= 70
                    ? "👍 Khá tốt!"
                    : "💪 Cần luyện thêm!"}
              </p>
            </div>
          </div>

          <DictationDiffView
            correctText={result.correct_text}
            userInput={result.user_input_normalized}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setResult(null);
                setInput("");
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
            >
              Thử lại
            </button>
            <button
              onClick={onNext}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
            >
              {isLast ? "Xem kết quả" : "Câu tiếp theo →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
