import {
  ArrowRight,
  Clock3,
  FileCheck2,
  Sparkles,
  ChartNoAxesCombined,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatMockSessionStatus } from "@/features/mock-tests/model";
import type { MockCatalogItem } from "@/features/mock-tests/server/content";

export function MockTestCatalog({ tests }: { tests: MockCatalogItem[] }) {
  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Widget */}
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-black tracking-wider text-white uppercase shadow-sm">
              EXAM READINESS ENGINE
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Sparkles size={14} className="text-indigo-400" /> AI Model v4.2
              Active
            </span>
          </div>
          <h1 className="mb-2 text-2xl font-black text-slate-800">
            Mock Exam Arena
          </h1>
          <p className="text-sm leading-relaxed font-medium text-slate-600">
            Simulate official testing conditions with AI-powered proctoring,
            instant band scoring, and deeply analytical performance breakdowns.
          </p>
        </div>

        {/* Quick Stats Widget */}
        <div className="relative flex shrink-0 gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="pointer-events-none absolute top-0 right-0 p-3 opacity-5">
            <ChartNoAxesCombined size={80} className="text-indigo-900" />
          </div>
          <div className="relative z-10">
            <p className="mb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
              Recent Band
            </p>
            <p className="mb-1 text-2xl font-black text-indigo-600">
              7.5{" "}
              <span className="text-sm font-bold text-emerald-500">+0.5</span>
            </p>
            <p className="text-xs font-semibold text-slate-500">
              IELTS Academic
            </p>
          </div>
          <div className="relative z-10 w-px bg-slate-100" />
          <div className="relative z-10">
            <p className="mb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
              Completed
            </p>
            <p className="mb-1 text-2xl font-black text-slate-800">12</p>
            <p className="text-xs font-semibold text-slate-500">Total Tests</p>
          </div>
          <div className="relative z-10 w-px bg-slate-100" />
          <div className="relative z-10">
            <p className="mb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
              AI Predict
            </p>
            <p className="mb-1 text-2xl font-black text-indigo-600">
              8.0 Target
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Confidence 94%
            </p>
          </div>
        </div>
      </section>

      {/* Modes Grid */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          <button className="shrink-0 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-md">
            All Formats
          </button>
          <button className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
            IELTS Academic
          </button>
          <button className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
            IELTS General
          </button>
          <button className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
            TOEIC
          </button>
          <button className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
            VSTEP
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Timed Mode Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-indigo-50 opacity-50 transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                <Clock3 size={24} />
              </div>
              <h2 className="mb-2 text-[11px] font-black tracking-widest text-indigo-600 uppercase">
                Timed & Proctored
              </h2>
              <h3 className="mb-4 text-xl font-bold text-slate-800">
                Full Mock Exam Mode
              </h3>
              <p className="mb-8 min-h-[4.5rem] text-sm leading-relaxed font-medium text-slate-600">
                Experience exact test duration, strict section pacing, AI webcam
                focus monitoring, and a comprehensive band score upon
                completion.
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <Clock3 size={16} /> 2h 45m average
                </span>
                <Button className="h-11 rounded-full bg-indigo-600 px-6 font-bold text-white shadow-md transition-transform hover:bg-indigo-700 active:scale-95">
                  Start Full Exam <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Targeted Practice Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-slate-100 opacity-50 transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg">
                <FileCheck2 size={24} />
              </div>
              <h2 className="mb-2 text-[11px] font-black tracking-widest text-indigo-600 uppercase">
                Targeted Practice
              </h2>
              <h3 className="mb-4 text-xl font-bold text-slate-800">
                Skill Simulation Mode
              </h3>
              <p className="mb-8 min-h-[4.5rem] text-sm leading-relaxed font-medium text-slate-600">
                Focus on weak areas. Isolate Listening, Reading, Writing, or
                Speaking modules with adaptive question difficulty and live AI
                hints.
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <Sparkles size={16} /> Flexible duration
                </span>
                <Button className="h-11 rounded-full bg-indigo-600 px-6 font-bold text-white shadow-md transition-transform hover:bg-indigo-700 active:scale-95">
                  Launch Skill Sim <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Papers Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Available Test Papers
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Select an exam paper to begin testing or review previous
              submission archives.
            </p>
          </div>
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Sort by: Recommended</option>
            <option>Sort by: Newest</option>
            <option>Sort by: Difficulty</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.slug}
              className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black tracking-wider text-indigo-700 uppercase">
                  {test.testType}
                </span>
                <span className="flex items-center gap-1 rounded-lg border border-orange-100 bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600 uppercase">
                  🔥 {test.difficulty}
                </span>
              </div>

              <h4 className="mb-2 text-lg font-bold text-slate-800">
                {test.title}
              </h4>
              <p className="mb-6 line-clamp-2 flex-1 text-sm leading-relaxed font-medium text-slate-500">
                {test.description}
              </p>

              <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4">
                <div className="text-center">
                  <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                    Duration
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {test.estimatedMinutes}m
                  </p>
                </div>
                <div className="border-r border-l border-slate-200 text-center">
                  <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                    Questions
                  </p>
                  <p className="text-sm font-black text-slate-800">40 Qs</p>
                </div>
                <div className="text-center">
                  <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                    Attempts
                  </p>
                  <p className="text-sm font-black text-indigo-600">1,420</p>
                </div>
              </div>

              {test.activeSessionStatus ? (
                <p className="mb-4 rounded-md bg-indigo-50 py-1.5 text-center text-xs font-bold text-indigo-600">
                  {formatMockSessionStatus(test.activeSessionStatus)}
                </p>
              ) : null}

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Review Solution
                </Button>
                <Button
                  asChild
                  className="h-11 flex-1 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Link href={`/mock-tests/${test.slug}`}>
                    {test.activeSessionId ? "Resume" : "Take Test"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {/* Hardcoded mock items for visual matching with screenshot if not enough real tests */}
          {tests.length < 3 && (
            <>
              <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black tracking-wider text-indigo-700 uppercase">
                    TOEIC
                  </span>
                  <span className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 uppercase">
                    📈 Intermediate
                  </span>
                </div>
                <h4 className="mb-2 text-lg font-bold text-slate-800">
                  TOEIC Full Simulation Test 04
                </h4>
                <p className="mb-6 flex-1 text-sm leading-relaxed font-medium text-slate-500">
                  Complete Listening and Reading sections modeled precisely
                  after...
                </p>
                <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4">
                  <div className="text-center">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                      Duration
                    </p>
                    <p className="text-sm font-black text-slate-800">120m</p>
                  </div>
                  <div className="border-r border-l border-slate-200 text-center">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                      Questions
                    </p>
                    <p className="text-sm font-black text-slate-800">200 Qs</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                      Attempts
                    </p>
                    <p className="text-sm font-black text-indigo-600">2,850</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Review Solution
                  </Button>
                  <Button className="h-11 flex-1 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
                    Resume
                  </Button>
                </div>
              </div>
              <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black tracking-wider text-indigo-700 uppercase">
                    IELTS GENERAL
                  </span>
                  <span className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 uppercase">
                    ✅ Standard
                  </span>
                </div>
                <h4 className="mb-2 text-lg font-bold text-slate-800">
                  IELTS General Training Mock 02
                </h4>
                <p className="mb-6 flex-1 text-sm leading-relaxed font-medium text-slate-500">
                  Tailored for migration and workplace proficiency with...
                </p>
                <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4">
                  <div className="text-center">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                      Duration
                    </p>
                    <p className="text-sm font-black text-slate-800">150m</p>
                  </div>
                  <div className="border-r border-l border-slate-200 text-center">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                      Questions
                    </p>
                    <p className="text-sm font-black text-slate-800">40 Qs</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                      Attempts
                    </p>
                    <p className="text-sm font-black text-indigo-600">930</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Review Solution
                  </Button>
                  <Button className="h-11 flex-1 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
                    Take Test
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
