import {
  ArrowLeft,
  BookOpenText,
  Clock3,
  Headphones,
  MessageCircleQuestion,
  RotateCcw,
  AudioLines,
} from "lucide-react";
import Link from "next/link";

import { startListeningPracticeAction } from "@/features/listening/actions";
import type { ListeningPracticePageData } from "@/features/listening/server/content";

export function ListeningStart({
  data,
  error,
}: {
  data: ListeningPracticePageData;
  error?: string;
}) {
  const steps = [
    [BookOpenText, "Key Vocabulary", "Review essential words before starting."],
    [
      Headphones,
      "Focus & Listen",
      "Full audio playback with precise controls.",
    ],
    [
      MessageCircleQuestion,
      "Test Comprehension",
      `Answer ${data.questions.length} questions based on the dialogue.`,
    ],
    [
      RotateCcw,
      "Review & Retain",
      "Follow the transcript to catch what you missed.",
    ],
  ] as const;
  return (
    <div className="mx-auto max-w-5xl space-y-8 pt-8 font-sans selection:bg-indigo-500/30 md:pt-12">
      <header className="flex items-center px-4 md:px-0">
        <Link
          href="/practice/listening"
          aria-label="Back to Listening"
          className="group flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-zinc-200">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm font-semibold tracking-wide">Dashboard</span>
        </Link>
      </header>

      <section className="relative flex min-h-[500px] flex-col overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/50 md:flex-row">
        {/* Left Side: Image & Title */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white md:w-5/12 md:p-12 lg:p-16">
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-20">
            <div className="absolute -top-1/2 -left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500 blur-[100px]" />
          </div>

          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/5 px-3 py-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
                {data.exercise.difficulty}
              </span>
            </div>
            <h1 className="mb-6 text-4xl leading-[1.1] font-semibold tracking-tight text-white md:text-5xl">
              {data.exercise.title}
            </h1>
            <p className="max-w-[30ch] text-base leading-relaxed text-zinc-400">
              {data.exercise.summary}
            </p>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-6 text-sm font-medium text-zinc-300">
            <span className="flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-400" />
              {Math.round(data.exercise.timeLimitSeconds / 60)} min
            </span>
            <span className="flex items-center gap-2">
              <AudioLines size={18} className="text-indigo-400" />
              {data.questions.length} Questions
            </span>
          </div>
        </div>

        {/* Right Side: Action & Steps */}
        <div className="flex flex-col justify-center bg-zinc-50/50 p-10 md:w-7/12 md:p-12 lg:p-16">
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-zinc-900">
            Lesson Roadmap
          </h2>
          <ol className="mb-10 grid gap-4 sm:grid-cols-2">
            {steps.map(([Icon, title, description]) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold tracking-tight text-zinc-900">
                    {title}
                  </p>
                  <p className="text-xs leading-relaxed font-medium text-zinc-500">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {error ? (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              <div className="mt-0.5">
                <MessageCircleQuestion size={16} />
              </div>
              <p>
                Could not start this lesson. Please try again or check your
                connection.
              </p>
            </div>
          ) : null}

          <form
            action={startListeningPracticeAction}
            className="mt-auto w-full"
          >
            <input
              type="hidden"
              name="exerciseSlug"
              value={data.exercise.slug}
            />
            <button
              type="submit"
              className="group flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 text-lg font-semibold tracking-wide text-white shadow-xl shadow-zinc-900/10 transition-all hover:bg-zinc-800 active:scale-[0.98]"
            >
              <Headphones
                size={22}
                className="transition-transform group-hover:scale-110"
              />
              Enter Practice Room
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
