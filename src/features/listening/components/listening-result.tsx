import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
  ArrowRight,
  BarChart,
} from "lucide-react";
import Link from "next/link";

import { LessonMarkdown } from "@/features/learning/components/lesson-markdown";
import { calculateScorePercent } from "@/features/practice/model";
import type { getListeningPracticeResult } from "@/features/listening/server/content";

type ResultData = NonNullable<
  Awaited<ReturnType<typeof getListeningPracticeResult>>
>;

export function ListeningResult({ data }: { data: ResultData }) {
  const { result, exercise, options } = data;
  const optionById = new Map(
    options.map((option) => [option.id, option.label]),
  );
  const percent = calculateScorePercent(result.score, result.maxScore);
  const elapsedSeconds = Math.max(
    0,
    Math.round(
      (Date.parse(result.submittedAt) - Date.parse(result.startedAt)) / 1000,
    ),
  );

  const isPerfect = percent === 100;
  const isGood = percent >= 70;

  return (
    <div className="mx-auto min-h-[100dvh] bg-zinc-50 pb-24 font-sans selection:bg-indigo-500/30">
      {/* Header Result summary */}
      <div className="relative mb-12 overflow-hidden bg-zinc-950 px-4 py-16 text-white shadow-2xl md:py-20">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-full opacity-30">
          <div
            className={`absolute -top-1/2 -right-1/4 h-[600px] w-[600px] rounded-full blur-[100px] ${isPerfect ? "bg-emerald-500" : isGood ? "bg-indigo-500" : "bg-rose-500"}`}
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
              <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
                Practice Result
              </span>
            </div>
            <h1 className="mt-2 mb-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {exercise.title}
            </h1>
            <p className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 backdrop-blur-sm">
              <Clock3 size={16} className="text-indigo-400" />
              Time elapsed: {Math.floor(elapsedSeconds / 60)}m{" "}
              {elapsedSeconds % 60}s<span className="mx-2 opacity-50">|</span>
              {result.submittedAfterTimeLimit ? (
                <span className="text-rose-400">Late submission</span>
              ) : (
                <span className="text-emerald-400">Within time limit</span>
              )}
            </p>
          </div>

          <div className="min-w-[200px] rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
            <p className="mb-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Final Score
            </p>
            <div className="mb-1 flex items-baseline justify-center gap-2">
              <span
                className={`text-6xl font-semibold tracking-tighter ${isPerfect ? "text-emerald-400" : isGood ? "text-indigo-400" : "text-rose-400"}`}
              >
                {result.score}
              </span>
              <span className="text-2xl font-medium text-zinc-500">
                / {result.maxScore}
              </span>
            </div>
            <p className="text-lg font-semibold text-zinc-300">
              {percent}% Accuracy
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-12 px-4">
        <section aria-labelledby="listening-review-title">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <BarChart size={20} />
            </div>
            <h2
              id="listening-review-title"
              className="text-2xl font-semibold tracking-tight text-zinc-900"
            >
              Detailed Review
            </h2>
          </div>

          <ol className="space-y-6">
            {result.questions.map((question) => {
              const selected = question.selectedOptionIds
                .map((id) => optionById.get(id))
                .filter((label): label is string => Boolean(label));
              const correct = (question.correctOptionIds ?? [])
                .map((id) => optionById.get(id))
                .filter((label): label is string => Boolean(label));
              return (
                <li
                  key={question.questionId}
                  className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 transition-shadow hover:shadow-lg sm:p-8 ${question.isCorrect ? "border-emerald-200/50 shadow-emerald-500/5" : "border-rose-200/50 shadow-rose-500/5"}`}
                >
                  <div
                    className={`absolute top-0 left-0 h-full w-2 ${question.isCorrect ? "bg-emerald-400" : "bg-rose-400"}`}
                  ></div>

                  <div className="mb-6 flex items-start justify-between pl-4">
                    <span className="inline-block rounded-lg bg-zinc-100 px-3 py-1 text-xs font-bold tracking-widest text-zinc-600 uppercase">
                      Question {question.position}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold tracking-widest uppercase ${question.isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      {question.isCorrect ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {question.awardedPoints} / {question.points} pts
                    </span>
                  </div>

                  <div className="pl-4">
                    <div className="mb-8 max-w-[65ch] text-lg leading-relaxed font-medium text-zinc-900">
                      <LessonMarkdown>{question.promptMarkdown}</LessonMarkdown>
                    </div>

                    <dl className="grid gap-8 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                        <dt className="mb-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                          Your Answer
                        </dt>
                        <dd
                          className={`leading-relaxed font-medium ${question.isCorrect ? "text-emerald-700" : "text-rose-700"}`}
                        >
                          {question.answerText || selected.join("; ") || (
                            <span className="text-zinc-400 italic">
                              No answer provided
                            </span>
                          )}
                        </dd>
                      </div>

                      {result.reviewAllowed ? (
                        <>
                          <div className="rounded-2xl border border-indigo-100/50 bg-indigo-50/50 p-5">
                            <dt className="mb-2 text-xs font-bold tracking-widest text-indigo-400 uppercase">
                              Correct Answer
                            </dt>
                            <dd className="leading-relaxed font-semibold text-indigo-950">
                              {(question.acceptedTextAnswers ?? []).join(
                                "; ",
                              ) || correct.join("; ")}
                            </dd>
                          </div>

                          {question.explanationMarkdown ? (
                            <div className="mt-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 sm:col-span-2">
                              <dt className="mb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                                Explanation
                              </dt>
                              <dd className="leading-relaxed font-medium text-zinc-600">
                                <LessonMarkdown>
                                  {question.explanationMarkdown}
                                </LessonMarkdown>
                              </dd>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </dl>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {result.reviewAllowed ? (
          <section
            aria-labelledby="listening-transcript-title"
            className="rounded-[2rem] border border-zinc-200/80 bg-white p-8 shadow-sm sm:p-10"
          >
            <h2
              id="listening-transcript-title"
              className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900"
            >
              Full Transcript
            </h2>
            <div className="prose prose-zinc prose-p:leading-relaxed prose-p:text-zinc-600 max-w-none">
              <LessonMarkdown>{result.transcriptMarkdown}</LessonMarkdown>
            </div>
          </section>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-4 border-t border-zinc-200 pt-8 sm:flex-row">
          <Link
            href={`/practice/listening/${exercise.slug}`}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-8 font-semibold text-zinc-900 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto"
          >
            <RotateCcw
              size={18}
              className="text-zinc-400 transition-transform duration-500 group-hover:-rotate-180"
            />
            Try Again
          </Link>
          <Link
            href="/practice/listening"
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-8 font-semibold text-white shadow-xl shadow-zinc-900/10 transition-all hover:bg-zinc-800 sm:w-auto"
          >
            Back to Dashboard{" "}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
