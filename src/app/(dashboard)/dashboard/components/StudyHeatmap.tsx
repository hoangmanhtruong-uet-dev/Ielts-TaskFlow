"use client";

import React, { useMemo } from "react";

interface StudyHeatmapProps {
  activeDays?: number;
  totalTime?: string;
  data?: number[];
}

const HEATMAP_CELL_COUNT = 126;

export function StudyHeatmap({
  activeDays = 0,
  totalTime = "0h 0m",
  data,
}: StudyHeatmapProps) {
  // 18 weeks * 7 days = 126 cells, always sourced from DB telemetry (never fabricated)
  const cells = useMemo(() => {
    if (!data || data.length === 0) {
      return Array<number>(HEATMAP_CELL_COUNT).fill(0);
    }
    if (data.length >= HEATMAP_CELL_COUNT) {
      return data.slice(data.length - HEATMAP_CELL_COUNT);
    }
    return [
      ...Array<number>(HEATMAP_CELL_COUNT - data.length).fill(0),
      ...data,
    ];
  }, [data]);

  return (
    <div className="box">
      <div className="heat-top">
        <div>
          <b>{activeDays}</b>
          <small>active days</small>
        </div>
        <div>
          <b>{totalTime}</b>
          <small>total</small>
        </div>
      </div>

      <div
        className="heat"
        style={{ gridTemplateColumns: "repeat(18, 1fr)" }}
        aria-label="Study activity over the last 18 weeks"
      >
        {cells.map((level, i) => (
          <i
            key={i}
            className={level > 0 ? `l${Math.min(4, level)}` : undefined}
            title={level > 0 ? `Activity level: ${level}` : "No activity"}
          />
        ))}
      </div>

      <div className="legend">
        <span>Less</span>
        <i style={{ background: "var(--panel2)" }} />
        <i style={{ background: "#2C3170" }} />
        <i style={{ background: "#4045B5" }} />
        <i style={{ background: "var(--indigo-hi)" }} />
        <i style={{ background: "var(--mark)" }} />
        <span>More</span>
      </div>
    </div>
  );
}
