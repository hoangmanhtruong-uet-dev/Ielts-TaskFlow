import "server-only";

import { cookies } from "next/headers";

import {
  getAccountLabel,
  requireCurrentAccount,
} from "@/features/auth/server/account";
import {
  calculateStreakState,
  type StreakState,
} from "@/features/gamification/server/streak";
import {
  buildLearningOverview,
  getLearningCatalog,
  type LearningModuleSummary,
  type LearningOverview,
} from "@/features/learning/server/content";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getWordOfTheDay, type WordLevel } from "./word-of-the-day";

export interface DashboardPlanItem {
  id: string;
  iconText: string;
  colorClass: string;
  title: string;
  subtitle: string;
  href: string;
  tag?: string;
  completed?: boolean;
  progressPercent?: number;
}

export interface WeeklyLeagueEntry {
  userId: string;
  rank: number;
  initials: string;
  label: string;
  xp: number;
  isCurrentUser: boolean;
}

export interface DashboardData {
  accountLabel: string;
  firstName: string;
  level: { code: string; label: string; progress: number };
  dailyMinutes: number;
  overview: LearningOverview;
  gamification: {
    streak: StreakState;
    xp: number;
    level: number;
    hasStreakFreeze: boolean;
    streakFreezesAvailable: number;
  };
  wordOfTheDay: ReturnType<typeof getWordOfTheDay>;
  dailyGoal: { current: number; total: number };
  weekData: number[];
  heatData: number[];
  activeDays: number;
  totalTimeFormatted: string;
  planItems: DashboardPlanItem[];
  weeklyLeague: WeeklyLeagueEntry[];
  userTimezone: string;
}

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const HEATMAP_DAYS = 126;

export function safeResolveTimezone(rawTimezone?: string | null): string {
  const candidate = rawTimezone?.trim() || DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: candidate }).format(
      new Date(),
    );
    return candidate;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function toLocalDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function shiftDateKey(
  baseDate: Date,
  offsetDays: number,
  timeZone: string,
): string {
  const shifted = new Date(baseDate.getTime() + offsetDays * 86_400_000);
  return toLocalDateKey(shifted, timeZone);
}

function getCefrLevel(band: number | null) {
  if (band === null || band < 3.5) {
    return {
      code: "A1",
      label: "Beginner",
      progress: band ? Math.min(95, Math.round((band / 3.5) * 100)) : 0,
    };
  }
  if (band < 4.5) {
    return {
      code: "A2",
      label: "Elementary",
      progress: Math.round(((band - 3.5) / 1.0) * 100),
    };
  }
  if (band < 5.5) {
    return {
      code: "B1",
      label: "Intermediate",
      progress: Math.round(((band - 4.5) / 1.0) * 100),
    };
  }
  if (band < 6.5) {
    return {
      code: "B2",
      label: "Upper-Intermediate",
      progress: Math.round(((band - 5.5) / 1.0) * 100),
    };
  }
  if (band < 8.0) {
    return {
      code: "C1",
      label: "Advanced",
      progress: Math.round(((band - 6.5) / 1.5) * 100),
    };
  }
  return {
    code: "C2",
    label: "Proficiency",
    progress: Math.min(100, Math.round(((band - 8.0) / 1.0) * 100)),
  };
}

function getWordLevel(band: number | null): WordLevel {
  if (band === null) return "B1";
  if (band < 4) return "A2";
  if (band < 5) return "B1";
  if (band < 6.5) return "B2";
  if (band < 8) return "C1";
  return "C2";
}

function xpToHeatLevel(xp: number): number {
  if (xp <= 0) return 0;
  if (xp < 25) return 1;
  if (xp < 60) return 2;
  if (xp < 120) return 3;
  return 4;
}

