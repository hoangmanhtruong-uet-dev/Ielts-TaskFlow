import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Flag,
  Lightbulb,
  ListChecks,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { startWritingAction } from "@/features/writing/actions";
import type { WritingPracticePageData } from "@/features/writing/server/content";

export function WritingStart({
  data,
  error,
}: {
  data: WritingPracticePageData;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-10 font-sans">
      <header className="mb-4 flex h-14 items-center px-3">
        <Link
          href="/practice/writing"
          aria-label="Back to Writing"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-500 shadow-sm transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Back to Library</span>
        </Link>
      </header>

      <section className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:flex-row">
        {/* Left Side: Title & Goal */}
        <div className="flex flex-col justify-center bg-gradient-to-br from-indigo-50 to-white p-8 md:w-1/2 md:p-12">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black tracking-widest text-indigo-700 uppercase">
              {data.task.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase">
              <Clock3 aria-hidden="true" size={12} />
              {Math.round(data.task.timeLimitSeconds / 60)} min
            </span>
          </div>

          <h1 className="mb-6 text-3xl font-black text-pretty text-slate-800 md:text-4xl">
            {data.task.title}
          </h1>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-indigo-700">
              <Flag aria-hidden="true" size={18} />
              <h2 className="text-sm font-bold tracking-wider uppercase">
                Goal / Prompt
              </h2>
            </div>
            <p className="text-sm leading-relaxed font-medium text-indigo-950">
              {data.task.promptText}
            </p>
          </div>
        </div>

        {/* Right Side: Action & Flow */}
        <div className="flex flex-col border-t border-slate-100 p-8 md:w-1/2 md:border-t-0 md:border-l md:p-12">
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-slate-800 uppercase">
              Practice Focus
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                [ListChecks, "Clear structure"],
                [Clock3, "Time expressions"],
                [BookOpen, "Useful vocabulary"],
                [PenLine, "Sentence order"],
              ].map(([Icon, label]) => {
                const ItemIcon = Icon as typeof ListChecks;
                return (
                  <span
                    key={label as string}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600"
                  >
                    <ItemIcon
                      aria-hidden="true"
                      size={14}
                      className="text-indigo-500"
                    />
                    {label as string}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-slate-800 uppercase">
              Lesson Flow
            </h2>
            <ol className="space-y-4">
              <FlowStep
                icon={Lightbulb}
                title="Pre-Writing Guidance"
                description="Review the prompt, vocabulary and structure."
                active
              />
              <FlowStep
                icon={PenLine}
                title="Writing Phase"
                description={`Write between ${data.task.minimumWords} and ${data.task.maximumWords} words.`}
              />
              <FlowStep
                icon={Sparkles}
                title="AI Feedback"
                description="Get instant Rubric Score and Inline Corrections."
              />
            </ol>
          </section>

          <div className="mt-auto">
            {error ? (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600"
              >
                This Writing task could not be started. Please try again.
              </p>
            ) : null}

            <form action={startWritingAction} className="w-full">
              <input type="hidden" name="taskSlug" value={data.task.slug} />
              <button
                type="submit"
                className="mb-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-md transition-all hover:scale-[1.02] hover:bg-indigo-700"
              >
                <PenLine size={20} /> Start Writing
              </button>
            </form>

            {data.latestSubmissionId ? (
              <Link
                href={`/practice/writing/${data.task.slug}/submission/${data.latestSubmissionId}`}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 bg-indigo-50 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                View Latest Feedback
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  title,
  description,
  active = false,
}: {
  icon: typeof PenLine;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-400"}`}
      >
        <Icon aria-hidden="true" size={14} />
      </span>
      <div>
        <p
          className={`text-sm font-bold ${active ? "text-slate-800" : "text-slate-500"}`}
        >
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </li>
  );
}
