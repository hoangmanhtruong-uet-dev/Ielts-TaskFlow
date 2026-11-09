"use client";

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Headphones,
  Lightbulb,
  PenLine,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { ErrorNotebookEntry, ErrorNotebookSkill } from "../api/actions";

const SKILL_ICON_MAP: Record<ErrorNotebookSkill, React.ElementType> = {
  Reading: BookOpen,
  Listening: Headphones,
  Vocabulary: Sparkles,
  Grammar: PenLine,
};

const SKILL_FILTERS: ErrorNotebookSkill[] = [
  "Reading",
  "Listening",
  "Vocabulary",
  "Grammar",
];

export default function ErrorNotebookClient({
  initialEntries,
}: {
  initialEntries: ErrorNotebookEntry[];
}) {
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    initialEntries[0] ? [initialEntries[0].id] : [],
  );
  const [activeSkillFilter, setActiveSkillFilter] =
    useState<ErrorNotebookSkill | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const noteInputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const filteredEntries = useMemo(
    () =>
      initialEntries.filter((entry) => {
        if (activeSkillFilter && entry.skill !== activeSkillFilter)
          return false;
        if (statusFilter === "Repeat" && entry.failCount < 2) return false;
        if (statusFilter === "Single" && entry.failCount > 1) return false;
        return true;
      }),
    [initialEntries, activeSkillFilter, statusFilter],
  );

  const weakSpots = useMemo(() => {
    if (initialEntries.length === 0) return [];
    const counts = new Map<string, number>();
    for (const entry of initialEntries) {
      counts.set(
        entry.questionTypeLabel,
        (counts.get(entry.questionTypeLabel) ?? 0) + 1,
      );
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count], index) => {
        const rate = Math.round((count / initialEntries.length) * 100);
        const color =
          index === 0
            ? "bg-rose-500"
            : index === 1
              ? "bg-orange-400"
              : "bg-indigo-500";
        return { topic, count, rate, color };
      });
  }, [initialEntries]);

  const [mountNowMs] = useState(() => Date.now());
  const weeklyStats = useMemo(() => {
    const sevenDaysAgo = mountNowMs - 7 * 86_400_000;
    const recentCount = initialEntries.filter(
      (entry) => new Date(entry.createdAtIso).getTime() >= sevenDaysAgo,
    ).length;
    const repeatedCount = initialEntries.filter(
      (entry) => entry.failCount >= 2,
    ).length;
    return {
      total: initialEntries.length,
      recentCount,
      repeatedCount,
    };
  }, [initialEntries, mountNowMs]);

  const primaryRetryHref = initialEntries[0]?.retryHref ?? "/learn";

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-slate-800">
            Sổ tay lỗi sai
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Tổng hợp những câu bạn trả lời chưa đúng từ các phiên luyện Reading,
            Listening, Vocabulary &amp; Grammar.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="text-center">
            <p className="text-3xl leading-none font-black text-indigo-600">
              {initialEntries.length}
            </p>
            <p className="mt-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              Câu cần xem lại
            </p>
          </div>
          <Link
            href={primaryRetryHref}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            {initialEntries.length > 0
              ? "Luyện lại bài gần nhất"
              : "Vào thư viện học"}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Filters + Cards */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                Kỹ năng:
              </span>
              {SKILL_FILTERS.map((skill) => {
                const active = activeSkillFilter === skill;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setActiveSkillFilter(active ? null : skill)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                      active
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-300 ring-offset-1"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label
                htmlFor="error-notebook-status-filter"
                className="text-[10px] font-black tracking-widest text-slate-500 uppercase"
              >
                Tần suất:
              </label>
              <select
                id="error-notebook-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="All">Tất cả</option>
                <option value="Repeat">Sai từ 2 lần</option>
                <option value="Single">Mới sai 1 lần</option>
              </select>
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-5">
            {filteredEntries.map((entry, index) => {
              const isExpanded = expandedIds.includes(entry.id);
              const SkillIcon = SKILL_ICON_MAP[entry.skill];
              const noteId = `error-note-${entry.id}`;

              return (
                <article
                  key={entry.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-sm font-black text-indigo-600">
                        {index + 1}
                      </span>
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${entry.skillColor}`}
                        >
                          <SkillIcon size={13} aria-hidden="true" />
                          {entry.skill}
                        </span>
                        <span className="truncate text-sm font-bold text-slate-800">
                          {entry.source}
                        </span>
                      </div>
                      <span className="hidden shrink-0 text-xs font-medium text-slate-500 sm:inline">
                        {entry.savedOn}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`hidden items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold sm:flex ${entry.failColor}`}
                      >
                        <AlertTriangle size={12} aria-hidden="true" />
                        {entry.failLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExpand(entry.id)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? "Thu gọn chi tiết lỗi"
                            : "Mở rộng chi tiết lỗi"
                        }
                        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="space-y-5 px-6 py-5">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                          {entry.questionTypeLabel}
                        </p>
                        <p className="text-sm leading-relaxed font-semibold text-slate-800">
                          {entry.question}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-rose-600 uppercase">
                            <XCircle size={12} aria-hidden="true" />
                            Câu trả lời của bạn
                          </p>
                          <p className="text-sm leading-relaxed font-medium text-rose-900">
                            {entry.yourAnswer}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-indigo-700 uppercase">
                            <Sparkles size={12} aria-hidden="true" />
                            Xem đáp án &amp; giải thích chính thức
                          </p>
                          <p className="text-sm leading-relaxed text-slate-700">
                            Mở trang kết quả phiên làm bài để xem đáp án chuẩn
                            và giải thích chi tiết (khi bộ đề cho phép review).
                          </p>
                          <Link
                            href={entry.reviewHref}
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline"
                          >
                            Mở trang đối chiếu đáp án
                            <ArrowRight size={13} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={noteId}
                          className="mb-2 block text-[10px] font-black tracking-widest text-slate-500 uppercase"
                        >
                          Ghi chú nháp trong phiên xem lại
                        </label>
                        <textarea
                          id={noteId}
                          ref={(node) => {
                            if (node) {
                              noteInputRefs.current.set(entry.id, node);
                            } else {
                              noteInputRefs.current.delete(entry.id);
                            }
                          }}
                          rows={2}
                          placeholder="Ghi lại lý do nhầm lẫn để tránh lặp lỗi..."
                          value={notes[entry.id] ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({
                              ...prev,
                              [entry.id]: e.target.value,
                            }))
                          }
                          className="w-full resize-none rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950 placeholder:text-amber-700/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={entry.retryHref}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:text-indigo-600"
                          >
                            <RotateCcw size={14} aria-hidden="true" />
                            Làm lại bài này
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              noteInputRefs.current.get(entry.id)?.focus()
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:text-indigo-600"
                          >
                            <FileEdit size={14} aria-hidden="true" />
                            Thêm ghi chú
                          </button>
                        </div>
                        <span
                          className={`text-xs font-black ${entry.statusColor}`}
                        >
                          {entry.status === "Needs Practice"
                            ? "Cần luyện lại"
                            : "Mới phát hiện"}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}

            {filteredEntries.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <Brain
                  size={44}
                  className="mx-auto mb-4 text-slate-300"
                  aria-hidden="true"
                />
                <p className="text-lg font-bold text-slate-800">
                  {initialEntries.length === 0
                    ? "Chưa có câu làm sai nào được ghi nhận"
                    : "Không có mục nào khớp bộ lọc"}
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                  {initialEntries.length === 0
                    ? "Hoàn thành các bài luyện Reading, Listening, Vocabulary hoặc Grammar để hệ thống tự động lưu các câu chưa đúng tại đây."
                    : "Thử bỏ chọn bộ lọc kỹ năng hoặc đổi tần suất hiển thị."}
                </p>
                {initialEntries.length === 0 ? (
                  <Link
                    href="/learn"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                  >
                    Đi tới thư viện học
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 font-black text-slate-800">
              <Target size={18} className="text-rose-500" aria-hidden="true" />
              Nhóm dạng bài hay sai nhất
            </h2>
            <p className="mb-5 text-xs font-medium text-slate-500">
              Tính theo tỷ trọng từ dữ liệu làm bài thực tế của bạn.
            </p>

            {weakSpots.length === 0 ? (
              <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                Chưa có thống kê dạng bài sai. Hãy làm một bài luyện tập trước.
              </p>
            ) : (
              <div className="space-y-4">
                {weakSpots.map((spot) => (
                  <div key={spot.topic}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-700">
                        {spot.topic}
                      </p>
                      <p className="shrink-0 text-xs font-black text-slate-600">
                        {spot.count} câu ({spot.rate}%)
                      </p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${spot.color}`}
                        style={{ width: `${spot.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-indigo-700 p-6 shadow-md">
            <div className="relative z-10">
              <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-white/10">
                <Lightbulb
                  size={20}
                  className="text-amber-300"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mb-2 text-lg font-black text-white">
                Ôn tập chủ động sau khi làm bài
              </h2>
              <p className="text-sm leading-relaxed font-medium text-indigo-100">
                Xem lại những câu sai trong vòng 24 giờ giúp giảm tỷ lệ lặp lỗi
                ở các dạng True/False/Not Given và điền từ Listening.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-black text-slate-800">
              <Brain size={18} className="text-indigo-500" aria-hidden="true" />
              Tổng quan của bạn
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                <p className="text-2xl font-black text-indigo-600">
                  {weeklyStats.total}
                </p>
                <p className="mt-1 text-[9px] font-bold text-slate-500 uppercase">
                  Tổng lỗi
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                <p className="text-2xl font-black text-amber-600">
                  {weeklyStats.recentCount}
                </p>
                <p className="mt-1 text-[9px] font-bold text-slate-500 uppercase">
                  7 ngày qua
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                <p className="text-2xl font-black text-rose-600">
                  {weeklyStats.repeatedCount}
                </p>
                <p className="mt-1 text-[9px] font-bold text-slate-500 uppercase">
                  Lặp &ge; 2 lần
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
