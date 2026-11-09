"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
  code: string; // e.g. "B1"
  label: string; // e.g. "Intermediate"
  progress: number; // 0-100
  mounted: boolean;
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LevelProgress = memo(function LevelProgress({
  code,
  label,
  progress,
  mounted,
}: LevelProgressProps) {
  const currentIdx = CEFR_LEVELS.indexOf(code);
  const nextLevel = CEFR_LEVELS[currentIdx + 1] ?? "C2";

  return (
    <div className="app-panel flex flex-col gap-2 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-[var(--primary-subtle)] px-2 py-0.5 text-xs font-extrabold text-[var(--primary)]">
            {code}
          </span>
          <p className="text-sm font-bold text-[var(--foreground)]">{label}</p>
        </div>
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)]">
          → {nextLevel}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className="h-full rounded-full bg-[var(--success)] transition-all duration-1000 ease-out"
          style={{ width: mounted ? `${progress}%` : "0%" }}
        />
      </div>

      {/* CEFR ladder */}
      <div className="mt-1 flex items-center justify-between">
        {CEFR_LEVELS.map((lvl, i) => (
          <div key={lvl} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                i < currentIdx
                  ? "bg-[var(--success)]"
                  : i === currentIdx
                    ? "bg-[var(--primary)] ring-2 ring-[var(--primary-soft)]"
                    : "bg-[var(--muted)]",
              )}
            />
            <span
              className={cn(
                "text-[8px] font-bold",
                i === currentIdx
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              {lvl}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-semibold text-[var(--muted-foreground)]">
        {progress}% to {nextLevel}
      </p>
    </div>
  );
});
