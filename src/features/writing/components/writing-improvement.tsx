import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import type { WritingImprovementReviewData } from "@/features/writing/server/content";

const criteria = [
  ["taskResponse", "Clarity"],
  ["coherenceCohesion", "Structure"],
  ["lexicalResource", "Vocabulary"],
  ["grammaticalRangeAccuracy", "Grammar"],
] as const;

export function WritingImprovement({
  data,
}: {
  data: WritingImprovementReviewData;
}) {
  const feedback = data.current.feedback;
  if (!feedback) {
    return (
      <MessageCard
        title="Feedback is not ready yet"
        body="Complete AI feedback first so your writing attempts can be compared."
        href={`/practice/writing/${data.current.task.slug}/submission/${data.current.submission.id}`}
        action="Open feedback"
      />
    );
  }

  const score = feedback.overallBandEstimate;
  const previousScore = data.previous
    ? data.previous.feedback.overallBandEstimate
    : null;
  const improvements = data.previous
    ? criteria.flatMap(([key, label]) => {
        const delta =
          feedback.criteria[key].band -
          data.previous!.feedback.criteria[key].band;
        return delta > 0
          ? [
              `${label} improved by ${delta.toFixed(1)} band${delta === 1 ? "" : "s"}.`,
            ]
          : [];
      })
    : feedback.strengths;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl bg-[#fbf9ff] pb-24 text-[#211b2a] lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e5dfef]">
      <header className="flex min-h-14 items-center gap-3 border-b border-[#e9e4f0] bg-white px-4 lg:rounded-t-3xl">
        <Link
          href={`/practice/writing/${data.current.task.slug}/submission/${data.current.submission.id}`}
          aria-label="Back to feedback"
          className="grid size-10 place-items-center rounded-full text-[#4d32d4]"
        >
          <ArrowLeft aria-hidden="true" size={18} />
        </Link>
        <p className="text-sm font-bold text-[#3823bd]">Your Progress</p>
      </header>

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <section className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f1edff] text-[#4d32d4]">
            <TrendingUp aria-hidden="true" size={23} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">You Improved!</h1>
          <p className="mt-2 text-sm text-[#736c7e]">
            Review your previous work and see how your writing progressed.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <AttemptCard
            label="First attempt"
            score={previousScore}
            corrections={
              data.previous?.feedback.correctedExamples.length ?? null
            }
          />
          <AttemptCard
            label="Latest attempt"
            score={score}
            corrections={feedback.correctedExamples.length}
            current
          />
        </section>

        <section className="rounded-2xl border border-[#cfeadc] bg-[#f3fff9] p-4">
          <div className="flex items-center gap-2 text-[#08754d]">
            <CheckCircle2 aria-hidden="true" size={17} />
            <h2 className="font-bold">What Improved</h2>
          </div>
          <ul className="mt-3 space-y-3">
            {(improvements.length
              ? improvements
              : ["Your latest attempt is complete and ready to review."]
            )
              .slice(0, 4)
              .map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-6 text-[#365d4e]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[#19a670]"
                  />
                  {item}
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e3ddec] bg-white p-4">
          <div className="flex items-center gap-2 text-[#4d32d4]">
            <Lightbulb aria-hidden="true" size={17} />
            <h2 className="font-bold">Still Practicing</h2>
          </div>
          <p className="mt-3 text-sm font-bold">
            {feedback.priorityIssues[0]?.issue ?? "Keep revising your ideas"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#736c7e]">
            {feedback.priorityIssues[0]?.evidence ?? feedback.revisionPlan[0]}
          </p>
        </section>

        <section className="rounded-2xl border border-[#e3ddec] bg-white p-4">
          <div className="flex items-center gap-2 text-[#4d32d4]">
            <Clock3 aria-hidden="true" size={17} />
            <h2 className="font-bold">Timeline</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#736c7e]">
            <span className="rounded-full bg-[#eee9fb] px-3 py-2">Draft</span>
            <span className="h-px flex-1 bg-[#cfc5e3]" />
            <span className="rounded-full bg-[#eee9fb] px-3 py-2">Review</span>
            <span className="h-px flex-1 bg-[#4d32d4]" />
            <span className="rounded-full bg-[#4d32d4] px-3 py-2 text-white">
              Improved
            </span>
          </div>
        </section>

        <Link
          href={`/practice/writing/${data.current.task.slug}/submission/${data.current.submission.id}/complete`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3d22c8] px-4 text-sm font-bold text-white"
        >
          Finish Practice <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </div>
  );
}

function AttemptCard({
  label,
  score,
  corrections,
  current = false,
}: {
  label: string;
  score: number | null;
  corrections: number | null;
  current?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${current ? "border-[#7652e8] bg-[#f7f4ff]" : "border-[#e3ddec] bg-white"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#736c7e] uppercase">{label}</p>
        {current ? (
          <span className="rounded-full bg-[#dff8ed] px-2 py-1 text-[9px] font-bold text-[#08754d]">
            Latest
          </span>
        ) : null}
      </div>
      <strong className="mt-4 block text-3xl text-[#4d32d4]">
        {score === null ? "—" : score.toFixed(1)}
        <span className="text-xs text-[#736c7e]"> / 9.0</span>
      </strong>
      <p className="mt-3 text-xs text-[#736c7e]">
        {corrections === null
          ? "No earlier scored attempt"
          : `${corrections} corrections found`}
      </p>
    </article>
  );
}

function MessageCard({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#e3ddec] bg-white p-8 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-[#736c7e]">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#3d22c8] px-5 text-sm font-bold text-white"
      >
        {action}
      </Link>
    </div>
  );
}
