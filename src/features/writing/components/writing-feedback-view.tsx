"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  PenLine,
  Quote,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { WritingSubmissionReviewData } from "@/features/writing/server/content";

const CRITERION_LABELS = {
  taskResponse: "Task Response",
  coherenceCohesion: "Coherence & Cohesion",
  lexicalResource: "Lexical Resource",
  grammaticalRangeAccuracy: "Grammatical Range & Accuracy",
} as const;

const CONFIDENCE_LABELS: Record<"low" | "medium" | "high", string> = {
  low: "Độ tin cậy thấp (dữ liệu hạn chế)",
  medium: "Độ tin cậy trung bình",
  high: "Độ tin cậy cao",
};

type Correction = NonNullable<
  WritingSubmissionReviewData["feedback"]
>["correctedExamples"][number];

export function WritingFeedbackView({
  data,
}: {
  data: WritingSubmissionReviewData;
}) {
  const feedback = data.feedback;
  const [selectedCorrection, setSelectedCorrection] =
    useState<Correction | null>(null);
  const [comparisonTab, setComparisonTab] = useState<"original" | "suggested">(
    "original",
  );

  const locallyRevisedDraft = useMemo(
    () =>
      feedback
        ? feedback.correctedExamples.reduce(
            (text, correction) =>
              text.replace(correction.source, correction.revision),
            data.submission.text,
          )
        : data.submission.text,
    [data.submission.text, feedback],
  );

  if (!feedback) return null;

  const confidenceLabel =
    CONFIDENCE_LABELS[feedback.confidence as keyof typeof CONFIDENCE_LABELS] ??
    feedback.confidence;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pt-8 pb-24 font-sans sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/practice/writing"
          aria-label="Back to Writing"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-600 shadow-sm transition-colors hover:text-indigo-600"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          <span className="text-sm font-bold">Back to Library</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/practice/writing/${data.task.slug}`}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50"
          >
            <PenLine aria-hidden="true" size={16} /> Write Again
          </Link>
          <Link
            href={`/practice/writing/${data.task.slug}/submission/${data.submission.id}/complete`}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Finish Practice <ChevronRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
          <Sparkles aria-hidden="true" size={14} /> AI Practice Feedback · Không
          thay thế điểm IELTS chính thức
        </div>
        <h1 className="mb-3 text-3xl font-black text-slate-800">
          {data.task.title}
        </h1>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-indigo-100 bg-white px-6 py-4 shadow-sm">
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Band ước lượng luyện tập
            </p>
            <p className="text-3xl font-black text-indigo-600">
              {feedback.overallBandEstimate.toFixed(1)}{" "}
              <span className="text-base font-bold text-slate-400">/ 9.0</span>
            </p>
          </div>
          <span className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Độ tin cậy
            </p>
            <p className="text-sm font-bold text-slate-700">
              {confidenceLabel}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-800">
              IELTS Writing Rubric
            </h2>

            <div className="space-y-5">
              {(
                Object.keys(CRITERION_LABELS) as Array<
                  keyof typeof CRITERION_LABELS
                >
              ).map((key) => {
                const criterion = feedback.criteria[key];
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-800">
                        {CRITERION_LABELS[key]}
                      </h3>
                      <span className="text-sm font-black text-indigo-600 tabular-nums">
                        Band {criterion.band.toFixed(1)}
                      </span>
                    </div>
                    <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(criterion.band / 9) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {criterion.comment}
                    </p>
                    {criterion.evidence.length > 0 ? (
                      <div className="mt-2.5 space-y-1.5 border-t border-slate-200/70 pt-2.5">
                        {criterion.evidence.map((quote) => (
                          <p
                            key={quote}
                            className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500 italic"
                          >
                            <Quote
                              aria-hidden="true"
                              size={12}
                              className="mt-0.5 shrink-0 text-indigo-400"
                            />
                            <span>“{quote}”</span>
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-800">
              <Lightbulb
                aria-hidden="true"
                size={20}
                className="text-amber-500"
              />
              Nhận xét tổng quan
            </h2>
            <p className="text-sm leading-relaxed font-medium text-slate-600">
              {feedback.summary}
            </p>
          </section>

          {feedback.strengths.length > 0 ? (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-emerald-900">
                <CheckCircle2
                  aria-hidden="true"
                  size={20}
                  className="text-emerald-600"
                />
                Điểm làm tốt
              </h2>
              <ul className="space-y-2.5">
                {feedback.strengths.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-relaxed text-emerald-950"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-800">
              <AlertCircle
                aria-hidden="true"
                size={20}
                className="text-rose-500"
              />
              Vấn đề ưu tiên cải thiện
            </h2>
            <ul className="space-y-4">
              {feedback.priorityIssues.map((item) => (
                <li
                  key={`${item.issue}-${item.evidence}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="mb-1.5 text-sm font-bold text-slate-800">
                    {item.issue}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-500 italic">
                    Dẫn chứng: “{item.evidence}”
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {feedback.revisionPlan.length > 0 ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-black text-slate-800">
                Kế hoạch sửa bài đề xuất
              </h2>
              <ol className="space-y-2.5 text-sm leading-relaxed text-slate-700">
                {feedback.revisionPlan.map((step, index) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-7">
          <section className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex shrink-0 items-center border-b border-slate-100 bg-slate-50/50 p-2">
              <div className="flex w-full rounded-xl bg-slate-200/50 p-1">
                <button
                  type="button"
                  onClick={() => setComparisonTab("original")}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${comparisonTab === "original" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Bài gốc & Gợi ý sửa câu
                </button>
                <button
                  type="button"
                  onClick={() => setComparisonTab("suggested")}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${comparisonTab === "suggested" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Sparkles aria-hidden="true" size={16} /> Bản áp dụng gợi ý
                    cục bộ
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-6 font-serif text-[17px] leading-loose text-slate-800 md:p-8">
              {comparisonTab === "original" ? (
                <>
                  <div className="whitespace-pre-wrap">
                    {data.submission.text}
                  </div>

                  {feedback.correctedExamples.length > 0 ? (
                    <div className="mt-8 border-t border-slate-100 pt-8 font-sans">
                      <h3 className="mb-4 text-sm font-bold tracking-wider text-slate-800 uppercase">
                        Các đoạn gợi ý chỉnh sửa (
                        {feedback.correctedExamples.length})
                      </h3>
                      <div className="space-y-3">
                        {feedback.correctedExamples.map((example) => (
                          <button
                            type="button"
                            key={`${example.source}-${example.revision}`}
                            onClick={() => setSelectedCorrection(example)}
                            className="w-full rounded-xl border border-rose-100 bg-rose-50/30 p-4 text-left transition-colors hover:bg-rose-50"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <p className="mb-1 text-sm font-medium text-rose-700 line-through decoration-rose-300">
                                  {example.source}
                                </p>
                                <p className="text-sm font-bold text-emerald-700">
                                  {example.revision}
                                </p>
                              </div>
                              <ChevronRight
                                aria-hidden="true"
                                size={18}
                                className="mt-2 shrink-0 text-slate-400"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4 font-sans text-xs text-slate-500">
                      Không có ví dụ thay thế từng câu kèm theo; hãy xem phần
                      nhận xét từng tiêu chí và kế hoạch sửa bài ở cột bên trái.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="-mt-2 mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center font-sans text-xs font-semibold text-amber-900">
                    Bản nháp áp dụng {feedback.correctedExamples.length} gợi ý
                    sửa cục bộ vào bài của bạn. Đây không phải bài mẫu Band 8.0+
                    hoàn chỉnh và không thay đổi điểm tổng thể tự động.
                  </p>
                  <div className="whitespace-pre-wrap text-slate-800 selection:bg-emerald-200">
                    {locallyRevisedDraft}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {selectedCorrection ? (
        <CorrectionDetail
          correction={selectedCorrection}
          onClose={() => setSelectedCorrection(null)}
        />
      ) : null}
    </div>
  );
}

function CorrectionDetail({
  correction,
  onClose,
}: {
  correction: Correction;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#17111f]/40 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close correction detail"
        className="absolute inset-0"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="correction-title"
        className="relative w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2
            id="correction-title"
            className="text-xl font-black text-slate-800"
          >
            Chi tiết gợi ý chỉnh sửa
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
          <p className="text-[10px] font-black tracking-widest text-rose-600 uppercase">
            Đoạn gốc trong bài
          </p>
          <p className="mt-2 text-[15px] leading-relaxed font-medium text-rose-800 line-through decoration-rose-300">
            {correction.source}
          </p>
        </div>

        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
            <Sparkles aria-hidden="true" size={12} /> Gợi ý diễn đạt thay thế
          </p>
          <p className="mt-2 text-[17px] leading-relaxed font-bold text-emerald-900">
            {correction.revision}
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-indigo-600 uppercase">
            <Lightbulb aria-hidden="true" size={12} /> Ghi chú đối chiếu
          </p>
          <p className="mt-2 text-sm leading-relaxed font-medium text-indigo-900">
            {correction.explanation?.trim()
              ? correction.explanation
              : "Đối chiếu trực tiếp đoạn gốc và gợi ý chỉnh sửa ở trên. Mô hình chỉ trả về cặp câu trước/sau mà không kèm giải thích riêng cho câu này."}
          </p>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 w-full rounded-xl bg-slate-800 font-bold text-white shadow-sm transition-colors hover:bg-slate-700"
          >
            Đã hiểu
          </button>
        </div>
      </section>
    </div>
  );
}
