"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  Flag,
  Headphones,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DynamicQuestionRenderer,
  GenericPracticeEngine,
} from "@/features/core-practice";
import { LessonMarkdown } from "@/features/learning/components/lesson-markdown";
import {
  saveListeningAnswerAction,
  submitListeningPracticeAction,
} from "@/features/listening/actions";
import { formatListeningQuestionType } from "@/features/listening/model";
import type {
  ListeningPracticePageData,
  ListeningQuestion,
} from "@/features/listening/server/content";
import { submitMockTestSectionAction } from "@/features/mock-tests/actions";
import type { MockRunnerContext } from "@/features/mock-tests/model";

type Draft = { answerText: string; selectedOptionIds: string[] };

function serializeDraft(draft?: Draft) {
  return JSON.stringify({
    answerText: draft?.answerText ?? "",
    selectedOptionIds: [...(draft?.selectedOptionIds ?? [])].sort(),
  });
}

export function ListeningRunner({
  data,
  mockContext,
}: {
  data: ListeningPracticePageData;
  mockContext?: MockRunnerContext;
}) {
  if (!data.attempt) return null;
  return <ActiveListeningRunner data={data} mockContext={mockContext} />;
}

function ActiveListeningRunner({
  data,
  mockContext,
}: {
  data: ListeningPracticePageData;
  mockContext?: MockRunnerContext;
}) {
  const attempt = data.attempt!;
  const [audioError, setAudioError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saveConflictMessage, setSaveConflictMessage] = useState<string | null>(
    null,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initialAnswers = Object.fromEntries(
    data.questions.map((question) => [
      question.id,
      {
        answerText: question.answer?.text ?? "",
        selectedOptionIds: question.answer?.selectedOptionIds ?? [],
      },
    ]),
  );

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
        const result = await saveListeningAnswerAction({
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

    const res = await submitListeningPracticeAction({
      attemptId: attempt.id,
      exerciseSlug: data.exercise.slug,
    });
    if (res && "status" in res && res.status === "error") {
      throw new Error(res.message);
    }
  }, [attempt.id, data.exercise.slug, mockContext]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setAudioError(true));
    } else {
      audio.pause();
    }
  }, []);

  const renderTopHeaderExtra = () => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={togglePlayPause}
        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span>{isPlaying ? "Tạm dừng Audio" : "Phát Audio"}</span>
      </button>
    </div>
  );

  // Split-View: Single canonical Audio Player & Section Instructions
  const renderSidePanel = () => (
    <div className="space-y-6 select-none">
      {/* Audio Console Card (Single <audio> instance to eliminate dual playback across breakpoints) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#2B3060] bg-[#141731] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
            <Headphones className="text-indigo-400" size={20} />
            Audio Console
          </h2>
          <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-indigo-300 uppercase">
            {data.exercise.difficulty}
          </span>
        </div>

        <div className="space-y-3">
          <audio
            ref={audioRef}
            aria-label={`Audio Listening ${data.exercise.title}`}
            className="h-11 w-full rounded-xl border border-[#2B3060] bg-[#0C0E1D]"
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => setAudioError(true)}
            onCanPlay={() => setAudioError(false)}
          >
            <source src={data.audio.path} type={data.audio.mimeType} />
          </audio>

          {audioError ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-400"
            >
              Không thể tải file âm thanh. Vui lòng kiểm tra lại kết nối mạng.
            </p>
          ) : null}

          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Volume2 size={13} className="text-indigo-400" />
              Thời lượng: {Math.floor(data.audio.durationSeconds / 60)}:
              {Math.floor(data.audio.durationSeconds % 60)
                .toString()
                .padStart(2, "0")}
            </span>
            <span className="font-medium text-emerald-400">
              Bản ghi chuẩn IELTS
            </span>
          </div>
        </div>
      </section>

      {data.parts.length > 0 && (
        <div className="space-y-4">
          {data.parts.map((part) => (
            <div
              key={part.id}
              className="rounded-3xl border border-[#2B3060] bg-[#141731] p-6 shadow-xl"
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-300">
                <Info size={16} className="text-[#F6E85C]" />
                <span>{part.title}</span>
              </div>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-300">
                <LessonMarkdown>{part.instructionsMarkdown}</LessonMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <GenericPracticeEngine
      attemptId={attempt.id}
      title={data.exercise.title}
      domain="listening"
      categoryLabel="Listening Practice"
      serverNow={attempt.serverNow}
      expiresAt={attempt.expiresAt}
      autoSubmitOnMountExpired={Boolean(mockContext)}
      questions={data.questions}
      initialAnswers={initialAnswers}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmit}
      renderTopHeaderExtra={renderTopHeaderExtra}
      renderSidePanel={renderSidePanel}
      renderQuestionArea={({ currentQuestion, answers, setAnswer }) => {
        const question = currentQuestion as ListeningQuestion;
        const currentDraft = (answers[question.id] as Draft) || {
          answerText: "",
          selectedOptionIds: [],
        };
        const part = data.parts.find((p) => p.id === question.partId);

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
                  <RotateCcw aria-hidden="true" size={14} className="mr-1.5" />
                  Tải lại
                </Button>
              </div>
            ) : null}

            {/* Mobile Part Title */}
            {part && (
              <div className="rounded-2xl border border-[#2B3060] bg-[#141731] p-4 lg:hidden">
                <h3 className="mb-1 text-sm font-bold text-white">
                  {part.title}
                </h3>
                <div className="text-xs text-zinc-300">
                  <LessonMarkdown>{part.instructionsMarkdown}</LessonMarkdown>
                </div>
              </div>
            )}

            <QuestionCard
              question={question}
              draft={currentDraft}
              onChange={(next) => setAnswer(question.id, next)}
            />
          </div>
        );
      }}
    />
  );
}

