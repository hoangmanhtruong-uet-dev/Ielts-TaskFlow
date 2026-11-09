"use client";

import React from "react";
import type { DictationUserStats } from "@/types/dictation";

interface Props {
  stats: DictationUserStats;
}

export function DictationStatsCard({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-xl border bg-white p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {stats.total_exercises_attempted}
        </div>
        <div className="mt-1 text-xs text-gray-500">Bài đã luyện</div>
      </div>
      <div className="rounded-xl border bg-white p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.total_exercises_completed}
        </div>
        <div className="mt-1 text-xs text-gray-500">Bài hoàn thành</div>
      </div>
      <div className="rounded-xl border bg-white p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">
          {stats.average_best_score}%
        </div>
        <div className="mt-1 text-xs text-gray-500">Điểm TB cao nhất</div>
      </div>
      <div className="rounded-xl border bg-white p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">
          {stats.total_attempts}
        </div>
        <div className="mt-1 text-xs text-gray-500">Tổng lượt làm</div>
      </div>
    </div>
  );
}
