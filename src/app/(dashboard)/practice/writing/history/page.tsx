import {
  ArrowRight,
  CheckCircle2,
  FilePenLine,
  History,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getWritingHistoryDashboard } from "@/features/writing/server/content";

export const metadata: Metadata = { title: "Writing History" };

const formatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export default async function WritingHistoryPage() {
  const submissions = await getWritingHistoryDashboard(24);
  const scored = submissions.filter((submission) => submission.feedback);
  const averageScore = scored.length
    ? Math.round(
        scored.reduce(
          (total, submission) =>
            total + (submission.feedback!.overallBandEstimate / 9) * 100,
          0,
        ) / scored.length,
      )
    : null;
  const corrections = scored.reduce(
    (total, submission) =>
      total + submission.feedback!.correctedExamples.length,
    0,
  );
  const chartItems = [...scored].reverse().slice(-7);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl bg-[#fbf9ff] pb-24 text-[#211b2a] lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e5dfef]">
      <header className="flex min-h-14 items-center justify-between border-b border-[#e9e4f0] bg-white px-4 lg:rounded-t-3xl">
        <div className="flex items-center gap-2 text-[#3823bd]">
          <FilePenLine aria-hidden="true" size={17} />
          <span className="text-sm font-bold">Indigo Scholar</span>
        </div>
        <Link
          href="/practice/writing"
          className="flex min-h-10 items-center rounded-full px-3 text-xs font-bold text-[#4d32d4]"
        >
          Practice
        </Link>
      </header>

      <div className="space-y-5 px-4 py-5 sm:px-6">
        <section>
          <p className="text-[10px] font-bold text-[#746d7f] uppercase">
            Your progress
          </p>
          <h1 className="mt-2 text-2xl font-bold">Writing History</h1>
          <p className="mt-1 text-sm text-[#736c7e]">
            Review your writing and see how you improve.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <StatCard
            label="Tasks completed"
            value={String(submissions.length)}
            icon={<CheckCircle2 aria-hidden="true" size={17} />}
          />
          <StatCard
            label="Average score"
            value={averageScore === null ? "—" : String(averageScore)}
            suffix={averageScore === null ? "Not scored" : "/100"}
            icon={<TrendingUp aria-hidden="true" size={17} />}
          />
        </section>

        <section className="rounded-2xl border border-[#e3ddec] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">Writing Progress</h2>
              <p className="mt-1 text-xs text-[#736c7e]">
                {corrections} correction{corrections === 1 ? "" : "s"} found
              </p>
            </div>
            <span className="rounded-full bg-[#f1edff] px-2 py-1 text-[10px] font-bold text-[#4d32d4]">
              Last {chartItems.length || 0}
            </span>
          </div>
          {chartItems.length ? (
            <div
              className="mt-5 flex h-32 items-end gap-2"
              aria-label="Recent writing scores"
            >
              {chartItems.map((submission) => {
                const score = Math.round(
                  (submission.feedback!.overallBandEstimate / 9) * 100,
                );
                return (
                  <div
                    key={submission.id}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[10px] font-bold text-[#4d32d4]">
                      {score}
                    </span>
                    <span className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-[#f0edf5]">
                      <span
                        className="block w-full rounded-lg bg-gradient-to-t from-[#4d32d4] to-[#9478ef]"
                        style={{ height: `${Math.max(score, 8)}%` }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-[#f5f2f8] p-4 text-sm text-[#736c7e]">
              Scores will appear after AI feedback is completed.
            </p>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent Tasks</h2>
            <span className="text-xs text-[#736c7e]">
              {submissions.length} total
            </span>
          </div>
          {submissions.length ? (
            <div className="space-y-3">
              {submissions.map((submission) => {
                const score = submission.feedback
                  ? Math.round(
                      (submission.feedback.overallBandEstimate / 9) * 100,
                    )
                  : null;
                return (
                  <Link
                    key={submission.id}
                    href={`/practice/writing/${submission.taskSlug}/submission/${submission.id}`}
                    className="flex min-h-20 items-center gap-3 rounded-2xl border border-[#e3ddec] bg-white p-4 transition hover:border-[#8c72e4]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f1edff] text-[#4d32d4]">
                      <History aria-hidden="true" size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {submission.title}
                      </span>
                      <span className="mt-1 block text-xs text-[#736c7e]">
                        {formatter.format(new Date(submission.submittedAt))} ·{" "}
                        {submission.wordCount} words
                      </span>
                    </span>
                    <span className="text-right">
                      <strong className="block text-lg text-[#4d32d4]">
                        {score ?? "—"}
                      </strong>
                      <span className="text-[10px] text-[#736c7e]">
                        {score === null ? "Pending" : "Score"}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      size={16}
                      className="shrink-0 text-[#4d32d4]"
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9d1e5] bg-white p-8 text-center">
              <FilePenLine
                aria-hidden="true"
                className="mx-auto text-[#7652e8]"
              />
              <h2 className="mt-3 font-bold">No submitted writing yet</h2>
              <p className="mt-2 text-sm text-[#736c7e]">
                Complete your first task to start tracking progress.
              </p>
              <Link
                href="/practice/writing"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#3d22c8] px-5 text-sm font-bold text-white"
              >
                Start Writing
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-[#e3ddec] bg-white p-4">
      <div className="text-[#4d32d4]">{icon}</div>
      <p className="mt-4 text-[10px] font-bold text-[#736c7e] uppercase">
        {label}
      </p>
      <div className="mt-1 flex items-end gap-1">
        <strong className="text-2xl">{value}</strong>
        {suffix ? (
          <span className="pb-1 text-[10px] text-[#736c7e]">{suffix}</span>
        ) : null}
      </div>
    </article>
  );
}
