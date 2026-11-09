import {
  ArrowRight,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import type {
  WritingCatalogItem,
  WritingSubmissionReviewData,
} from "@/features/writing/server/content";

export function WritingComplete({
  data,
  nextTask,
}: {
  data: WritingSubmissionReviewData;
  nextTask: WritingCatalogItem | null;
}) {
  const feedback = data.feedback;
  const score = feedback
    ? Math.round((feedback.overallBandEstimate / 9) * 100)
    : null;
  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl bg-[#fbf9ff] pb-24 text-[#211b2a] lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e5dfef]">
      <div className="space-y-5 px-4 py-7 sm:px-6">
        <section className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f1edff] text-[#4d32d4]">
            <CheckCircle2 aria-hidden="true" size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Writing Practice Complete</h1>
          <p className="mt-1 text-sm text-[#736c7e]">Task: {data.task.title}</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Metric
            label="Learning score"
            value={score === null ? "—" : String(score)}
          />
          <Metric label="Words" value={String(data.submission.wordCount)} />
          <Metric
            label="Attempts"
            value={String(data.feedbackRun?.attemptNumber ?? 1)}
          />
          <Metric
            label="Corrections reviewed"
            value={String(feedback?.correctedExamples.length ?? 0)}
          />
        </section>

        <section className="rounded-2xl border border-[#e3ddec] bg-white p-4">
          <h2 className="font-bold">Today You Practiced</h2>
          <ul className="mt-3 divide-y divide-[#ece7f1]">
            {(feedback?.revisionPlan.length
              ? feedback.revisionPlan
              : ["Completed and submitted your writing task"]
            )
              .slice(0, 4)
              .map((item) => (
                <li key={item} className="flex gap-3 py-3 text-sm leading-6">
                  <CheckCircle2
                    aria-hidden="true"
                    size={16}
                    className="mt-1 shrink-0 text-[#4d32d4]"
                  />
                  {item}
                </li>
              ))}
          </ul>
        </section>

        {nextTask ? (
          <section className="rounded-2xl border border-[#e3ddec] bg-white p-4">
            <div className="flex items-center gap-2 text-[#4d32d4]">
              <Sparkles aria-hidden="true" size={17} />
              <p className="text-[10px] font-bold uppercase">
                Recommended next step
              </p>
            </div>
            <h2 className="mt-3 text-lg font-bold">{nextTask.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#736c7e]">
              {nextTask.description}
            </p>
            <Link
              href={`/practice/writing/${nextTask.slug}`}
              className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3d22c8] px-4 text-sm font-bold text-white"
            >
              Start next task <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/practice/writing/${data.task.slug}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d0e5] bg-white px-3 text-sm font-bold text-[#4d32d4]"
          >
            <RotateCcw aria-hidden="true" size={16} />
            Write again
          </Link>
          <Link
            href="/practice/writing/history"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3d22c8] px-3 text-sm font-bold text-white"
          >
            <FileText aria-hidden="true" size={16} />
            View history
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-[#e3ddec] bg-white p-4 text-center">
      <strong className="text-2xl text-[#4d32d4]">{value}</strong>
      <p className="mt-1 text-[10px] font-bold text-[#736c7e] uppercase">
        {label}
      </p>
    </article>
  );
}
