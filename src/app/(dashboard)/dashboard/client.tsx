"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import "./dashboard.css";

import type {
  DashboardPlanItem,
  WeeklyLeagueEntry,
} from "@/features/dashboard/server/dashboard-data";
import type {
  LearningLessonSummary,
  LearningOverview,
} from "@/features/learning/server/content";

import { ContinueHeroBanner } from "./components/ContinueHeroBanner";
import { StatsStrip } from "./components/StatsStrip";
import { TodaysPlan } from "./components/TodaysPlan";
import { StudyHeatmap } from "./components/StudyHeatmap";
import { QuickPracticeCard } from "./components/QuickPracticeCard";
import { TipsCarousel } from "./components/TipsCarousel";
import { DailyGoalCard } from "./components/DailyGoalCard";
import { WordOfTheDayCard } from "./components/WordOfTheDayCard";
import { WeeklyLeagueCard } from "./components/WeeklyLeagueCard";

export interface DashboardClientProps {
  accountLabel: string;
  firstName: string;
  level: { code: string; label: string; progress: number };
  dailyMinutes: number;
  nextLesson:
    | (Pick<
        LearningLessonSummary,
        "title" | "summary" | "href" | "slug" | "progressPercent"
      > & {
        skillTitle?: string;
        skillSlug?: string;
        description?: string;
      })
    | null;
  progress: number;
  overview: Pick<LearningOverview, "completedLessons"> | null;
  streak: number;
  xp: number;
  dailyGoal: { current: number; total: number };
  weekData: number[];
  planItems: DashboardPlanItem[];
  wordOfTheDay: {
    word: string;
    phonetics: string;
    type: string;
    level: string;
    definition: string;
    example: string;
  };
  heatData: number[];
  activeDays?: number;
  totalTimeFormatted?: string;
  weeklyLeague?: WeeklyLeagueEntry[];
  hasStreakFreeze?: boolean;
}

const subscribeNoop = () => () => {};
const getServerGreeting = () => "Good afternoon";
function getClientGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function DashboardClient({
  accountLabel,
  firstName,
  level,
  nextLesson,
  progress,
  overview,
  streak,
  xp,
  dailyGoal,
  weekData,
  planItems,
  wordOfTheDay,
  heatData,
  activeDays = 0,
  totalTimeFormatted = "0h 0m",
  weeklyLeague = [],
}: DashboardClientProps) {
  const greeting = useSyncExternalStore(
    subscribeNoop,
    getClientGreeting,
    getServerGreeting,
  );

  // Compute total weekly time strictly from real weekData telemetry
  const totalWeeklyMinutes = Array.isArray(weekData)
    ? weekData.reduce((acc, m) => acc + (Number.isFinite(m) ? m : 0), 0)
    : 0;
  const weeklyHours = Math.floor(totalWeeklyMinutes / 60);
  const weeklyMins = totalWeeklyMinutes % 60;
  const thisWeekFormatted = `${weeklyHours}h ${weeklyMins}m`;

  const lessonsDone = overview?.completedLessons ?? 0;
  const userInitial = (firstName || accountLabel || "Y")
    .trim()
    .charAt(0)
    .toUpperCase();

  // Continue banner details (honest progress without fabricated default)
  const continueTitle =
    nextLesson?.skillTitle ?? nextLesson?.title ?? "Start learning";
  const continueDesc =
    nextLesson?.description ??
    nextLesson?.summary ??
    "Pick your first lesson or practice module to build momentum.";
  const continueHref =
    nextLesson?.href ??
    (nextLesson?.slug
      ? `/learn/${nextLesson.skillSlug ?? "grammar"}/${nextLesson.slug}`
      : "/learn");
  const continueProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="dashboard-scope">
      <div className="wrap">
        {/* Top Hero Section */}
        <section className="top" aria-label="Welcome and statistics summary">
          <div>
            <h1 id="hello">
              {greeting}, {firstName}
            </h1>
            <p>
              {streak > 0
                ? `${streak}-day streak. Keep the momentum going.`
                : "Complete a lesson or practice exercise today to start your streak."}
            </p>
          </div>

          <div className="pills">
            <div className="pill">
              <i aria-hidden="true" />
              {streak}d <small>streak</small>
            </div>
            <div className="pill xp">
              <i aria-hidden="true" />
              {Number(xp).toLocaleString()} <small>XP</small>
            </div>
          </div>
        </section>

        {/* 2-Column Main Grid */}
        <div className="grid">
          {/* Main Left Column */}
          <div className="col">
            <ContinueHeroBanner
              title={continueTitle}
              description={continueDesc}
              progressPercent={continueProgress}
              href={continueHref}
            />

            <StatsStrip
              lessonsDone={lessonsDone}
              streakDays={streak}
              thisWeekTime={thisWeekFormatted}
              level={level}
            />

            <TodaysPlan items={planItems} />

            {/* Duo Section: Study Heatmap & Quick Practice */}
            <section className="duo" aria-label="Practice and activity">
              <div>
                <div className="head">
                  <h2>Study heatmap</h2>
                </div>
                <StudyHeatmap
                  data={heatData}
                  activeDays={activeDays}
                  totalTime={totalTimeFormatted}
                />
              </div>

              <div>
                <div className="head">
                  <h2>Quick practice</h2>
                  <Link href="/learn/vocabulary" prefetch={false}>
                    More
                  </Link>
                </div>
                <QuickPracticeCard />
              </div>
            </section>

            <TipsCarousel />
          </div>

          {/* Right Sticky Sidebar */}
          <aside className="side" aria-label="Goals and community">
            <DailyGoalCard
              current={dailyGoal?.current ?? 0}
              total={dailyGoal?.total ?? 4}
            />

            <WordOfTheDayCard wordInfo={wordOfTheDay} />

            <WeeklyLeagueCard
              userXp={xp}
              userInitial={userInitial}
              entries={weeklyLeague}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
