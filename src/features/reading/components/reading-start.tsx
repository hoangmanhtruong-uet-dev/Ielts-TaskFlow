import {
  ArrowLeft,
  BookOpenText,
  Clock3,
  HelpCircle,
  Languages,
} from "lucide-react";
import Link from "next/link";

import { startReadingPracticeAction } from "@/features/reading/actions";
import type { ReadingPracticePageData } from "@/features/reading/server/content";

export function ReadingStart({
  data,
  error,
}: {
  data: ReadingPracticePageData;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-10 font-sans">
      <header className="mb-4 flex h-14 items-center px-3">
        <Link
          href="/practice/reading"
          aria-label="Back to Reading"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-500 shadow-sm transition-colors hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Back to Library</span>
        </Link>
      </header>

      <section className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:flex-row">
        {/* Left Side: Image & Title */}
        <div className="flex flex-col justify-center bg-gradient-to-br from-emerald-50 to-white p-8 md:w-1/2 md:p-12">
          <span className="mb-4 inline-block self-start rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-700 uppercase">
            {data.exercise.difficulty} · Reading
          </span>
          <h1 className="mb-4 text-3xl font-black text-pretty text-slate-800 md:text-4xl">
            {data.exercise.title}
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-slate-600">
            {data.exercise.summary}
          </p>

          <div className="mb-6 flex flex-wrap gap-3">
            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
              #Environment
            </span>
            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
              #Case Study
            </span>
          </div>
        </div>

        {/* Right Side: Action & Metadata */}
        <div className="flex flex-col border-t border-slate-100 p-8 md:w-1/2 md:border-t-0 md:border-l md:p-12">
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              [
                Clock3,
                `${Math.round(data.exercise.timeLimitSeconds / 60)} min`,
                "Time",
              ],
              [HelpCircle, `${data.questions.length}`, "Questions"],
              [BookOpenText, `${data.passage.sections.length}`, "Sections"],
            ].map(([Icon, value, label]) => {
              const ItemIcon = Icon as typeof Clock3;
              return (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"
                >
                  <ItemIcon
                    className="mx-auto mb-2 text-emerald-600"
                    size={20}
                  />
                  <p className="font-bold text-slate-800">{String(value)}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-500 uppercase">
                    {String(label)}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="mb-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Languages size={18} className="text-amber-600" /> Key Vocabulary
              Preview
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "sustainable",
                "infrastructure",
                "mitigation",
                "temperature",
                "+4 more",
              ].map((word) => (
                <span
                  key={word}
                  className="rounded-lg border border-amber-200/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-auto">
            {error ? (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600"
              >
                Could not start this reading. Please try again.
              </p>
            ) : null}
            <form action={startReadingPracticeAction} className="w-full">
              <input
                type="hidden"
                name="exerciseSlug"
                value={data.exercise.slug}
              />
              <button
                type="submit"
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-700"
              >
                <BookOpenText size={20} /> Start Reading Focus
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
