"use client";

import React, { memo } from "react";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

interface Props {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const DictationSpeedSelector = memo(function DictationSpeedSelector({
  currentSpeed,
  onSpeedChange,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-xs text-gray-500">Tốc độ:</span>
      {SPEEDS.map((speed) => (
        <button
          key={speed}
          onClick={() => onSpeedChange(speed)}
          className={`rounded-md px-2 py-1 text-xs transition-colors ${
            currentSpeed === speed
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {speed}x
        </button>
      ))}
    </div>
  );
});
