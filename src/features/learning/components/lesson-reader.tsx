"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { LearningProgress } from "@/features/learning/components/learning-progress";
import dynamic from "next/dynamic";
const LessonMarkdown = dynamic(
  () =>
    import("@/features/learning/components/lesson-markdown").then(
      (mod) => mod.LessonMarkdown,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 animate-pulse rounded-xl bg-gray-200"></div>
    ),
  },
);
import { Button } from "@/components/ui/button";
import { initialLearningProgressActionState } from "@/features/learning/action-state";
import {
  completeLessonSectionAction,
  openLessonSectionAction,
} from "@/features/learning/actions";
import { SECTION_TYPE_LABELS } from "@/features/learning/constants";
import { cn } from "@/lib/utils";
import type { LessonReaderData } from "@/features/learning/server/content";

export function LessonReader({ data }: { data: LessonReaderData }) {
  const { module, lesson, sections, activeSection, nextLesson } = data;
  const [completeState, completeAction, completePending] = useActionState(
    completeLessonSectionAction,
    initialLearningProgressActionState,
  );
  const [openError, setOpenError] = useState<string | null>(null);
  const lastPersistedSection = useRef(lesson.currentSectionId);

  useEffect(() => {
    if (lastPersistedSection.current === activeSection.id) return;
    let cancelled = false;

    void openLessonSectionAction({
      lessonId: lesson.id,
      sectionId: activeSection.id,
      moduleSlug: module.slug,
      lessonSlug: lesson.slug,
    }).then((result) => {
      if (cancelled) return;
      if (result.status === "error") {
        setOpenError(result.message ?? "Không thể lưu vị trí đang học.");
        return;
      }
      lastPersistedSection.current = activeSection.id;
      setOpenError(null);
    });

    return () => {
      cancelled = true;
    };
  }, [activeSection.id, lesson.id, lesson.slug, module.slug]);

  const activeIndex = sections.findIndex(
    (section) => section.id === activeSection.id,
  );
  const previousSection = sections[activeIndex - 1] ?? null;
  const nextSection = sections[activeIndex + 1] ?? null;
  const lessonCompleted = lesson.status === "completed";

  return (
    <div className="space-y-8">
      <LearningProgress
        value={lesson.progressPercent}
        label={`Tiến độ bài học: ${lesson.title}`}
      />

      {lesson.versionStatus === "archived" ? (
        <p
          role="status"
          className="rounded-xl border border-[var(--warning-soft)] bg-[var(--warning-subtle)] p-4 text-sm leading-6"
        >
          Phiên bản này đã được lưu trữ. Bạn vẫn có thể hoàn tất tiến độ đã bắt
          đầu, nhưng bài học không còn xuất hiện trong thư viện.
        </p>
      ) : null}

      <div className="grid min-w-0 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <nav
          aria-label="Các phần trong bài học"
          className="min-w-0 lg:sticky lg:top-24"
        >
          <ol className="flex max-w-full gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {sections.map((section) => {
              const current = section.id === activeSection.id;
              return (
                <li key={section.id} className="min-w-[12rem] lg:min-w-0">
                  <Link
                    href={`?section=${section.displayOrder}`}
                    scroll={false}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none",
                      current
                        ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                    )}
                  >
                    {section.completed ? (
                      <CheckCircle2
                        aria-label="Đã hoàn thành"
                        size={18}
                        className="shrink-0"
                      />
                    ) : (
                      <Circle
                        aria-label="Chưa hoàn thành"
                        size={18}
                        className="shrink-0"
                      />
                    )}
                    <span className="truncate">
                      {section.title ?? `Phần ${section.displayOrder}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <article
          aria-labelledby="active-section-title"
          className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 lg:p-10"
        >
          <p className="text-sm font-semibold text-[var(--primary)]">
            {SECTION_TYPE_LABELS[activeSection.type]}
            {!activeSection.isRequired ? " · Tùy chọn" : ""}
          </p>
          <h2
            id="active-section-title"
            tabIndex={-1}
            className="mt-3 text-2xl font-bold tracking-[-0.025em] text-pretty sm:text-3xl"
          >
            {activeSection.title ?? `Phần ${activeSection.displayOrder}`}
          </h2>

          <div
            className={cn(
              "mt-7 max-w-[68ch] space-y-5",
              activeSection.type === "warning" &&
                "rounded-xl border border-[var(--warning-soft)] bg-[var(--warning-subtle)] p-5",
              (activeSection.type === "tip" ||
                activeSection.type === "summary") &&
                "rounded-xl bg-[var(--primary-subtle)] p-5",
              activeSection.type === "example" &&
                "border-l-4 border-[var(--primary)] pl-5",
            )}
          >
            <LessonMarkdown>{activeSection.bodyMarkdown}</LessonMarkdown>
          </div>

          <div className="mt-9 border-t border-[var(--border)] pt-6">
            {activeSection.completed ? (
              <p className="inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--success)]">
                <CheckCircle2 aria-hidden="true" size={20} />
                Phần này đã hoàn thành
              </p>
            ) : (
              <form action={completeAction}>
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input
                  type="hidden"
                  name="sectionId"
                  value={activeSection.id}
                />
                <input type="hidden" name="moduleSlug" value={module.slug} />
                <input type="hidden" name="lessonSlug" value={lesson.slug} />
                <Button type="submit" disabled={completePending}>
                  {completePending ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                      size={18}
                    />
                  ) : (
                    <CheckCircle2 aria-hidden="true" size={18} />
                  )}
                  {completePending ? "Đang lưu…" : "Đánh dấu đã hoàn thành"}
                </Button>
              </form>
            )}

            {completeState.status !== "idle" ? (
              <p
                className={cn(
                  "mt-3 text-sm",
                  completeState.status === "error"
                    ? "text-[var(--destructive)]"
                    : "text-[var(--success)]",
                )}
                role={completeState.status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {completeState.message}
                {completeState.status === "error" && completeState.requestId
                  ? ` Mã yêu cầu: ${completeState.requestId}`
                  : ""}
              </p>
            ) : null}
            {openError ? (
              <p
                role="alert"
                className="mt-3 text-sm text-[var(--destructive)]"
              >
                {openError}
              </p>
            ) : null}
          </div>

          <nav
            aria-label="Chuyển phần bài học"
            className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            {previousSection ? (
              <Link
                href={`?section=${previousSection.displayOrder}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 text-sm font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              >
                <ArrowLeft aria-hidden="true" size={18} /> Phần trước
              </Link>
            ) : (
              <span />
            )}
            {nextSection ? (
              <Link
                href={`?section=${nextSection.displayOrder}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 text-sm font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
              >
                Phần tiếp theo <ArrowRight aria-hidden="true" size={18} />
              </Link>
            ) : null}
          </nav>
        </article>
      </div>

      {lessonCompleted ? (
        <section className="rounded-2xl bg-[var(--foreground)] p-6 text-white sm:p-8">
          <p className="font-semibold text-[#aebfff]">Bài học đã hoàn thành</p>
          <h2 className="mt-2 text-2xl font-bold text-pretty">
            Bạn đã hoàn thành tất cả phần bắt buộc.
          </h2>
          {nextLesson ? (
            <Link
              href={nextLesson.href}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[#eef2ff] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--foreground)] focus-visible:outline-none"
            >
              Bài tiếp theo: {nextLesson.title}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          ) : (
            <p className="mt-4 text-[#d9e0ef]">
              Bạn đã hoàn thành toàn bộ bài học hiện có.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
