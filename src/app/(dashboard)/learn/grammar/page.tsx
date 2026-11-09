import { Bell, BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GrammarCatalog } from "@/features/learning/components/grammar-catalog";
import { getGrammarCatalog } from "@/features/learning/server/foundations";
import { getRecentAttemptHistory } from "@/features/practice/server/content";

export const metadata: Metadata = {
  title: "Grammar",
  description: "Học ngữ pháp tiếng Anh từng bước.",
};

export default async function GrammarPage() {
  const [topics, history] = await Promise.all([
    getGrammarCatalog(),
    getRecentAttemptHistory(100),
  ]);
  const grammarAttempts = history.filter((item) => item.domain === "grammar");
  const totalScore = grammarAttempts.reduce((sum, item) => sum + item.score, 0);
  const totalMax = grammarAttempts.reduce(
    (sum, item) => sum + item.maxScore,
    0,
  );
  const progress = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  const current = topics[0];
  const needsReview = grammarAttempts.find(
    (item) => item.score < item.maxScore,
  );
  const recentlyCompleted = grammarAttempts.find(
    (item) => item.score === item.maxScore,
  );

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
          <h1 className="text-2xl font-bold tracking-tight">Grammar</h1>
          <p className="mt-1 text-sm text-[#746e80]">
            Understand English step by step.
          </p>
        </div>

        {current ? (
          <section className="rounded-2xl border border-[#e2dcef] bg-white p-4 shadow-[0_8px_25px_rgba(63,38,174,.06)]">
            <div className="flex gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eee8ff] text-[#4c31d4]">
                <BookOpenText size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#eee8ff] px-2 py-1 text-[10px] font-bold text-[#4c31d4]">
                    A1 Beginner
                  </span>
                  <h2 className="font-bold">Grammar Foundations</h2>
                </div>
                <div className="mt-4 flex justify-between text-xs text-[#746d80]">
                  <span>{grammarAttempts.length} lessons completed</span>
                  <span className="font-bold text-[#4d31d4]">{progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeaf4]">
                  <div
                    className="h-full rounded-full bg-[#7b56ee]"
                    style={{ width: `${Math.max(4, progress)}%` }}
                  />
                </div>
              </div>
            </div>
            <Link
              href={`/learn/grammar/${current.slug}`}
              className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-[#4c32d5] px-4 text-sm font-bold text-white"
            >
              Continue Grammar →
            </Link>
          </section>
        ) : null}

        {needsReview ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Needs Review</h2>
              <Link
                href="/error-notebook"
                className="text-xs font-bold text-[#4c31d4]"
              >
                View all
              </Link>
            </div>
            <div className="rounded-2xl border border-[#e2dced] bg-white p-4">
              <div className="flex justify-between">
                <span className="rounded bg-[#ffe1dd] px-2 py-1 text-[10px] font-bold text-[#b12f29]">
                  Action Required
                </span>
                <span className="text-[#d33c35]">!</span>
              </div>
              <h3 className="mt-3 font-bold">{needsReview.title}</h3>
              <p className="mt-1 text-xs text-[#756e80]">
                {needsReview.maxScore - needsReview.score} points to review from
                your last session.
              </p>
              <Link
                href={`/practice/${needsReview.exerciseSlug}/result/${needsReview.id}?view=review`}
                className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-[#4c31d4] text-sm font-bold text-white"
              >
                Review
              </Link>
            </div>
          </section>
        ) : null}

        {recentlyCompleted ? (
          <section>
            <h2 className="mb-3 text-base font-bold">Recently Completed</h2>
            <div className="rounded-2xl border border-[#e2dced] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#dff8ed] px-2 py-1 text-[10px] font-bold text-[#08764d]">
                  Completed
                </span>
                <span className="text-[#16a36f]">✓</span>
              </div>
              <h3 className="mt-3 font-bold">{recentlyCompleted.title}</h3>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8e2ef]">
                <div className="h-full w-full rounded-full bg-[#3bd39a]" />
              </div>
              <p className="mt-3 text-xs text-[#716a7c]">
                Score{" "}
                <span className="float-right font-bold text-[#4c31d4]">A+</span>
              </p>
            </div>
          </section>
        ) : null}

        <GrammarCatalog topics={topics} />
      </div>
    </div>
  );
}
