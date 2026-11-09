"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpenText,
  Flag,
  Moon,
  RotateCcw,
  Sun,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DynamicQuestionRenderer,
  GenericPracticeEngine,
} from "@/features/core-practice";
import { LessonMarkdown } from "@/features/learning/components/lesson-markdown";
import { VocabHighlightPopover } from "@/features/learning/components/vocab-highlight-popover";
import { submitMockTestSectionAction } from "@/features/mock-tests/actions";
import type { MockRunnerContext } from "@/features/mock-tests/model";
import {
  saveReadingAnswerAction,
  submitReadingPracticeAction,
} from "@/features/reading/actions";
import { formatReadingQuestionType } from "@/features/reading/model";
import type {
  ReadingPracticePageData,
  ReadingQuestion,
} from "@/features/reading/server/content";
import { cn } from "@/lib/utils";

type Draft = { answerText: string; selectedOptionIds: string[] };

function serializeDraft(draft?: Draft) {
  return JSON.stringify({
    answerText: draft?.answerText ?? "",
    selectedOptionIds: [...(draft?.selectedOptionIds ?? [])].sort(),
  });
}

export function ReadingRunner({
  data,
  mockContext,
}: {
  data: ReadingPracticePageData;
  mockContext?: MockRunnerContext;
}) {
  if (!data.attempt) return null;
  return <ActiveReadingRunner data={data} mockContext={mockContext} />;
}

