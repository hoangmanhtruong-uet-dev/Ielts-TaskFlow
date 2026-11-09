"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save,
  WifiOff,
} from "lucide-react";

import { ServerTimer } from "./server-timer";
import { SubmitConfirmModal } from "./submit-confirm-modal";
import { QuestionNavigator } from "./question-navigator";
import { useAutosaveDraft } from "../hooks/use-autosave-draft";
import { submitExerciseAction } from "../api/submit-attempt-action";

export interface QuestionDefinition {
  id: string;
  order_index?: number;
  question_type?: string;
}

export type AnswerValue = string | string[] | Record<string, unknown>;

export interface GenericPracticeEngineProps {
  attemptId?: string;
  serverExpiresAt?: string | null;
  serverNow?: string;
  expiresAt?: string | null;
  autoSubmitOnMountExpired?: boolean;
  enableAutosave?: boolean;
  title?: string;
  domain?: string;
  categoryLabel?: string;
  isSubmitting?: boolean;
  onSaveDraft?: (answers: Record<string, AnswerValue>) => Promise<boolean>;
  onSubmit?: (answers: Record<string, AnswerValue>) => Promise<void>;
  renderTopHeaderExtra?: () => React.ReactNode;
  renderQuestionArea?: (props: {
    currentQuestion: QuestionDefinition;
    answers: Record<string, AnswerValue>;
    setAnswer: (questionId: string, value: AnswerValue) => void;
  }) => React.ReactNode;
  renderSidePanel?: () => React.ReactNode;
  questions: QuestionDefinition[];
  initialAnswers?: Record<string, AnswerValue>;
  children?: (props: {
    currentQuestion: QuestionDefinition;
    answers: Record<string, AnswerValue>;
    setAnswer: (questionId: string, value: AnswerValue) => void;
  }) => React.ReactNode;
  contextContent?: React.ReactNode;
}

