import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpCircle,
  Calendar,
  Crown,
  Flame,
  ShieldCheck,
  Trophy,
  Zap,
} from "lucide-react";

import {
  getAccountLabel,
  requireCurrentAccount,
} from "@/features/auth/server/account";
import { StreakFreezeButton } from "@/features/gamification/components/streak-freeze-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface LeaderboardDisplayRow {
  userId: string;
  displayName: string;
  initials: string;
  weeklyXp: number;
  rank: number;
  isCurrentUser: boolean;
  currentStreak: number;
}

function getInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "HV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default async function LeaderboardPage() {
  const account = await requireCurrentAccount();
  const supabase = await createSupabaseServerClient();

  const [myGamificationRes, latestWeekRes] = await Promise.all([
    supabase
      .from("user_gamification")
      .select(
        "streak_freezes_available, total_xp, current_streak, current_level",
      )
      .eq("user_id", account.user.id)
      .maybeSingle(),
    supabase
      .from("weekly_leaderboards")
      .select("week_start, week_end")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const myGamification = myGamificationRes.data;
  const myTotalXp = myGamification?.total_xp ?? 0;
  const myStreakFreezes = myGamification?.streak_freezes_available ?? 0;
  const myCurrentStreak = myGamification?.current_streak ?? 0;
  const myLabel = getAccountLabel(account);

  const latestWeek = latestWeekRes.data;
  let rows: LeaderboardDisplayRow[] = [];

  if (latestWeek?.week_start) {
    const { data: boardData } = await supabase
      .from("weekly_leaderboards")
      .select("user_id, weekly_xp, rank")
      .eq("week_start", latestWeek.week_start)
      .order("weekly_xp", { ascending: false })
      .order("rank", { ascending: true })
      .limit(30);

    rows = (boardData ?? []).map((entry, idx) => {
      const rank = entry.rank ?? idx + 1;
      const isCurrentUser = entry.user_id === account.user.id;
      const displayName = isCurrentUser ? myLabel : `Học viên #${rank}`;
      return {
        userId: entry.user_id,
        displayName,
        initials: isCurrentUser ? getInitials(myLabel) : `#${rank}`,
        weeklyXp: entry.weekly_xp ?? 0,
        rank,
        isCurrentUser,
        currentStreak: isCurrentUser ? myCurrentStreak : 0,
      };
    });
  }

  const top3 = rows.slice(0, 3);
  const restRows = rows.slice(3);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <Trophy size={28} className="text-indigo-600" aria-hidden="true" />
            Bảng Xếp Hạng Tuần
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-600">
            Theo dõi XP tích lũy từ bài học và bài luyện tập thực tế của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs">
          <Calendar size={16} className="text-indigo-600" aria-hidden="true" />
          {latestWeek
            ? `Tuần: ${latestWeek.week_start} – ${latestWeek.week_end}`
            : "Chưa mở bảng xếp hạng tuần"}
        </div>
      </div>

      {/* Personal Summary + Streak Freeze */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {getInitials(myLabel)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{myLabel}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
              <span>{myTotalXp.toLocaleString()} XP tổng</span>
              <span className="inline-flex items-center gap-1 text-orange-600">
                <Flame
                  size={13}
                  className="fill-orange-500 text-orange-500"
                  aria-hidden="true"
                />
                {myCurrentStreak} ngày streak
              </span>
            </div>
          </div>
        </div>

        <StreakFreezeButton
          currentFreezes={myStreakFreezes}
          currentXp={myTotalXp}
        />
      </div>

      {/* Practice CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-1 shadow-md">
        <div className="relative flex flex-col items-center justify-between gap-4 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm sm:flex-row">
          <div className="text-white">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Zap
                className="fill-amber-300 text-amber-300"
                aria-hidden="true"
              />
              Tích lũy thêm XP từ bài luyện thật
            </h2>
            <p className="mt-1 text-sm text-indigo-100">
              Hoàn thành bài đọc Reading, Listening hoặc Dictation để tăng XP và
              duy trì chuỗi học mỗi ngày.
            </p>
          </div>
          <Link
            href="/practice/reading"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-200"
          >
            Luyện tập ngay
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
          <Trophy
            size={36}
            className="mx-auto text-slate-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Chưa có dữ liệu xếp hạng tuần này
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Khi bảng xếp hạng tuần được tổng hợp từ hoạt động học tập thực tế,
            thứ hạng của bạn sẽ xuất hiện tại đây.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/learn"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Mở thư viện học
            </Link>
            <Link
              href="/dictation"
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Luyện Dictation
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* Podium View */}
          {top3.length > 0 ? (
            <div className="flex flex-col items-end justify-center gap-3 px-4 pt-6 sm:flex-row sm:gap-6">
              {top3[1] ? (
                <div className="z-10 flex w-full flex-col items-center sm:w-40">
                  <div className="relative mb-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-300 bg-slate-100 text-sm font-bold text-slate-700 shadow-md">
                      {top3[1].initials}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-slate-200 px-2.5 py-0.5 text-xs font-black text-slate-700 shadow-sm">
                      2
                    </div>
                  </div>
                  <div className="flex h-24 w-full flex-col items-center rounded-t-xl border border-b-0 border-slate-200 bg-gradient-to-t from-slate-200 to-slate-100 px-2 pt-4 shadow-inner">
                    <span className="w-full truncate text-center text-sm font-bold text-slate-800">
                      {top3[1].displayName}
                    </span>
                    <span className="mt-1 text-xs font-bold text-slate-600">
                      {top3[1].weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              ) : null}

              {top3[0] ? (
                <div className="z-20 flex w-full flex-col items-center sm:w-44">
                  <Crown
                    size={28}
                    className="mb-2 fill-amber-400 text-amber-400 drop-shadow-sm"
                    aria-hidden="true"
                  />
                  <div className="relative mb-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50 text-base font-black text-amber-800 shadow-lg">
                      {top3[0].initials}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-amber-400 px-3 py-0.5 text-xs font-black text-amber-950 shadow-sm">
                      1
                    </div>
                  </div>
                  <div className="flex h-32 w-full flex-col items-center rounded-t-xl border border-b-0 border-amber-200 bg-gradient-to-t from-amber-300/70 to-amber-100 px-2 pt-4 shadow-md">
                    <span className="w-full truncate text-center text-sm font-bold text-slate-900">
                      {top3[0].displayName}
                    </span>
                    <span className="mt-1 text-xs font-black text-amber-800">
                      {top3[0].weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              ) : null}

              {top3[2] ? (
                <div className="z-10 flex w-full flex-col items-center sm:w-40">
                  <div className="relative mb-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-700/40 bg-orange-50 text-sm font-bold text-amber-900 shadow-md">
                      {top3[2].initials}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-amber-700 px-2.5 py-0.5 text-xs font-black text-amber-50 shadow-sm">
                      3
                    </div>
                  </div>
                  <div className="flex h-20 w-full flex-col items-center rounded-t-xl border border-b-0 border-amber-200/60 bg-gradient-to-t from-amber-200/50 to-amber-100/40 px-2 pt-4 shadow-inner">
                    <span className="w-full truncate text-center text-sm font-bold text-slate-800">
                      {top3[2].displayName}
                    </span>
                    <span className="mt-1 text-xs font-bold text-amber-800">
                      {top3[2].weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Full Weekly Leaderboard List */}
          {restRows.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Bảng xếp hạng tuần này
                </span>
                <ArrowUpCircle
                  size={18}
                  className="text-emerald-600"
                  aria-hidden="true"
                />
              </div>

              <div className="divide-y divide-slate-100">
                {restRows.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 px-6 py-3 ${
                      entry.isCurrentUser ? "bg-indigo-50/70" : ""
                    }`}
                  >
                    <span
                      className={`w-7 text-center font-bold ${
                        entry.isCurrentUser
                          ? "text-indigo-700"
                          : "text-slate-500"
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">
                      {entry.initials}
                      {entry.isCurrentUser ? (
                        <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border border-white bg-indigo-600">
                          <ShieldCheck
                            size={10}
                            className="text-white"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold ${
                          entry.isCurrentUser
                            ? "text-indigo-900"
                            : "text-slate-800"
                        }`}
                      >
                        {entry.displayName}
                        {entry.isCurrentUser ? (
                          <span className="ml-2 rounded bg-indigo-200 px-1.5 py-0.5 text-[10px] text-indigo-800 uppercase">
                            Bạn
                          </span>
                        ) : null}
                      </p>
                      {entry.currentStreak > 0 ? (
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <Flame
                            size={12}
                            className="fill-orange-500 text-orange-500"
                            aria-hidden="true"
                          />
                          {entry.currentStreak} ngày
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm font-black text-slate-800">
                      {entry.weeklyXp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
