import {
  Bell,
  BookOpenCheck,
  CircleGauge,
  Flame,
  RotateCcw,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { VocabularyCatalog } from "@/features/learning/components/vocabulary-catalog";
import {
  getVocabularyCatalog,
  getVocabularyProgressSummary,
} from "@/features/learning/server/foundations";

export const metadata: Metadata = {
  title: "Vocabulary",
  description: "Học từ vựng tiếng Anh theo tiến độ cá nhân.",
};

export default async function VocabularyPage() {
  const [entries, progress] = await Promise.all([
    getVocabularyCatalog(),
    getVocabularyProgressSummary(),
  ]);
  const current = entries[0];

  return (
    <div className="min-h-[100dvh] bg-[#fbf9ff] pb-24 lg:mx-auto lg:max-w-3xl lg:rounded-3xl lg:border lg:border-[#e6e0f2] lg:pb-10">
      <header className="flex h-14 items-center justify-between border-b border-[#ece7f3] bg-white px-4 lg:rounded-t-3xl">
        <div>
          <p className="text-xs text-[#6d6677]">Good morning,</p>
          <p className="text-sm font-bold text-[#2d18b7]">Scholar</p>
        </div>
        <Bell aria-label="Notifications" size={19} className="text-[#3f28c9]" />
      </header>

      <div className="space-y-7 px-4 py-5 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
          <p className="mt-1 text-sm text-[#746e80]">
            Build useful English words every day.
          </p>
        </div>

        <section
          aria-label="Vocabulary statistics"
          className="grid grid-cols-2 gap-3"
        >
          <StatCard
            icon={BookOpenCheck}
            label="WORDS AVAILABLE"
            value={entries.length}
          />
          <StatCard
            icon={RotateCcw}
            label="REVIEWING"
            value={progress.reviewing}
          />
          <StatCard icon={Flame} label="MASTERED" value={progress.mastered} />
          <div className="flex min-h-24 items-center justify-between rounded-2xl border border-[#e5dfef] bg-white p-4">
            <div>
              <p className="text-[10px] font-bold tracking-wide text-[#655e70]">
                DAILY GOAL
              </p>
              <p className="mt-2 text-lg font-bold">
                {Math.min(10, progress.reviewedToday)}/10
              </p>
            </div>
            <span className="grid size-12 place-items-center rounded-full border-4 border-[#5135d5] text-xs font-bold text-[#4128c5]">
              {Math.min(100, progress.reviewedToday * 10)}%
            </span>
          </div>
        </section>

        <nav
          aria-label="Vocabulary sections"
          className="flex border-b border-[#ded7e9] text-sm"
        >
          <span className="border-b-2 border-[#4d31d4] px-3 pb-2 font-bold text-[#3e27c1]">
            Learn
          </span>
          <span className="px-3 pb-2 text-[#70697c]">Review</span>
          <span className="px-3 pb-2 text-[#70697c]">Word Lists</span>
        </nav>

        {current ? (
          <section className="rounded-2xl bg-gradient-to-br from-[#4b2bd2] to-[#6e4ee5] p-5 text-white shadow-[0_12px_30px_rgba(73,44,202,.22)]">
            <p className="text-[10px] font-bold tracking-wide text-white/75 uppercase">
              Current lesson
            </p>
            <h2 className="mt-3 text-xl font-bold">{current.topic}</h2>
            <p className="mt-1 text-xs text-white/80">
              1/{entries.length} words completed
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
              <div className="h-full w-[12%] rounded-full bg-white" />
            </div>
            <Link
              href={`/learn/vocabulary/${current.slug}`}
              className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-[#4126c4]"
            >
              Continue Vocabulary →
            </Link>
          </section>
        ) : null}

        <VocabularyCatalog entries={entries} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleGauge;
  label: string;
  value: number;
}) {
  return (
    <div className="min-h-24 rounded-2xl border border-[#e5dfef] bg-white p-4">
      <p className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-[#655e70]">
        <Icon size={14} className="text-[#5135d5]" />
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-[#25202d]">{value}</p>
    </div>
  );
}
