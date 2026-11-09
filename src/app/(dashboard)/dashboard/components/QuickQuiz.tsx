"use client";

import React, { useState, memo } from "react";
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const QuickQuiz = memo(function QuickQuiz() {
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      {/* 3D Flip Container */}
      <div
        className="group relative h-40 w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateX: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--primary-soft)] bg-[var(--primary-subtle)] p-4 transition-shadow hover:shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Sparkles
              size={16}
              className="absolute top-3 right-3 text-[var(--primary)]"
            />
            <p className="mb-2 text-[10px] font-bold tracking-wider text-[var(--primary)] uppercase">
              Tap to flip
            </p>
            <p className="text-center text-xl font-extrabold text-[var(--foreground)]">
              To be accustomed ___
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[var(--primary)] bg-[var(--primary)] p-4 text-white shadow-lg"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
          >
            <p className="mb-1 text-sm font-semibold opacity-90">Preposition</p>
            <p className="text-3xl font-black">to</p>
            <p className="mt-2 text-center text-xs opacity-80">
              e.g. "I am accustomed to waking up early."
            </p>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setAnswered(true);
            setTimeout(() => {
              setFlipped(false);
              setAnswered(false);
            }, 1500);
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-bold transition-all active:scale-95",
            answered
              ? "border-[var(--success)] bg-[var(--success)] text-white"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--muted)]",
          )}
        >
          {answered ? <CheckCircle2 size={16} /> : "I knew this"}
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setAnswered(false);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-sm font-bold text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] active:scale-95"
        >
          <RotateCcw size={16} />
          Needs review
        </button>
      </div>
    </div>
  );
});
