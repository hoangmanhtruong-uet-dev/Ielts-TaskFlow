"use client";

interface MultipleChoiceProps {
  questionId: string;
  prompt: string;
  options: string[];
  selectedAnswer?: string;
  onChange: (value: string) => void;
}

export function MultipleChoice({
  questionId,
  prompt,
  options,
  selectedAnswer,
  onChange,
}: MultipleChoiceProps) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg leading-relaxed font-medium text-zinc-900 dark:text-zinc-100">
        {prompt}
      </h4>

      <div className="space-y-3">
        {options.map((opt, index) => {
          const isSelected = selectedAnswer === opt;
          const letter = String.fromCharCode(65 + index); // A, B, C, D...

          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                  : "border-zinc-200 hover:border-blue-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-blue-900 dark:hover:bg-zinc-800/50"
              }`}
            >
              <input
                type="radio"
                name={`question-${questionId}`}
                value={opt}
                checked={isSelected}
                onChange={() => onChange(opt)}
                className="hidden"
              />
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  isSelected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                {letter}
              </div>
              <span className="text-zinc-800 dark:text-zinc-200">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// touched for audit