function ActiveReadingRunner({
  data,
  mockContext,
}: {
  data: ReadingPracticePageData;
  mockContext?: MockRunnerContext;
}) {
  const attempt = data.attempt!;
  const [saveConflictMessage, setSaveConflictMessage] = useState<string | null>(
    null,
  );
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isSerifFont, setIsSerifFont] = useState(true);
  const [isDarkPassage, setIsDarkPassage] = useState(false);
  const [isDictionaryEnabled, setIsDictionaryEnabled] = useState(true);

  const initialAnswers = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      {
        answerText: question.answer?.text ?? "",
        selectedOptionIds: question.answer?.selectedOptionIds ?? [],
      },
    ]),
  );

  // Per-question authoritative revision and last-synced snapshot refs
  const revisionByQuestionRef = useRef<Record<string, number>>(
    Object.fromEntries(
      data.questions.map((q) => [q.id, q.answer?.clientRevision ?? 0]),
    ),
  );
  const lastSavedByQuestionRef = useRef<Record<string, string>>(
    Object.fromEntries(
      data.questions.map((q) => [
        q.id,
        serializeDraft({
          answerText: q.answer?.text ?? "",
          selectedOptionIds: q.answer?.selectedOptionIds ?? [],
        }),
      ]),
    ),
  );

  const handleSaveDraft = useCallback(
    async (answers: Record<string, unknown>) => {
      let allOk = true;
      let nextConflictMsg: string | null = null;

      for (const question of data.questions) {
        const draft = answers[question.id] as Draft | undefined;
        if (!draft) continue;

        const currentSerialized = serializeDraft(draft);
        if (currentSerialized === lastSavedByQuestionRef.current[question.id]) {
          continue;
        }

        const nextRevision =
          (revisionByQuestionRef.current[question.id] ?? 0) + 1;
        const result = await saveReadingAnswerAction({
          attemptId: attempt.id,
          questionId: question.id,
          exerciseSlug: data.exercise.slug,
          selectedOptionIds: draft.selectedOptionIds,
          answerText: draft.answerText,
          clientRevision: nextRevision,
        });

        if (result.status === "saved") {
          revisionByQuestionRef.current[question.id] = result.clientRevision;
          lastSavedByQuestionRef.current[question.id] = currentSerialized;
        } else {
          allOk = false;
          if (result.status === "conflict") {
            nextConflictMsg = result.message;
          }
        }
      }

      setSaveConflictMessage(nextConflictMsg);
      return allOk;
    },
    [attempt.id, data.exercise.slug, data.questions],
  );

  const handleSubmit = useCallback(async () => {
    if (mockContext) {
      const res = await submitMockTestSectionAction({
        mockTestSlug: mockContext.mockTestSlug,
        sessionId: mockContext.sessionId,
        sectionAttemptId: mockContext.sectionAttemptId,
        idempotencyKey: crypto.randomUUID(),
      });
      if (res && "status" in res && res.status === "error") {
        throw new Error(res.message);
      }
      return;
    }

    const res = await submitReadingPracticeAction({
      attemptId: attempt.id,
      exerciseSlug: data.exercise.slug,
    });
    if (res && "status" in res && res.status === "error") {
      throw new Error(res.message);
    }
  }, [attempt.id, data.exercise.slug, mockContext]);

  const renderSidePanel = () => (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl transition-colors",
        isDarkPassage
          ? "bg-slate-900 text-slate-100"
          : "bg-white text-slate-700",
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-between rounded-t-xl border-b px-4 py-2",
          isDarkPassage
            ? "border-slate-700 bg-slate-800"
            : "border-slate-200 bg-slate-50",
        )}
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsDictionaryEnabled((prev) => !prev)}
            aria-pressed={isDictionaryEnabled}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
              isDictionaryEnabled
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500 hover:text-slate-700",
            )}
            title="Bật/tắt từ điển khi bôi đen từ"
          >
            <BookOpenText size={14} />
            <span>Từ điển {isDictionaryEnabled ? "Bật" : "Tắt"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200/70 pl-4">
          <button
            type="button"
            onClick={() => setIsLargeFont((prev) => !prev)}
            aria-pressed={isLargeFont}
            className={cn(
              "rounded px-2 py-1 text-xs font-bold transition-colors",
              isLargeFont
                ? "bg-indigo-100 text-indigo-700"
                : isDarkPassage
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-500 hover:text-slate-800",
            )}
            title="Thay đổi cỡ chữ"
          >
            {isLargeFont ? "Aa+" : "Aa"}
          </button>
          <button
            type="button"
            onClick={() => setIsSerifFont((prev) => !prev)}
            aria-pressed={isSerifFont}
            className={cn(
              "rounded px-2 py-1 text-xs font-bold transition-colors",
              isSerifFont ? "font-serif" : "font-sans",
              isDarkPassage
                ? "text-slate-300 hover:text-white"
                : "text-slate-500 hover:text-slate-800",
            )}
            title="Chuyển kiểu chữ Serif / Sans"
          >
            {isSerifFont ? "Serif" : "Sans"}
          </button>
          <button
            type="button"
            onClick={() => setIsDarkPassage((prev) => !prev)}
            aria-pressed={isDarkPassage}
            className={cn(
              "rounded p-1.5 transition-colors",
              isDarkPassage
                ? "bg-amber-400/20 text-amber-300"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300",
            )}
            title="Chuyển nền sáng / tối"
          >
            {isDarkPassage ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      <article
        aria-labelledby="reading-passage-title"
        className="flex-1 scrollbar-thin scrollbar-thumb-slate-200 overflow-y-auto p-6 md:p-8"
      >
        <h2
          id="reading-passage-title"
          className={cn(
            "mb-2 text-2xl font-black text-pretty md:text-3xl",
            isDarkPassage ? "text-white" : "text-slate-800",
          )}
        >
          {data.passage.title}
        </h2>
        <p className="mb-8 text-sm font-bold tracking-wider text-slate-400 uppercase">
          {data.passage.sourceName}
        </p>

        <div className="relative space-y-8">
          {data.passage.sections.map((section, index) => {
            const paragraphLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
            return (
              <section key={section.id} className="group relative">
                <div className="mb-2 inline-flex h-6 items-center justify-center rounded-full bg-slate-100 px-2.5 text-xs font-bold text-slate-500 select-none">
                  [{paragraphLetters[index] || index + 1}]
                </div>

                {section.heading ? (
                  <h3
                    className={cn(
                      "mb-3 text-xl font-bold break-words",
                      isDarkPassage ? "text-slate-100" : "text-slate-800",
                    )}
                  >
                    {section.heading}
                  </h3>
                ) : null}

                <div
                  className={cn(
                    "text-justify leading-loose font-medium selection:bg-emerald-200 selection:text-emerald-900",
                    isLargeFont ? "text-[19px]" : "text-[17px]",
                    isSerifFont ? "font-serif" : "font-sans",
                    isDarkPassage ? "text-slate-200" : "text-slate-700",
                  )}
                >
                  <LessonMarkdown>{section.bodyMarkdown}</LessonMarkdown>
                </div>
              </section>
            );
          })}
        </div>
      </article>
    </div>
  );

  return (
    <>
      <VocabHighlightPopover enabled={isDictionaryEnabled} />
      <GenericPracticeEngine
        attemptId={attempt.id}
        title={data.exercise.title}
        domain="reading"
        categoryLabel="Reading Practice"
        serverNow={attempt.serverNow}
        expiresAt={attempt.expiresAt}
        autoSubmitOnMountExpired={Boolean(mockContext)}
        questions={data.questions}
        initialAnswers={initialAnswers}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        renderSidePanel={renderSidePanel}
        renderQuestionArea={({ currentQuestion, answers, setAnswer }) => {
          const question = currentQuestion as ReadingQuestion;
          const currentDraft = (answers[question.id] as Draft) || {
            answerText: "",
            selectedOptionIds: [],
          };
          const group = data.groups.find((g) => g.id === question.groupId);

          return (
            <div className="mx-auto max-w-2xl space-y-6">
              {saveConflictMessage ? (
                <div
                  role="alert"
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <AlertTriangle
                      size={14}
                      className="shrink-0 text-amber-600"
                    />
                    {saveConflictMessage}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RotateCcw
                      aria-hidden="true"
                      size={14}
                      className="mr-1.5"
                    />
                    Tải lại
                  </Button>
                </div>
              ) : null}

              {group ? (
                <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                  <div className="absolute top-0 right-0 p-4 text-emerald-900 opacity-10">
                    <Type size={100} />
                  </div>
                  <p className="relative z-10 mb-2 text-xs font-black tracking-widest text-emerald-600 uppercase">
                    {formatReadingQuestionType(group.type)}
                  </p>
                  <h2 className="relative z-10 mb-3 text-xl font-black break-words text-emerald-950">
                    {group.title}
                  </h2>
                  <div className="relative z-10 text-sm leading-relaxed font-medium text-emerald-800">
                    <LessonMarkdown>
                      {group.instructionsMarkdown}
                    </LessonMarkdown>
                  </div>
                </div>
              ) : null}

              <QuestionCard
                question={question}
                draft={currentDraft}
                maxAnswerWords={group?.maxAnswerWords ?? null}
                onChange={(next) => setAnswer(question.id, next)}
              />
            </div>
          );
        }}
      />
    </>
  );
}

