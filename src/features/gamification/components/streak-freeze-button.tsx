"use client";

import { useState } from "react";
import { Snowflake } from "lucide-react";

import { Button } from "@/components/ui/button";

import { buyStreakFreezeAction } from "../actions";

export function StreakFreezeButton({
  currentFreezes,
  currentXp,
}: {
  currentFreezes: number;
  currentXp: number;
}) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setFeedback(null);
    const res = await buyStreakFreezeAction();
    setLoading(false);
    setConfirming(false);

    if (res?.error) {
      setFeedback({ type: "error", text: res.error });
    } else {
      setFeedback({ type: "success", text: "Đổi Streak Freeze thành công!" });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2">
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-sm font-bold text-blue-900">
            <Snowflake size={14} className="text-blue-500" aria-hidden="true" />
            Bảo vệ chuỗi ngày (Freezes: {currentFreezes})
          </span>
          <span className="text-xs text-blue-700">Giá: 500 XP</span>
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleBuy}
              disabled={loading}
              className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            >
              {loading ? "Đang đổi..." : "Xác nhận -500 XP"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={loading}
              onClick={() => setConfirming(false)}
            >
              Hủy
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setFeedback(null);
              setConfirming(true);
            }}
            disabled={loading || currentXp < 500 || currentFreezes >= 5}
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            {currentFreezes >= 5 ? "Đã tối đa" : "Mua ngay"}
          </Button>
        )}
      </div>

      {feedback ? (
        <p
          role="status"
          aria-live="polite"
          className={`text-xs font-semibold ${
            feedback.type === "error" ? "text-rose-600" : "text-emerald-700"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
