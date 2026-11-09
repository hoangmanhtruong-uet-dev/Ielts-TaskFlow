import type { Metadata } from "next";

import { getDashboardData } from "@/features/dashboard/server/dashboard-data";

import { DashboardClient } from "./client";

export const metadata: Metadata = {
  title: "Dashboard | Indigo Scholar",
  description:
    "Your English learning command centre — lessons, progress, and daily goals.",
};

export default async function DashboardPage() {
  const dashboard = await getDashboardData();
  const nextLesson =
    dashboard.overview.continueLesson ?? dashboard.overview.nextLesson;
  const progress = Math.round(nextLesson?.progressPercent ?? 0);

  return (
    <DashboardClient
      accountLabel={dashboard.accountLabel}
      firstName={dashboard.firstName}
      level={dashboard.level}
      dailyMinutes={dashboard.dailyMinutes}
      nextLesson={nextLesson}
      progress={progress}
      overview={dashboard.overview}
      streak={dashboard.gamification.streak.currentStreak}
      hasStreakFreeze={dashboard.gamification.hasStreakFreeze}
      xp={dashboard.gamification.xp}
      dailyGoal={dashboard.dailyGoal}
      weekData={dashboard.weekData}
      planItems={dashboard.planItems}
      wordOfTheDay={dashboard.wordOfTheDay}
      heatData={dashboard.heatData}
      activeDays={dashboard.activeDays}
      totalTimeFormatted={dashboard.totalTimeFormatted}
      weeklyLeague={dashboard.weeklyLeague}
    />
  );
}
