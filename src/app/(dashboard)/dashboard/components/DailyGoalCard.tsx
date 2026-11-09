"use client";

import React from "react";

interface DailyGoalCardProps {
  current?: number;
  total?: number;
}

export function DailyGoalCard({ current = 0, total = 4 }: DailyGoalCardProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(safeTotal, Math.max(0, current));
  const remaining = safeTotal - safeCurrent;

  return (
    <div className="box">
      <div className="goal-h">
        <h2>Daily goal</h2>
        <b>
          {safeCurrent}
          <span>/{safeTotal}</span>
        </b>
      </div>

      <div
        className="segs"
        style={{ gridTemplateColumns: `repeat(${safeTotal}, 1fr)` }}
        role="progressbar"
        aria-valuenow={safeCurrent}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-label={`Daily goal progress: ${safeCurrent} of ${safeTotal} exercises completed`}
      >
        {Array.from({ length: safeTotal }, (_, i) => (
          <i key={i} className={i < safeCurrent ? "on" : ""} />
        ))}
      </div>

      <p className="muted">
        {remaining === 0
          ? "Daily goal reached! Keep going for bonus XP."
          : `${remaining} more exercise${remaining > 1 ? "s" : ""} to complete your goal.`}
      </p>
    </div>
  );
}
