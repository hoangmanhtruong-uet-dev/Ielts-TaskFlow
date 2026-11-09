"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  RotateCcw,
  Target,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GenericPracticeEngine } from "@/features/core-practice";
import { submitMockTestSectionAction } from "@/features/mock-tests/actions";
import type { MockRunnerContext } from "@/features/mock-tests/model";
import {
  saveWritingDraftAction,
  submitWritingAction,
} from "@/features/writing/actions";
import type { WritingPracticePageData } from "@/features/writing/server/content";

type SaveStatus =
  "idle" | "saving" | "saved" | "offline" | "conflict" | "error";

export function WritingRunner({
  data,
  mockContext,
}: {
  data: WritingPracticePageData;
  mockContext?: MockRunnerContext;
}) {
  const submission = data.submission;
  if (!submission) return null;
  return (
    <WritingEditor
      data={data}
      submission={submission}
      mockContext={mockContext}
    />
  );
}

function WritingEditor({
  data,
  submission,
  mockContext,
}: {
  data: WritingPracticePageData;
  submission: NonNullable<WritingPracticePageData["submission"]>;
  mockContext?: MockRunnerContext;
}) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showOutlineGuide, setShowOutlineGuide] = useState(false);

  // Maintain authoritative latest revision synchronously so queued/sequential saves never replay stale revisions.
  const serverRevisionRef = useRef<number>(submission.serverRevision);

  useEffect(() => {
    if (submission.serverRevision > serverRevisionRef.current) {
      serverRevisionRef.current = submission.serverRevision;
    }
  }, [submission.serverRevision]);

  const handleSaveDraft = useCallback(
    async (answers: Record<string, unknown>) => {
      const textToSave =
        typeof answers["essay"] === "string" ? answers["essay"] : "";
      try {
        setSaveStatus("saving");
        const result = await saveWritingDraftAction({
          submissionId: submission.id,
          taskSlug: data.task.slug,
          draftText: textToSave,
          expectedRevision: serverRevisionRef.current,
        });

        if (result.status === "saved") {
          serverRevisionRef.current = result.serverRevision;
          setSaveStatus("saved");
          setSaveMessage(null);
          return true;
        }

        setSaveStatus(result.status);
        setSaveMessage(result.message);
        return false;
      } catch {
        setSaveStatus("error");
        setSaveMessage(
          "Không thể lưu bản nháp vào máy chủ. Nội dung đang viết vẫn được giữ lại trên màn hình.",
        );
        return false;
      }
    },
    [data.task.slug, submission.id],
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

    const res = await submitWritingAction({
      submissionId: submission.id,
      taskSlug: data.task.slug,
      idempotencyKey: crypto.randomUUID(),
    });
    if (res && "status" in res && res.status === "error") {
      throw new Error(res.message);
    }
  }, [data.task.slug, mockContext, submission.id]);

  const questions = [
    {
      id: "essay",
      promptMarkdown: data.task.promptText,
    },
  ];

  const initialAnswers = {
    essay: submission.draftText,
  };

  const outlineSteps =
    data.task.taskType === "task_1"
      ? [
          "1. Introduction: Paraphrase đề bài (what, where, when).",
          "2. Overview: Nêu 2 xu hướng/điểm nổi bật nhất (không nêu số liệu chi tiết).",
          "3. Body Paragraph 1: Nhóm dữ liệu chính thứ nhất kèm số liệu đối chiếu.",
          "4. Body Paragraph 2: Nhóm dữ liệu còn lại và so sánh sự thay đổi.",
        ]
      : [
          "1. Introduction: Dẫn nhập chủ đề & nêu rõ quan điểm (Thesis Statement).",
          "2. Body Paragraph 1: Luận điểm 1 + giải thích cơ chế + ví dụ thực tế.",
          "3. Body Paragraph 2: Luận điểm 2 / phản biện + lập luận hỗ trợ.",
          "4. Conclusion: Tóm tắt lại luận điểm chính & khẳng định quan điểm.",
        ];

  const renderSidePanel = () => (
    <div className="flex h-full flex-col space-y-6 overflow-y-auto bg-white p-2 md:p-4">
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black tracking-wider text-slate-800 uppercase">
          <Target size={18} className="text-indigo-500" /> Prompt & Requirements
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
          <div className="pointer-events-none absolute top-0 right-0 p-4 text-indigo-900 opacity-5">
            <FileText size={120} />
          </div>
          <p className="relative z-10 text-[15px] leading-relaxed font-medium text-indigo-950">
            {data.task.promptText}
          </p>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2">
            <span className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
              {data.task.difficulty}
            </span>
            <span className="rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
              {data.task.minimumWords}-{data.task.maximumWords} words
            </span>
          </div>

          <div className="relative z-10 mt-4 border-t border-indigo-100/50 pt-4">
            <p className="text-xs leading-relaxed font-medium text-indigo-700/80">
              {data.task.instructions}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-black tracking-wider text-slate-800 uppercase">
          <Wand2 size={18} className="text-amber-500" /> Dàn ý tham khảo
        </h2>
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-100 bg-amber-50/50 p-1.5">
          <button
            type="button"
            onClick={() => setShowOutlineGuide((prev) => !prev)}
            aria-expanded={showOutlineGuide}
            className="group flex w-full items-center justify-between rounded-xl border border-amber-100/50 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-amber-300"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-amber-700">
              <HelpCircle size={16} className="text-amber-500" />
              Cấu trúc bài{" "}
              {data.task.taskType === "task_1" ? "Task 1" : "Task 2"}
            </span>
            {showOutlineGuide ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>
          {showOutlineGuide ? (
            <ul className="space-y-1.5 px-4 pb-3 text-xs leading-relaxed text-slate-700">
              {outlineSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-black tracking-wider text-slate-800 uppercase">
          <BookOpen size={18} className="text-emerald-500" /> Tiêu chí tự kiểm
          tra
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Task Response",
            "Coherence & Cohesion",
            "Lexical Resource",
            "Grammatical Accuracy",
          ].map((criterion) => (
            <span
              key={criterion}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              {criterion}
            </span>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <GenericPracticeEngine
      attemptId={submission.id}
      title={data.task.title}
      domain="writing"
      categoryLabel="Writing Practice"
      serverNow={submission.serverNow}
      expiresAt={submission.expiresAt}
      autoSubmitOnMountExpired={Boolean(mockContext)}
      questions={questions}
      initialAnswers={initialAnswers}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmit}
      renderSidePanel={renderSidePanel}
      renderQuestionArea={({ answers, setAnswer }) => {
        const text =
          typeof answers["essay"] === "string" ? answers["essay"] : "";
        const wordCount = countWords(text);

        return (
          <div className="flex flex-1 flex-col space-y-4">
            <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">
              <label htmlFor="writing-draft" className="sr-only">
                Your writing
              </label>
              <textarea
                id="writing-draft"
                name="writingDraft"
                value={text}
                onChange={(event) => setAnswer("essay", event.target.value)}
                placeholder="Start typing your response here..."
                maxLength={20_000}
                autoComplete="off"
                spellCheck
                className="min-h-[350px] w-full flex-1 resize-none bg-transparent p-6 font-serif text-[17px] leading-loose text-slate-800 outline-none placeholder:text-slate-300 md:p-8"
              />

              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span
                    className={
                      wordCount >= data.task.minimumWords
                        ? "text-emerald-700"
                        : "text-slate-600"
                    }
                  >
                    {wordCount} / {data.task.wordTarget} words
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Revision #{serverRevisionRef.current}
                </span>
              </div>
            </section>

            {saveStatus === "conflict" || saveStatus === "error" ? (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
              >
                <span className="flex items-center gap-2 font-medium">
                  <AlertTriangle
                    size={14}
                    className="shrink-0 text-amber-600"
                  />
                  {saveMessage ||
                    "Có xung đột phiên bản nháp. Nội dung hiện tại vẫn được giữ nguyên trên trình duyệt."}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw aria-hidden="true" size={14} className="mr-1.5" />
                  Tải lại bản mới nhất
                </Button>
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}

function countWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}
