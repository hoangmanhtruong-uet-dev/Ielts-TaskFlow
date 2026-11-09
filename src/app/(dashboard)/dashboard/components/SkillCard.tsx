"use client";

import React, { memo } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SkillCardProps {
  id: string;
  label: string;
  desc: string;
  href: string;
  Icon: LucideIcon;
  colorClass: string; // e.g. "bg-violet-50 text-violet-600 border-violet-100"
  accentClass: string; // e.g. "bg-violet-600"
  tip: string;
  completed?: boolean;
  progressPct?: number;
  isNew?: boolean;
}

export const SkillCard = memo(function SkillCard({
  label,
  desc,
  href,
  Icon,
  colorClass,
  accentClass,
  tip,
  completed,
  progressPct,
  isNew,
}: SkillCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group app-panel flex flex-col gap-3 p-4",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgb(var(--shadow-color)/0.1)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none",
        completed && "opacity-70",
      )}
    >
      {/* Icon row */}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl border",
            colorClass,
          )}
        >
          <Icon size={20} aria-hidden />
        </span>
        <div className="flex items-center gap-1.5">
          {isNew && (
            <span className="rounded-full bg-[var(--primary-subtle)] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[var(--primary)] uppercase">
              New
            </span>
          )}
          {completed && (
            <CheckCircle2
              size={15}
              className="text-[var(--success)]"
              aria-label="Completed"
            />
          )}
        </div>
      </div>

      {/* Label & desc */}
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--foreground)]">{label}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted-foreground)]">
          {desc}
        </p>
      </div>

      {/* Progress bar (optional) */}
      {typeof progressPct === "number" && progressPct > 0 && (
        <div className="mt-auto space-y-0.5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className={cn("h-full rounded-full transition-all", accentClass)}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[9px] font-semibold text-[var(--muted-foreground)]">
            {progressPct}% today
          </p>
        </div>
      )}

      {/* Tip footer */}
      <p className="mt-auto flex items-center gap-1 text-[10px] font-semibold text-[var(--muted-foreground)]">
        <Sparkles size={9} aria-hidden />
        {tip}
      </p>
    </Link>
  );
});
