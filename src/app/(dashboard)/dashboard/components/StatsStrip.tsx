"use client";

import React from "react";

interface StatsStripProps {
  lessonsDone?: number;
  streakDays?: number;
  thisWeekTime?: string;
  level?: {
    code: string;
    label: string;
    progress: number;
  };
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function StatsStrip({
  lessonsDone = 0,
  streakDays = 0,
  thisWeekTime = "0h 0m",
  level = { code: "A1", label: "Beginner", progress: 0 },
}: StatsStripProps) {
  const currentIdx = Math.max(0, CEFR_LEVELS.indexOf(level.code));
  const nextLevel = CEFR_LEVELS[currentIdx + 1] ?? "C2";

  // 5 intervals between 6 levels
  const progressRatio = Math.min(100, Math.max(0, level.progress)) / 100;
  const ladderRatio = Math.min(
    1,
    Math.max(0, (currentIdx + progressRatio) / 5),
  );

  return (
    <section className="strip">
      <div>
        <small>Lessons done</small>
        <b>{lessonsDone}</b>
      </div>

      <div>
        <small>Streak</small>
        <b>{streakDays}d</b>
      </div>

      <div>
        <small>This week</small>
        <b>{thisWeekTime}</b>
      </div>

      <div>
        <div className="lvl-h">
          <b>
            {level.code} {level.label}
          </b>
          <span>
            {level.progress}% to {nextLevel}
          </span>
        </div>

        <div className="ladder">
          <div
            className="fill"
            style={{ width: `calc((100% - 12px) * ${ladderRatio})` }}
          />
          {CEFR_LEVELS.map((code, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <span key={code} className={isDone ? "d" : isCurrent ? "n" : ""}>
                {code}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
