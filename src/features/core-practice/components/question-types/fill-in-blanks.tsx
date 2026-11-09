"use client";

interface FillInBlanksProps {
  questionId: string;
  prompt: string;
  selectedAnswer?: string;
  onChange: (value: string) => void;
}

export function FillInBlanks({
  questionId: _questionId,
  prompt,
  selectedAnswer = "",
  onChange,
}: FillInBlanksProps) {
  // Replace the literal ___ with an input field
  const parts = prompt.split("___");

  return (
    <div className="space-y-6">
      <h4 className="text-lg leading-loose font-medium text-zinc-900 dark:text-zinc-100">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => onChange(e.target.value)}
                className="mx-2 inline-block w-32 border-b-2 border-zinc-400 bg-transparent px-2 text-center font-semibold text-blue-600 focus:border-blue-600 focus:outline-none dark:border-zinc-600 dark:text-blue-400 dark:focus:border-blue-400"
                placeholder="Nhập..."
                autoComplete="off"
                spellCheck="false"
              />
            )}
          </span>
        ))}
      </h4>
    </div>
  );
}
