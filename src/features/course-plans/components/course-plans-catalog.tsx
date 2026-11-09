"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Users,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { getLevelBadge, type CoursePlan } from "../model";

export function CoursePlansCatalog({ plans }: { plans: CoursePlan[] }) {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const activePlanSlug = "stage-1-foundation";

  const filteredPlans = plans.filter((plan) => {
    const matchesLevel =
      selectedLevel === "all" || plan.level === selectedLevel;
    const matchesSearch =
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="animate-in fade-in space-y-10 duration-300">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-800 p-8 text-white shadow-xl sm:p-12">
        <div className="pointer-events-none absolute -right-12 -bottom-12 opacity-10">
          <GraduationCap size={320} />
        </div>

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-200 uppercase backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300" /> Course Plans &
              Pathways
            </div>
            <h1 className="text-3xl leading-tight font-black sm:text-5xl">
              Lộ Trình Học Tập Chi Tiết <br />
              <span className="text-amber-300">Chuẩn Khảo Thí Quốc Tế</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              Các kế hoạch khóa học được thiết kế khoa học từng ngày, từng tuần.
              Tự động cá nhân hóa theo trình độ khởi điểm, thời gian rảnh và mục
              tiêu band điểm của bạn.
            </p>
          </div>

          {/* Active Plan Widget */}
          <div className="space-y-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:col-span-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                Lộ trình bạn đang học
              </span>
              <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2 rounded-xl bg-black/20 p-4">
              <span className="block text-xs font-bold text-indigo-200">
                Nền Tảng Ngữ Âm & Từ Vựng
              </span>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Tiến độ: 40%</span>
                <span className="font-bold text-emerald-300">4/10 tuần</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300"
                  style={{ width: "40%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        {/* Level Filters */}
        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          {[
            { id: "all", label: "Tất cả lộ trình" },
            { id: "stage_1", label: "Chặng 1 (0.0-2.5)" },
            { id: "stage_2", label: "Chặng 2 (2.5-3.5)" },
            { id: "stage_3", label: "Chặng 3 (3.5-4.5)" },
            { id: "stage_4", label: "Chặng 4 (4.5-5.5)" },
            { id: "stage_5", label: "Chặng 5 (5.5-6.5)" },
            { id: "stage_6", label: "Chặng 6 (6.5-7.0)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLevel(tab.id)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                selectedLevel === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên lộ trình hoặc mục tiêu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Course Plans Cards Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => {
          const badge = getLevelBadge(plan.level);
          const isActive = activePlanSlug === plan.slug;

          return (
            <article
              key={plan.slug}
              className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-8 ${
                isActive
                  ? "border-2 border-indigo-600 ring-4 ring-indigo-50"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              {isActive && (
                <div className="absolute -top-3.5 right-6 flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold text-white uppercase shadow-sm">
                  <Sparkles size={12} /> Lộ Trình Đang Đăng Ký
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-extrabold ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Clock size={14} className="text-indigo-500" />
                    {plan.durationWeeks} tuần
                  </span>
                </div>

                <div>
                  <h3 className="text-xl leading-snug font-black text-slate-900">
                    {plan.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-indigo-600">
                    {plan.subtitle}
                  </p>
                </div>

                <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                  {plan.description}
                </p>

                {/* Target & Workload Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Mục tiêu
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {plan.targetBand}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Thời lượng/ngày
                    </span>
                    <span className="text-xs font-black text-indigo-600">
                      {plan.recommendedDailyMins} phút/ngày
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2 pt-2">
                  <span className="block text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                    Đặc quyền lộ trình:
                  </span>
                  {plan.highlights.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs font-medium text-slate-700"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Users size={14} className="text-indigo-500" />
                  {plan.enrolledLearnersCount.toLocaleString("en-US")} học viên
                </div>

                <Link
                  href={`/plans/${plan.slug}`}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700"
                >
                  <span>Xem Chi Tiết</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white py-12 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-700">
            Không tìm thấy lộ trình phù hợp.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Hãy thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc trình độ khác.
          </p>
        </div>
      )}
    </div>
  );
}