function formatHoursMinutes(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours}h ${mins}m`;
}

function computeSkillProgress(modules: LearningModuleSummary[], skill: string) {
  const matched = modules.filter((mod) => mod.skill === skill);
  if (matched.length === 0) return { progressPercent: 0, completed: false };
  const totalLessons = matched.reduce((acc, mod) => acc + mod.totalLessons, 0);
  const completedLessons = matched.reduce(
    (acc, mod) => acc + mod.completedLessons,
    0,
  );
  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : Math.round(
          matched.reduce((acc, mod) => acc + mod.progressPercent, 0) /
            matched.length,
        );
  return {
    progressPercent,
    completed: totalLessons > 0 && completedLessons === totalLessons,
  };
}

/**
 * Fetch real learner telemetry for the Dashboard from Supabase.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [account, { learnerProfile }, catalog] = await Promise.all([
    requireCurrentAccount(),
    requireCompletedOnboarding(),
    getLearningCatalog(),
  ]);
  const overview = buildLearningOverview(catalog);
  const supabase = await createSupabaseServerClient();

  const cookieStore = await cookies();
  const userTimezone = safeResolveTimezone(
    cookieStore.get("x-user-timezone")?.value ?? account.profile?.timezone,
  );

  const now = new Date();
  const todayKey = toLocalDateKey(now, userTimezone);
  const lookbackStartIso = new Date(
    now.getTime() - HEATMAP_DAYS * 86_400_000,
  ).toISOString();
  const recent48hIso = new Date(now.getTime() - 2 * 86_400_000).toISOString();

  const [
    gamificationRes,
    xpEventsRes,
    practiceAttemptsRes,
    recentCompletedLessonsRes,
    dictationTotalRes,
    dictationCompletedRes,
    mistakesCountRes,
    listeningTotalRes,
    listeningDoneRes,
    latestLeaderboardWeekRes,
  ] = await Promise.all([
    supabase
      .from("user_gamification")
      .select(
        "total_xp, current_level, current_streak, longest_streak, last_activity_date, streak_freezes_available",
      )
      .eq("user_id", account.user.id)
      .maybeSingle(),
    supabase
      .from("xp_events")
      .select("amount, created_at")
      .eq("user_id", account.user.id)
      .gte("created_at", lookbackStartIso),
    supabase
      .from("learner_attempts")
      .select("started_at, submitted_at, status")
      .eq("user_id", account.user.id)
      .eq("is_mock", false)
      .not("submitted_at", "is", null)
      .gte("submitted_at", lookbackStartIso),
    supabase
      .from("learner_lesson_progress")
      .select("completed_at")
      .eq("user_id", account.user.id)
      .eq("status", "completed")
      .gte("completed_at", recent48hIso),
    supabase
      .from("dictation_exercises")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("dictation_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", account.user.id)
      .eq("completed", true),
    supabase
      .from("learner_answers")
      .select("id, learner_attempts!inner(user_id, is_mock)", {
        count: "exact",
        head: true,
      })
      .eq("is_correct", false)
      .eq("learner_attempts.user_id", account.user.id)
      .eq("learner_attempts.is_mock", false),
    supabase
      .from("exercise_sets")
      .select("id", { count: "exact", head: true })
      .eq("domain", "listening"),
    supabase
      .from("learner_attempts")
      .select("id, exercise_sets!inner(domain)", { count: "exact", head: true })
      .eq("user_id", account.user.id)
      .eq("is_mock", false)
      .eq("status", "submitted")
      .eq("exercise_sets.domain", "listening"),
    supabase
      .from("weekly_leaderboards")
      .select("week_start")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const gamificationRow = gamificationRes.data;
  const currentXp = gamificationRow?.total_xp ?? 0;
  const currentLevel = gamificationRow?.current_level ?? 1;
  const streakFreezesAvailable = gamificationRow?.streak_freezes_available ?? 0;
  const rawLastActivity = gamificationRow?.last_activity_date ?? null;

  // Determine effective live streak accurately without fabricating numbers
  let effectiveStreak = 0;
  const longestStreak = gamificationRow?.longest_streak ?? 0;
  if (rawLastActivity && (gamificationRow?.current_streak ?? 0) > 0) {
    const yesterdayKey = shiftDateKey(now, -1, userTimezone);
    const twoDaysAgoKey = shiftDateKey(now, -2, userTimezone);
    if (rawLastActivity === todayKey || rawLastActivity === yesterdayKey) {
      effectiveStreak = gamificationRow?.current_streak ?? 0;
    } else if (
      rawLastActivity === twoDaysAgoKey &&
      streakFreezesAvailable > 0
    ) {
      effectiveStreak = gamificationRow?.current_streak ?? 0;
    }
  }

  // Only invoke calculateStreakState reference for compatibility; preserve 0 when no activity exists
  const baseState: StreakState = {
    currentStreak: effectiveStreak,
    longestStreak,
    streakFreezeCount: streakFreezesAvailable,
    isStreakActiveToday: rawLastActivity === todayKey,
    freezeUsedToday: false,
    lastActiveDate: rawLastActivity,
  };
  const streak: StreakState =
    effectiveStreak === 0 && !rawLastActivity
      ? baseState
      : rawLastActivity === todayKey
        ? calculateStreakState(baseState, now)
        : baseState;

  // Aggregate XP events by day (last 126 days)
  const xpByDay = new Map<string, number>();
  for (const ev of xpEventsRes.data ?? []) {
    if (!ev.created_at) continue;
    const key = toLocalDateKey(new Date(ev.created_at), userTimezone);
    xpByDay.set(key, (xpByDay.get(key) ?? 0) + (ev.amount ?? 0));
  }

  // Aggregate real elapsed minutes from submitted non-mock practice attempts
  const minutesByDay = new Map<string, number>();
  let totalMinutes126d = 0;
  for (const att of practiceAttemptsRes.data ?? []) {
    if (!att.started_at || !att.submitted_at) continue;
    const startMs = new Date(att.started_at).getTime();
    const endMs = new Date(att.submitted_at).getTime();
    const mins = Math.min(
      120,
      Math.max(1, Math.round((endMs - startMs) / 60_000)),
    );
    const key = toLocalDateKey(new Date(att.submitted_at), userTimezone);
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + mins);
    totalMinutes126d += mins;
  }

  const heatData: number[] = [];
  let activeDays = 0;
  for (let offset = -(HEATMAP_DAYS - 1); offset <= 0; offset += 1) {
    const key = shiftDateKey(now, offset, userTimezone);
    const dayXp = xpByDay.get(key) ?? 0;
    const dayMins = minutesByDay.get(key) ?? 0;
    const levelVal = dayXp > 0 ? xpToHeatLevel(dayXp) : dayMins > 0 ? 1 : 0;
    if (levelVal > 0) activeDays += 1;
    heatData.push(levelVal);
  }

  const weekData: number[] = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const key = shiftDateKey(now, offset, userTimezone);
    weekData.push(minutesByDay.get(key) ?? 0);
  }

  const completedTodayCount = (recentCompletedLessonsRes.data ?? []).filter(
    (row) => {
      if (!row.completed_at) return false;
      return (
        toLocalDateKey(new Date(row.completed_at), userTimezone) === todayKey
      );
    },
  ).length;

  const dailyGoalTarget = learnerProfile.daily_study_minutes
    ? Math.max(1, Math.floor(learnerProfile.daily_study_minutes / 10))
    : 4;

  // Weekly league snapshot (latest week if populated)
  const accountLabel = getAccountLabel(account);
  const firstName = accountLabel.trim().split(/\s+/).at(-1) ?? accountLabel;
  let weeklyLeague: WeeklyLeagueEntry[] = [];
  const latestWeekStart = latestLeaderboardWeekRes.data?.week_start;
  if (latestWeekStart) {
    const { data: lbRows } = await supabase
      .from("weekly_leaderboards")
      .select("user_id, weekly_xp, rank")
      .eq("week_start", latestWeekStart)
      .order("weekly_xp", { ascending: false })
      .order("rank", { ascending: true })
      .limit(50);

    const rows = lbRows ?? [];
    if (rows.length > 0) {
      const normalized = rows.map((row, idx) => {
        const isCurrentUser = row.user_id === account.user.id;
        const rank = row.rank ?? idx + 1;
        const label = isCurrentUser
          ? firstName || accountLabel
          : `Học viên #${rank}`;
        return {
          userId: row.user_id,
          rank,
          initials: isCurrentUser
            ? (firstName || accountLabel || "Y").trim().charAt(0).toUpperCase()
            : `#${rank}`,
          label,
          xp: row.weekly_xp ?? 0,
          isCurrentUser,
        };
      });
      const myIndex = normalized.findIndex((entry) => entry.isCurrentUser);
      if (myIndex >= 0) {
        const start = Math.max(0, myIndex - 1);
        const end = Math.min(normalized.length, start + 3);
        weeklyLeague = normalized.slice(Math.max(0, end - 3), end);
      } else {
        weeklyLeague = normalized.slice(0, 3);
      }
    }
  }

  // Real Plan Items progress
  const vocabStats = computeSkillProgress(catalog, "vocabulary");
  const grammarStats = computeSkillProgress(catalog, "grammar");
  const listeningTotal = listeningTotalRes.count ?? 0;
  const listeningDone = listeningDoneRes.count ?? 0;
  const listeningProgress =
    listeningTotal > 0
      ? Math.min(100, Math.round((listeningDone / listeningTotal) * 100))
      : 0;
  const dictationTotal = dictationTotalRes.count ?? 0;
  const dictationDone = dictationCompletedRes.count ?? 0;
  const dictationProgress =
    dictationTotal > 0
      ? Math.min(100, Math.round((dictationDone / dictationTotal) * 100))
      : 0;
  const mistakesCount = mistakesCountRes.count ?? 0;

  const planItems: DashboardPlanItem[] = [
    {
      id: "vocab",
      iconText: "Aa",
      colorClass: "c-v",
      title: "Vocabulary",
      subtitle: "Flashcards and spaced repetition",
      href: "/learn/vocabulary",
      completed: vocabStats.completed,
      progressPercent: vocabStats.progressPercent,
    },
    {
      id: "grammar",
      iconText: "Gr",
      colorClass: "c-g",
      title: "Grammar",
      subtitle: "Rules and structure drills",
      href: "/learn/grammar",
      completed: grammarStats.completed,
      progressPercent: grammarStats.progressPercent,
    },
    {
      id: "listening",
      iconText: "Li",
      colorClass: "c-l",
      title: "Listening",
      subtitle: "Audio comprehension",
      href: "/practice/listening",
      progressPercent: listeningProgress,
    },
    {
      id: "dictation",
      iconText: "Di",
      colorClass: "c-d",
      title: "Dictation",
      tag: "NEW",
      subtitle: "Listen and write with exact diff feedback",
      href: "/dictation",
      progressPercent: dictationProgress,
    },
    {
      id: "mistakes",
      iconText: "!",
      colorClass: "c-m",
      title: "Review mistakes",
      subtitle:
        mistakesCount > 0
          ? `${mistakesCount} recorded errors waiting for review`
          : "No unresolved practice errors recorded",
      href: "/error-notebook",
    },
  ];

  const band = learnerProfile.current_band ?? null;

  return {
    accountLabel,
    firstName,
    level: getCefrLevel(band),
    dailyMinutes: learnerProfile.daily_study_minutes ?? 20,
    overview,
    gamification: {
      streak,
      xp: currentXp,
      level: currentLevel,
      hasStreakFreeze: streakFreezesAvailable > 0,
      streakFreezesAvailable,
    },
    wordOfTheDay: getWordOfTheDay(getWordLevel(band), userTimezone),
    dailyGoal: {
      current: completedTodayCount,
      total: dailyGoalTarget,
    },
    weekData,
    heatData,
    activeDays,
    totalTimeFormatted: formatHoursMinutes(totalMinutes126d),
    planItems,
    weeklyLeague,
    userTimezone,
  };
}
