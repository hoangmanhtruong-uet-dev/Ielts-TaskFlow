"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  FileCheck2,
  Headphones,
  Mic,
  PenLine,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { startMockTestAction } from "@/features/mock-tests/actions";
import {
  formatMockDuration,
  formatMockSectionType,
} from "@/features/mock-tests/model";
import type { MockTestDetailData } from "@/features/mock-tests/server/content";

const sectionIcons: Record<string, React.ElementType> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

const sectionColors: Record<string, string> = {
  listening: "bg-blue-50 border-blue-100 text-blue-600",
  reading: "bg-emerald-50 border-emerald-100 text-emerald-600",
  writing: "bg-amber-50 border-amber-100 text-amber-600",
  speaking: "bg-rose-50 border-rose-100 text-rose-600",
};

export function MockTestDetail({
  data,
  error,
}: {
  data: MockTestDetailData;
  error?: string;
}) {
  const totalMinutes = data.sections.reduce(
    (acc, s) => acc + Math.ceil(s.timeLimitSeconds / 60),
    0,
  );

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Back link */}
      <Link
        href="/mock-tests"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm transition-colors hover:text-indigo-600"
      >
        <ArrowLeft size={16} /> Back to Exam Arena
      </Link>

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 translate-x-1/3 -translate-y-1/2 rounded-full bg-indigo-50 opacity-60" />
        <div className="relative z-10">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-black tracking-wider text-indigo-700 uppercase">
              {data.version.test_type}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black tracking-wider text-orange-700 uppercase">
              <Zap size={12} /> {data.version.difficulty}
            </span>
          </div>

          <h1 className="mb-3 max-w-2xl text-3xl font-black text-slate-800 sm:text-4xl">
            {data.version.title}
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed font-medium text-slate-500">
            {data.version.description}
          </p>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Clock3 size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Total Time
                </p>
                <p className="text-base font-black text-slate-800">
                  {totalMinutes} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FileCheck2 size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Sections
                </p>
                <p className="text-base font-black text-slate-800">
                  {data.sections.length} Parts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Mode
                </p>
                <p className="text-base font-black text-slate-800">Proctored</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Target size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  AI Scoring
                </p>
                <p className="text-base font-black text-slate-800">
                  Instant Band
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Structure */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-800">
          <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600">
            {data.sections.length}
          </span>
          Exam Structure
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {data.sections.map((section) => {
            const sectionKey = section.type.toLowerCase();
            const Icon = sectionIcons[sectionKey] ?? FileCheck2;
            const colorClass =
              sectionColors[sectionKey] ??
              "bg-slate-50 border-slate-100 text-slate-600";
            return (
              <li
                key={section.id}
                className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${colorClass}`}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[10px] font-black tracking-wider text-indigo-600 uppercase">
                    Section {section.order}
                  </p>
                  <h3 className="mb-1 text-base font-bold text-slate-800">
                    {formatMockSectionType(section.type)}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm leading-relaxed font-medium text-slate-500">
                    {section.title}
                  </p>
                  <p className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                    <Clock3 size={13} />
                    {formatMockDuration(section.timeLimitSeconds)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Error alert */}
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700"
        >
          ⚠️ Chưa thể bắt đầu mock test. Vui lòng thử lại.
        </p>
      ) : null}

      {/* CTA Block */}
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-indigo-600 p-8 shadow-lg shadow-indigo-200 sm:flex-row sm:items-center sm:p-10">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/4 -translate-y-1/3 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 left-20 h-40 w-40 translate-y-1/3 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h2 className="mb-2 text-xl font-black text-white">
            {data.activeSessionId ? "Continue Your Session" : "Ready to Begin?"}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed font-medium text-indigo-200">
            {data.activeSessionId
              ? "Your previous progress has been saved. Pick up right where you left off."
              : "Each section opens in sequence. Strict time limits apply. Your AI band score will be ready upon completion."}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          {data.activeSessionId ? (
            <Button
              asChild
              className="h-14 rounded-2xl bg-white px-8 text-base font-black text-indigo-700 shadow-md transition-transform hover:bg-indigo-50 active:scale-95"
            >
              <Link
                href={`/mock-tests/${data.test.slug}/session/${data.activeSessionId}`}
              >
                Continue Session <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          ) : (
            <form action={startMockTestAction}>
              <input type="hidden" name="mockTestSlug" value={data.test.slug} />
              <Button
                type="submit"
                className="h-14 rounded-2xl bg-white px-8 text-base font-black text-indigo-700 shadow-md transition-transform hover:bg-indigo-50 active:scale-95"
              >
                Start Full Exam <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
