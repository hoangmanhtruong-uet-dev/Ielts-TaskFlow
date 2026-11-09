import { CheckCircle2, Clock3, RotateCcw, Target, XCircle } from "lucide-react";
import Link from "next/link";

import { LessonMarkdown } from "@/features/learning/components/lesson-markdown";
import { Button } from "@/components/ui/button";
import { calculateScorePercent } from "@/features/practice/model";
import type { getPracticeResult } from "@/features/practice/server/content";

type ResultData = NonNullable<Awaited<ReturnType<typeof getPracticeResult>>>;

export function PracticeResultView({
  data,
  view = "review",
}: {
  data: ResultData;
  view?: "summary" | "review";
}) {
  const { result, exercise, options } = data;
  const optionById = new Map(
    options.map((option) => [option.id, option.label]),
  );
  const percent = calculateScorePercent(result.score, result.maxScore);
  const missed = result.questions.filter((question) => !question.isCorrect);

  if (view === "summary") {
    return (
      <div className="mx-auto min-h-[calc(100dvh-5rem)] max-w-3xl bg-[#fbf9ff] pb-24 lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e4deef] lg:p-8">
        <header className="border-b border-[#e7e1ef] bg-white px-4 py-4 text-lg font-bold lg:rounded-t-2xl">
          Lesson Complete
        </header>
        <div className="space-y-6 px-4 py-6 sm:px-6">
          <div className="grid place-items-center text-center">
            <div
              className="grid size-32 place-items-center rounded-full bg-[conic-gradient(#4d32d4_var(--score),#e8e2f0_0)] p-3"
              style={{ "--score": `${percent}%` } as React.CSSProperties}
            >
              <div className="grid size-full place-items-center rounded-full bg-[#fbf9ff]">
                <div>
                  <p className="text-3xl font-bold text-[#4027c2]">
                    {percent}%
                  </p>
                  <p className="text-xs text-[#716a7c]">
                    Score: {result.score}/{result.maxScore}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#e2dced] bg-white p-4 text-center">
              <Clock3 className="mx-auto text-[#4d31d2]" size={19} />
              <p className="mt-2 text-xl font-bold">
                {result.score}/{result.maxScore}
              </p>
              <p className="text-[10px] text-[#716a7c] uppercase">Score</p>
            </div>
            <div className="rounded-2xl border border-[#e2dced] bg-white p-4 text-center">
              <Target className="mx-auto text-[#4d31d2]" size={19} />
              <p className="mt-2 text-xl font-bold">{percent}%</p>
              <p className="text-[10px] text-[#716a7c] uppercase">Accuracy</p>
            </div>
          </div>

          <section>
            <h2 className="text-base font-bold">Lesson Summary</h2>
            <p className="mt-2 text-sm text-[#716a7c]">{exercise.summary}</p>
          </section>

          {missed.length ? (
            <Link
              href={`/practice/${exercise.slug}/result/${result.attemptId}?view=review`}
              className="flex min-h-12 items-center justify-center rounded-xl bg-[#4c31d4] px-4 font-bold text-white"
            >
              Review {missed.length} mistakes
            </Link>
          ) : (
            <div className="rounded-2xl bg-[#ddf8ec] p-5 text-center text-[#08764d]">
              <CheckCircle2 className="mx-auto" size={30} />
              <p className="mt-2 text-lg font-bold">Great progress!</p>
              <p className="mt-1 text-sm">Nothing to review in this lesson.</p>
            </div>
          )}
          <Link
            href={`/practice/${exercise.slug}`}
            className="flex min-h-12 items-center justify-center rounded-xl border border-[#dcd5e7] bg-white font-bold text-[#4329c7]"
          >
            Practice Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl space-y-8 bg-[#fbf9ff] px-4 py-6 pb-24 sm:px-6 lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e4deef] lg:p-8">
      <header className="rounded-2xl border border-[#e2dced] bg-white p-5">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Kết quả đã lưu
        </p>
        <h1 className="mt-2 text-3xl font-bold text-pretty">
          {exercise.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <p className="text-4xl font-bold tabular-nums">
            {result.score}/{result.maxScore}
          </p>
          <p className="text-lg font-semibold text-[var(--muted-foreground)]">
            {percent}%
          </p>
        </div>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Điểm được tính trong PostgreSQL từ exercise version đã snapshot.
          Client không gửi score.
        </p>
      </header>

      <section aria-labelledby="review-title">
        <h2 id="review-title" className="text-2xl font-bold">
          Review từng câu
        </h2>
        <ol className="mt-5 space-y-5">
          {result.questions.map((question) => {
            const selectedLabels = question.selectedOptionIds
              .map((id) => optionById.get(id))
              .filter((label): label is string => Boolean(label));
            const correctLabels = (question.correctOptionIds ?? [])
              .map((id) => optionById.get(id))
              .filter((label): label is string => Boolean(label));
            return (
              <li
                key={question.questionId}
                className={`rounded-2xl border bg-white p-5 sm:p-6 ${question.isCorrect ? "border-[#bfe9d7]" : "border-[#f0c5c1]"}`}
              >
                <div className="flex items-start gap-3">
                  {question.isCorrect ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[var(--success)]"
                      size={21}
                    />
                  ) : (
                    <XCircle
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[var(--destructive)]"
                      size={21}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      <span className="mr-2">
                        {question.isCorrect ? "Đúng" : "Sai"}
                      </span>
                      · Câu {question.position} · {question.awardedPoints}/
                      {question.points} điểm
                    </p>
                    <div className="mt-3 font-semibold">
                      <LessonMarkdown>{question.promptMarkdown}</LessonMarkdown>
                    </div>
                    <dl className="mt-5 grid gap-4 text-sm">
                      <div>
                        <dt className="font-bold">Câu trả lời của bạn</dt>
                        <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
                          {question.answerText ||
                            selectedLabels.join("; ") ||
                            "Không trả lời"}
                        </dd>
                      </div>
                      {result.reviewAllowed ? (
                        <>
                          <div>
                            <dt className="font-bold">Đáp án</dt>
                            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
                              {(question.acceptedTextAnswers ?? []).join(
                                "; ",
                              ) || correctLabels.join("; ")}
                            </dd>
                          </div>
                          {question.explanationMarkdown ? (
                            <div>
                              <dt className="font-bold">Giải thích</dt>
                              <dd className="mt-2">
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
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={`/practice/${exercise.slug}`}>
            <RotateCcw aria-hidden="true" size={17} /> Làm attempt mới
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/progress">Xem lịch sử học tập</Link>
        </Button>
      </div>
    </div>
  );
}
