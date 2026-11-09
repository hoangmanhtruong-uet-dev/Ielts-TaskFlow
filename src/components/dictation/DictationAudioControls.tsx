"use client";

import React, { memo } from "react";
import { DictationSpeedSelector } from "./DictationSpeedSelector";

interface Props {
  isPlaying: boolean;
  isLoading: boolean;
  playbackSpeed: number;
  replayCount: number;
  onTogglePlay: () => void;
  onReplaySentence: () => void;
  onSpeedChange: (speed: number) => void;
}

export const DictationAudioControls = memo(function DictationAudioControls({
  isPlaying: _isPlaying,
  isLoading,
  playbackSpeed,
  replayCount,
  onTogglePlay: _onTogglePlay,
  onReplaySentence,
  onSpeedChange,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row">
      <div className="flex items-center gap-2">
        {/* Replay sentence button */}
        <button
          onClick={onReplaySentence}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Nghe lại câu hiện tại (Ctrl+Space)"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Nghe lại</span>
          {replayCount > 0 && (
            <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs">
              {replayCount}
            </span>
          )}
        </button>
      </div>

      <DictationSpeedSelector
        currentSpeed={playbackSpeed}
        onSpeedChange={onSpeedChange}
      />
    </div>
  );
});
