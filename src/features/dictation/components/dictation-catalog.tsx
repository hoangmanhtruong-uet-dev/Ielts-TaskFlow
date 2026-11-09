"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Headphones,
  Search,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { DictationDifficulty, DictationExercise } from "../model";

export function DictationCatalog({
  items,
  averageAccuracy = null,
}: {
  items: DictationExercise[];
  averageAccuracy?: number | null;
}) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesDifficulty =
      selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: DictationDifficulty) => {
    switch (difficulty) {
      case "beginner":
        return (
          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Beginner (Cơ bản)
          </span>
        );
      case "intermediate":
        return (
          <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
            Intermediate (Trung cấp)
          </span>
        );
      case "advanced":
        return (
          <span className="rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
            Advanced (Nâng cao)
          </span>
        );
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-8 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-10">
          <Mic size={280} />
        </div>

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300" /> Dictation
              Practice Mode
            </div>
            <h1 className="text-3xl leading-tight font-black sm:text-4xl">
              Luyện Nghe Chép Chính Tả <br />
              <span className="text-amber-200">Dictation Mastery</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-amber-100/90 sm:text-base">
              Phương pháp luyện phản xạ tai nghe 100% chính xác từng từ. Nghe
              câu ngắn, chép lại và nhận phản hồi chi tiết từ hệ thống so sánh
              từ vựng tự động.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:col-span-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-amber-200 uppercase">
                Thống kê cá nhân
              </span>
              <Flame size={18} className="fill-amber-300 text-amber-300" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-black/20 p-3">
                <span className="block text-2xl font-black text-white">
                  {items.length}
                </span>
                <span className="text-[11px] font-semibold text-amber-100">
                  Bài dictation
                </span>
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                <span className="block text-2xl font-black text-amber-300">
                  {averageAccuracy !== null ? `${averageAccuracy}%` : "—"}
                </span>
                <span className="text-[11px] font-semibold text-amber-100">
                  Độ chính xác trung bình
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Controls & Search Filter */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        {/* Difficulty Filter Tabs */}
        <div className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          {[
            { id: "all", label: "Tất cả bài" },
            { id: "beginner", label: "Beginner" },
            { id: "intermediate", label: "Intermediate" },
            { id: "advanced", label: "Advanced" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDifficulty(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                selectedDifficulty === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên bài hoặc chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs font-medium transition-all focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Dictation Exercise Catalog Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredItems.map((item) => (
          <article
            key={item.slug}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-xl"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-extrabold tracking-wider text-amber-600 uppercase">
                  {item.category}
                </span>
                {getDifficultyBadge(item.difficulty)}
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                {item.title}
              </h3>
              <p className="mb-6 line-clamp-2 text-xs leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Headphones size={15} className="text-amber-500" />
                  {item.sentences.length} câu chép chính tả
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-500" />~
                  {Math.ceil(item.durationSeconds / 60)} phút
                </span>
              </div>

              <Link
                href={`/practice/listening/dictation/${item.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all group-hover:scale-[1.01] hover:from-amber-600 hover:to-orange-700"
              >
                <span>Bắt đầu chép chính tả</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white py-12 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-700">
            Không tìm thấy bài dictation phù hợp.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Thử đổi từ khóa hoặc bộ lọc độ khó.
          </p>
        </div>
      )}
    </div>
  );
}
