"use client";

import React from "react";
import Link from "next/link";

import type { WeeklyLeagueEntry } from "@/features/dashboard/server/dashboard-data";

interface WeeklyLeagueCardProps {
  userXp?: number;
  userInitial?: string;
  entries?: WeeklyLeagueEntry[];
}

export function WeeklyLeagueCard({
  userXp = 0,
  userInitial = "Y",
  entries = [],
}: WeeklyLeagueCardProps) {
  const formattedUserXp = Number(userXp).toLocaleString();
  const meIndex = entries.findIndex((entry) => entry.isCurrentUser);
  const aheadEntry = meIndex > 0 ? entries[meIndex - 1] : null;
  const myEntry = meIndex >= 0 ? entries[meIndex] : null;
  const xpGap =
    aheadEntry && myEntry ? Math.max(1, aheadEntry.xp - myEntry.xp + 1) : null;

  return (
    <div className="box lg">
      <div className="head" style={{ marginBottom: "10px" }}>
        <h2 style={{ fontSize: "19px" }}>Weekly league</h2>
        <Link href="/leaderboard" prefetch={false}>
          View full
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="space-y-3">
          <div className="r me2">
            <span className="rk" style={{ color: "var(--mark)" }}>
              —
            </span>
            <span className="av">{userInitial}</span>
            <b>You</b>
            <span className="xp">{formattedUserXp} XP</span>
          </div>
          <p className="muted">
            Chưa có bảng xếp hạng tuần này. Hoàn thành bài học để tích lũy XP.
          </p>
        </div>
      ) : (
        <>
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={`r ${entry.isCurrentUser ? "me2" : ""}`}
            >
              <span
                className="rk"
                style={
                  entry.isCurrentUser ? { color: "var(--mark)" } : undefined
                }
              >
                {entry.rank}
              </span>
              <span className="av">{entry.initials}</span>
              {entry.isCurrentUser ? <b>You</b> : <span>{entry.label}</span>}
              <span className="xp">{Number(entry.xp).toLocaleString()} XP</span>
            </div>
          ))}

          {xpGap !== null && aheadEntry ? (
            <div className="gap">
              +{xpGap.toLocaleString()} XP overtakes rank {aheadEntry.rank}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