export function GenericPracticeEngine({
  attemptId = "",
  serverExpiresAt = null,
  serverNow,
  expiresAt,
  autoSubmitOnMountExpired = false,
  enableAutosave,
  domain,
  isSubmitting: externalIsSubmitting,
  onSaveDraft,
  onSubmit,
  renderTopHeaderExtra,
  renderQuestionArea,
  renderSidePanel,
  questions,
  initialAnswers = {},
  children,
  contextContent,
}: GenericPracticeEngineProps) {
  const router = useRouter();
  const [answers, setAnswers] =
    useState<Record<string, AnswerValue>>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const shouldAutosave =
    enableAutosave ??
    Boolean(onSaveDraft || (domain !== "speaking" && attemptId));

  const {
    status: saveStatus,
    isOnline,
    flushNow,
    clearLocalDraft,
  } = useAutosaveDraft({
    attemptId,
    storageKey: attemptId
      ? `draft_${domain || "practice"}_${attemptId}`
      : undefined,
    answers: answers as Record<
      string,
      string | string[] | Record<string, unknown>
    >,
    onServerSync: onSaveDraft
      ? (draftAnswers) =>
          onSaveDraft(draftAnswers as Record<string, AnswerValue>)
      : undefined,
    debounceMs: 2000,
    intervalMs: 15000,
    enabled: shouldAutosave,
  });

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleManualSave = useCallback(() => {
    setSubmitError(null);
    void flushNow();
  }, [flushNow]);

  const unansweredCount = useMemo(() => {
    return questions.filter((q) => {
      const val = answers[q.id];
      if (val === undefined || val === "") return true;
      if (Array.isArray(val)) return val.length === 0;
      if (typeof val === "object" && val !== null) {
        if ("selectedOptionIds" in val || "answerText" in val) {
          const text = String(
            (val as { answerText?: string }).answerText ?? "",
          ).trim();
          const selected = Array.isArray(
            (val as { selectedOptionIds?: unknown[] }).selectedOptionIds,
          )
            ? (val as { selectedOptionIds: unknown[] }).selectedOptionIds
            : [];
          return !text && selected.length === 0;
        }
        return Object.keys(val).length === 0;
      }
      return false;
    }).length;
  }, [questions, answers]);

  const navQuestions = useMemo(() => {
    return questions.map((q, i) => {
      const val = answers[q.id];
      let hasAnswer = false;
      if (typeof val === "string") {
        hasAnswer = val.trim().length > 0;
      } else if (Array.isArray(val)) {
        hasAnswer = val.length > 0;
      } else if (typeof val === "object" && val !== null) {
        if ("selectedOptionIds" in val || "answerText" in val) {
          const text = String(
            (val as { answerText?: string }).answerText ?? "",
          ).trim();
          const selected = Array.isArray(
            (val as { selectedOptionIds?: unknown[] }).selectedOptionIds,
          )
            ? (val as { selectedOptionIds: unknown[] }).selectedOptionIds
            : [];
          hasAnswer = text.length > 0 || selected.length > 0;
        } else {
          hasAnswer = Object.keys(val).length > 0;
        }
      }
      return {
        id: q.id,
        index: i,
        status: hasAnswer ? "answered" : "unanswered",
      } as const;
    });
  }, [questions, answers]);

  const submitAttempt = useCallback(
    async (options?: { forceExpireSubmit?: boolean }) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        if (shouldAutosave) {
          const flushed = await flushNow();
          if (!flushed && !options?.forceExpireSubmit) {
            setIsSubmitModalOpen(false);
            setSubmitError(
              "Không thể đồng bộ bản nháp lên máy chủ. Hãy kiểm tra kết nối và lưu nháp lại trước khi nộp.",
            );
            return;
          }
        }

        if (onSubmit) {
          await onSubmit(answers);
          await clearLocalDraft();
          return;
        }

        const res = await submitExerciseAction({
          attemptId,
          answers: answers as Record<
            string,
            string | string[] | Record<string, string>
          >,
        });

        if (res.success) {
          await clearLocalDraft();
          router.push(`/practice/result/${attemptId}`);
        } else {
          setIsSubmitModalOpen(false);
          setSubmitError(
            res.error || "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.",
          );
        }
      } catch (err) {
        setIsSubmitModalOpen(false);
        setSubmitError(
          err instanceof Error && err.message
            ? err.message
            : "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.",
        );
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [
      answers,
      attemptId,
      clearLocalDraft,
      flushNow,
      onSubmit,
      router,
      shouldAutosave,
    ],
  );

  const handleExpire = useCallback(() => {
    void submitAttempt({ forceExpireSubmit: true });
  }, [submitAttempt]);

  const currentQuestion = questions[currentIndex];
  const combinedSubmitting = isSubmitting || Boolean(externalIsSubmitting);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col lg:h-[calc(100vh-4rem)]">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 flex flex-none flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <ServerTimer
          serverExpiresAt={serverExpiresAt || expiresAt}
          serverNow={serverNow}
          onExpire={handleExpire}
          autoSubmitOnMountExpired={autoSubmitOnMountExpired}
        />

        {renderTopHeaderExtra?.()}

        <div className="ml-auto flex items-center gap-3">
          {shouldAutosave ? (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  <span>Đang lưu...</span>
                </>
              ) : null}
              {saveStatus === "saved" ? (
                <span
                  aria-label="Đã lưu nháp lên máy chủ"
                  className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>saved</span>
                </span>
              ) : null}
              {saveStatus === "offline_saved" || !isOnline ? (
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Lưu tạm ngoại tuyến</span>
                </span>
              ) : null}
              {saveStatus === "error" ? (
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="flex items-center gap-1 font-medium text-rose-600 underline hover:text-rose-700"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Lỗi lưu nháp - Thử lại</span>
                </button>
              ) : null}
            </div>
          ) : null}

          {shouldAutosave ? (
            <button
              type="button"
              onClick={handleManualSave}
              disabled={saveStatus === "saving" || combinedSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lưu nháp</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={combinedSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {combinedSubmitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {submitError}
          </span>
          {shouldAutosave ? (
            <button
              type="button"
              onClick={handleManualSave}
              className="shrink-0 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
            >
              Lưu lại ngay
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Mobile Question Switcher */}
      {questions.length > 1 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200 bg-white px-4 py-2 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
          {navQuestions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(q.index)}
              className={`h-8 min-w-8 shrink-0 rounded-lg px-2 text-xs font-bold transition-colors ${
                q.index === currentIndex
                  ? "bg-blue-600 text-white"
                  : q.status === "answered"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {q.index + 1}
            </button>
          ))}
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="grid flex-1 gap-6 overflow-y-auto bg-zinc-50 p-4 md:p-6 lg:grid-cols-12 lg:overflow-hidden dark:bg-zinc-950">
        {/* Context / Passage Column */}
        {(contextContent || renderSidePanel) && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-6 lg:h-full lg:overflow-y-auto dark:border-zinc-800 dark:bg-zinc-900">
            {contextContent || renderSidePanel?.()}
          </div>
        )}

        {/* Question Area Column */}
        <div
          className={`${
            contextContent || renderSidePanel
              ? "lg:col-span-4"
              : "lg:col-span-8"
          } flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:h-full lg:overflow-y-auto dark:border-zinc-800 dark:bg-zinc-900`}
        >
          <div className="flex-1">
            {currentQuestion ? (
              children?.({ currentQuestion, answers, setAnswer }) ||
              renderQuestionArea?.({ currentQuestion, answers, setAnswer })
            ) : (
              <div className="mt-10 text-center text-zinc-500">
                Không có câu hỏi nào.
              </div>
            )}
          </div>

          {questions.length > 1 ? (
            <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Câu trước
              </button>
              <span className="text-sm font-medium text-zinc-500">
                {currentIndex + 1} / {questions.length}
              </span>
              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((p) => p + 1)}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                Câu tiếp
              </button>
            </div>
          ) : null}
        </div>

        {/* Navigator Column */}
        <div
          className={`${
            contextContent || renderSidePanel
              ? "lg:col-span-2"
              : "lg:col-span-4"
          } hidden h-full overflow-y-auto lg:block`}
        >
          <QuestionNavigator
            questions={navQuestions}
            currentIndex={currentIndex}
            onSelectQuestion={setCurrentIndex}
          />
        </div>
      </div>

      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={() => {
          void submitAttempt();
        }}
        isSubmitting={combinedSubmitting}
        unansweredCount={unansweredCount}
      />
    </div>
  );
}