function QuestionCard({
  question,
  draft,
  maxAnswerWords,
  onChange,
}: {
  question: ReadingQuestion;
  draft: Draft;
  maxAnswerWords: number | null;
  onChange: (draft: Draft) => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmitReport() {
    const trimmed = issueText.trim();
    if (trimmed.length < 5) {
      setReportFeedback({
        type: "error",
        message: "Vui lòng mô tả lỗi ít nhất 5 ký tự.",
      });
      return;
    }

    setReportSubmitting(true);
    setReportFeedback(null);
    try {
      const { reportIssueToTelegramAction } =
        await import("@/lib/telegram/actions");
      const res = await reportIssueToTelegramAction(
        trimmed,
        `Reading Q${question.position} (${question.id})`,
      );
      setReportFeedback({
        type: res.success ? "success" : "error",
        message: res.message,
      });
      if (res.success) {
        setIssueText("");
      }
    } catch {
      setReportFeedback({
        type: "error",
        message: "Không thể gửi báo lỗi lúc này.",
      });
    } finally {
      setReportSubmitting(false);
    }
  }

  return (
    <fieldset
      id={`reading-question-${question.id}`}
      className="group relative min-w-0 scroll-mt-32 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <legend className="rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-wider text-emerald-700 uppercase">
          Q{question.position}
        </legend>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={reportOpen}
            onClick={() => {
              setReportOpen((prev) => !prev);
              setReportFeedback(null);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-rose-100 bg-white px-2 py-1 text-[10px] font-bold text-rose-500 transition-colors group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:opacity-100",
              reportOpen ? "opacity-100" : "opacity-0",
            )}
            title="Báo lỗi câu hỏi này"
          >
            <Flag size={12} /> Báo lỗi
          </button>
        </div>
      </div>

      {reportOpen ? (
        <div
          role="region"
          aria-label={`Báo lỗi câu Q${question.position}`}
          className="mb-5 space-y-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-4"
        >
          <label
            htmlFor={`reading-report-${question.id}`}
            className="block text-xs font-bold text-rose-900"
          >
            Mô tả lỗi (sai đáp án, lỗi đánh máy…)
          </label>
          <textarea
            id={`reading-report-${question.id}`}
            rows={2}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            maxLength={1500}
            placeholder="Ví dụ: Câu Q2 đáp án tham chiếu sai đoạn văn..."
            className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          {reportFeedback ? (
            <p
              role="status"
              aria-live="polite"
              className={cn(
                "text-xs font-semibold",
                reportFeedback.type === "success"
                  ? "text-emerald-700"
                  : "text-rose-700",
              )}
            >
              {reportFeedback.message}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={reportSubmitting}
              onClick={() => void handleSubmitReport()}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {reportSubmitting ? "Đang gửi..." : "Gửi báo lỗi"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-6 text-lg leading-relaxed font-semibold break-words text-slate-800">
        <LessonMarkdown>{question.promptMarkdown}</LessonMarkdown>
      </div>

      <DynamicQuestionRenderer
        question={question}
        draft={draft}
        maxAnswerWords={maxAnswerWords}
        onChange={onChange}
      />
    </fieldset>
  );
}
