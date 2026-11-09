import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headphones,
  LockKeyhole,
  Mic,
  PenLine,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/shared/confirm-submit-button";
import {
  startMockSectionAction,
  submitMockTestAction,
} from "@/features/mock-tests/actions";
import {
  formatMockDuration,
  formatMockSectionType,
  formatMockSessionStatus,
} from "@/features/mock-tests/model";
import type { MockSessionPageData } from "@/features/mock-tests/server/content";

const sectionIcons: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

const sectionColorMap: Record<
  string,
  { card: string; icon: string; badge: string }
> = {
  listening: {
    card: "border-blue-100 hover:border-blue-200",
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
  reading: {
    card: "border-emerald-100 hover:border-emerald-200",
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  writing: {
    card: "border-amber-100 hover:border-amber-200",
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  speaking: {
    card: "border-rose-100 hover:border-rose-200",
    icon: "bg-rose-50 text-rose-600",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
  },
};

const errors: Record<string, string> = {
  "section-start":
    "Chưa thể mở section. Hãy hoàn thành section trước đó rồi thử lại.",
  "section-route": "Section đã mở nhưng chưa xác định được đường dẫn nội dung.",
  incomplete: "Chỉ có thể nộp mock test sau khi đủ bốn section.",
  summary: "Bài đã nộp nhưng chưa thể tạo trang tổng kết. Hãy thử lại.",
};

export function MockTestSession({
  data,
  error,
}: {
  data: MockSessionPageData;
  error?: string;
}) {
  const firstPendingIndex = data.sections.findIndex(
    (section) => section.attempt?.status !== "submitted",
  );
  const allSubmitted = firstPendingIndex === -1;
  const completedCount = data.sections.filter(
    (s) => s.attempt?.status === "submitted",
  ).length;
  const progressPercent = Math.round(
    (completedCount / data.sections.length) * 100,
  );

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-indigo-50 opacity-50" />
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-black tracking-wider text-indigo-700 uppercase">
                {formatMockSessionStatus(data.session.status)}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                Live Session
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-black text-slate-800 sm:text-3xl">
              {data.version.title}
            </h1>
            <p className="max-w-lg text-sm font-medium text-slate-500">
              Complete each section in order. Time limits are strictly enforced.
            </p>
          </div>

          {/* Progress Widget */}
          <div className="min-w-[180px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="mb-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Overall Progress
            </p>
            <div className="mb-1 text-4xl font-black text-indigo-600">
              {completedCount}
              <span className="text-xl font-bold text-slate-400">
                /{data.sections.length}
              </span>
            </div>
            <p className="mb-3 text-xs font-semibold text-slate-500">
              Sections done
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700"
        >
          ⚠️ {errors[error] ?? "Yêu cầu chưa thể xử lý. Vui lòng thử lại."}
        </p>
      ) : null}

      {/* Sections List */}
      <section>
        <h2 className="mb-4 text-sm font-black tracking-widest text-slate-500 uppercase">
          Section Checklist
        </h2>
        <ol className="space-y-4">
          {data.sections.map((section, index) => {
            const status = section.attempt?.status;
            const isCurrent = index === firstPendingIndex;
            const isLocked = !allSubmitted && index > firstPendingIndex;
            const isDone = status === "submitted";
            const isInProgress = status === "in_progress";
            const sectionKey = section.type.toLowerCase();
            const Icon = sectionIcons[sectionKey] ?? FileCheck2;
            const colors = sectionColorMap[sectionKey] ?? {
              card: "border-slate-100",
              icon: "bg-slate-50 text-slate-500",
              badge: "bg-slate-50 text-slate-600 border-slate-100",
            };

            return (
              <li
                key={section.id}
                className={`flex items-center gap-5 rounded-2xl border bg-white p-6 shadow-sm transition-all ${
                  isDone
                    ? "border-emerald-100 bg-emerald-50/20"
                    : isLocked
                      ? "border-slate-100 opacity-60"
                      : isCurrent
                        ? `${colors.card} ring-2 ring-indigo-500/20`
                        : colors.card
                }`}
              >
                {/* Step number / status dot */}
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDone ? (
                    <Check size={18} />
                  ) : isLocked ? (
                    <LockKeyhole size={16} />
                  ) : (
                    section.order
                  )}
                </div>

                {/* Section icon */}
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${colors.icon}`}
                >
                  <Icon size={22} />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${colors.badge}`}
                    >
                      {formatMockSectionType(section.type)}
                    </span>
                    {isInProgress && (
                      <span className="flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600 uppercase">
                        <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
                        In Progress
                      </span>
                    )}
                    {isDone && (
                      <span className="flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 uppercase">
                        <CheckCircle2 size={11} /> Submitted
                      </span>
                    )}
                  </div>
                  <h3 className="truncate text-sm font-bold text-slate-800">
                    {section.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock3 size={12} />
                    {formatMockDuration(section.timeLimitSeconds)}
                    {isLocked && " · Locked"}
                  </p>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {isDone ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                      <Check size={15} /> Done
                    </span>
                  ) : isLocked ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400">
                      <LockKeyhole size={15} /> Locked
                    </span>
                  ) : section.practicePath ? (
                    <Button
                      asChild
                      className="h-11 rounded-xl bg-indigo-600 px-5 font-bold text-white shadow-sm hover:bg-indigo-700"
                    >
                      <Link href={section.practicePath}>
                        Continue <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </Button>
                  ) : isCurrent ? (
                    <form action={startMockSectionAction}>
                      <input
                        type="hidden"
                        name="mockTestSlug"
                        value={data.test.slug}
                      />
                      <input
                        type="hidden"
                        name="sessionId"
                        value={data.session.id}
                      />
                      <input
                        type="hidden"
                        name="sectionId"
                        value={section.id}
                      />
                      <Button
                        type="submit"
                        className="h-11 rounded-xl bg-indigo-600 px-5 font-bold text-white shadow-sm hover:bg-indigo-700"
                      >
                        Start Section <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Finish / Summary CTA */}
      {data.session.status === "completed" ? (
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-emerald-600 p-8 shadow-lg shadow-emerald-200 sm:flex-row sm:items-center">
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-1/4 -translate-y-1/3 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h2 className="mb-1 flex items-center gap-2 text-xl font-black text-white">
              <Trophy size={20} /> Exam Completed!
            </h2>
            <p className="text-sm font-medium text-emerald-100">
              Your AI-powered band score report is ready.
            </p>
          </div>
          <Button
            asChild
            className="relative z-10 h-14 shrink-0 rounded-2xl bg-white px-8 text-base font-black text-emerald-700 shadow-md hover:bg-emerald-50"
          >
            <Link
              href={`/mock-tests/${data.test.slug}/session/${data.session.id}/summary`}
            >
              View Full Report <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      ) : allSubmitted ? (
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-indigo-600 p-8 shadow-lg shadow-indigo-200 sm:flex-row sm:items-center">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/4 -translate-y-1/3 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-white">
              <Sparkles size={20} /> All Sections Submitted!
            </h2>
            <p className="max-w-sm text-sm font-medium text-indigo-200">
              Lock in your results and generate your AI-powered band score
              report and detailed feedback.
            </p>
          </div>
          <form
            action={submitMockTestAction}
            className="relative z-10 shrink-0"
          >
            <input type="hidden" name="mockTestSlug" value={data.test.slug} />
            <input type="hidden" name="sessionId" value={data.session.id} />
            <ConfirmSubmitButton
              className="h-14 rounded-2xl bg-white px-8 text-base font-black text-indigo-700 shadow-md hover:bg-indigo-50"
              label="Finish & Get Report"
              title="Finalize Mock Test?"
              description="Your session will be locked and your AI band score report will be generated from all four sections."
              confirmLabel="Confirm Finish"
            />
          </form>
        </div>
      ) : null}
    </div>
  );
}
