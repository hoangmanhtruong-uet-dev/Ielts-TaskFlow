"use client";

import React from "react";
import Link from "next/link";

import type { DashboardPlanItem } from "@/features/dashboard/server/dashboard-data";

export type PlanItem = DashboardPlanItem;

const EMPTY_PLAN_ITEMS: PlanItem[] = [
  {
    id: "vocab",
    iconText: "Aa",
    colorClass: "c-v",
    title: "Vocabulary",
    subtitle: "Flashcards and spaced repetition",
    href: "/learn/vocabulary",
    progressPercent: 0,
  },
  {
    id: "grammar",
    iconText: "Gr",
    colorClass: "c-g",
    title: "Grammar",
    subtitle: "Rules and structure drills",
    href: "/learn/grammar",
    progressPercent: 0,
  },
  {
    id: "listening",
    iconText: "Li",
    colorClass: "c-l",
    title: "Listening",
    subtitle: "Audio comprehension",
    href: "/practice/listening",
    progressPercent: 0,
  },
  {
    id: "dictation",
    iconText: "Di",
    colorClass: "c-d",
    title: "Dictation",
    tag: "NEW",
    subtitle: "Listen and write with exact diff feedback",
    href: "/dictation",
    progressPercent: 0,
  },
  {
    id: "mistakes",
    iconText: "!",
    colorClass: "c-m",
    title: "Review mistakes",
    subtitle: "Review recorded practice errors",
    href: "/error-notebook",
  },
];

interface TodaysPlanProps {
  items?: PlanItem[];
}

export function TodaysPlan({ items }: TodaysPlanProps) {
  const displayItems = items && items.length > 0 ? items : EMPTY_PLAN_ITEMS;

  return (
    <section>
      <div className="head">
        <h2>Today&apos;s plan</h2>
        <Link href="/learn" prefetch={false}>
          See all
        </Link>
      </div>

      <div className="plan">
        {displayItems.map((item) => (
          <Link key={item.id} href={item.href} prefetch={false} className="row">
            <div className={`ic ${item.colorClass}`}>{item.iconText}</div>

            <div>
              <strong>
                {item.title}
                {item.tag ? <span className="tag">{item.tag}</span> : null}
              </strong>
              <small>{item.subtitle}</small>
            </div>

            {item.completed ? (
              <div className="pr done">Completed ✓</div>
            ) : typeof item.progressPercent === "number" ? (
              <div className="pr">
                <div className="t">
                  <i
                    style={{
                      width: `${item.progressPercent}%`,
                      background:
                        item.progressPercent > 0
                          ? "var(--mark)"
                          : "transparent",
                    }}
                  />
                </div>
                <b>{item.progressPercent}%</b>
              </div>
            ) : (
              <div />
            )}

            <span className="chev" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