function QuestionCard({
  question,
  draft,
  onChange,
}: {
  question: ListeningQuestion;
  draft: Draft;
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
        `Listening Q${question.position} (${question.id})`,
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
      id={`listening-question-${question.id}`}
      className="min-w-0 scroll-mt-32 rounded-3xl border border-[#2B3060] bg-[#141731] p-6 text-white shadow-xl md:p-8"
    >
      <legend className="mb-5 flex w-full items-center justify-between gap-2 rounded-xl border border-[#2B3060] bg-[#1B1F40] px-3 py-1.5 text-xs font-bold tracking-wider text-indigo-200 uppercase shadow-sm">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#F6E85C]" />
          <span>
            Q{question.position} <span className="mx-1 opacity-40">·</span>{" "}
            {formatListeningQuestionType(question.type)}
          </span>
        </span>
        <button
          type="button"
          aria-expanded={reportOpen}
          onClick={() => {
            setReportOpen((prev) => !prev);
            setReportFeedback(null);
          }}
          className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-rose-400 transition-colors hover:text-rose-300"
          title="Báo lỗi câu hỏi này"
        >
          <Flag size={12} /> Báo lỗi
        </button>
      </legend>

      {reportOpen ? (
        <div
          role="region"
          aria-label={`Báo lỗi câu Q${question.position}`}
          className="mb-5 space-y-2.5 rounded-2xl border border-rose-500/30 bg-[#1B1F40] p-4"
        >
          <label
            htmlFor={`listening-report-${question.id}`}
            className="block text-xs font-bold text-rose-200"
          >
            Mô tả lỗi (sai đáp án, lỗi audio, đánh máy…)
          </label>
          <textarea
            id={`listening-report-${question.id}`}
            rows={2}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            maxLength={1500}
            placeholder="Ví dụ: Audio bị lệch ở phút 1:20 hoặc sai đáp án..."
            className="w-full rounded-xl border border-[#2B3060] bg-[#0C0E1D] px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          {reportFeedback ? (
            <p
              role="status"
              aria-live="polite"
              className={
                reportFeedback.type === "success"
                  ? "text-xs font-semibold text-emerald-400"
                  : "text-xs font-semibold text-rose-400"
              }
            >
              {reportFeedback.message}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
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

      <div className="mb-6 max-w-[65ch] text-lg leading-relaxed font-semibold break-words text-[#EEF0FF]">
        <LessonMarkdown>{question.promptMarkdown}</LessonMarkdown>
      </div>

      <DynamicQuestionRenderer
        question={question}
        draft={draft}
        onChange={onChange}
      />
    </fieldset>
  );
}
