"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Headphones,
  Mic,
  PenLine,
  Search,
} from "lucide-react";

type SkillCategory =
  "all" | "listening" | "reading" | "writing" | "speaking" | "vocabulary";

interface CuratedResource {
  id: string;
  title: string;
  source: string;
  description: string;
  category: Exclude<SkillCategory, "all">;
  level: string;
  href: string;
  isExternal: boolean;
  actionLabel: string;
}

const CURATED_RESOURCES: CuratedResource[] = [
  {
    id: "ielts-org-samples",
    title: "Đề mẫu chính thức IELTS Academic & General Training",
    source: "IELTS.org (Nguồn chính thức)",
    description:
      "Bộ câu hỏi mẫu miễn phí do hội đồng khảo thí công bố cho cả 4 kỹ năng Listening, Reading, Writing và Speaking.",
    category: "reading",
    level: "Band 4.0 - 9.0",
    href: "https://ielts.org/take-a-test/preparation-resources/sample-test-questions",
    isExternal: true,
    actionLabel: "Mở trên IELTS.org",
  },
  {
    id: "british-council-learn",
    title: "British Council LearnEnglish — Kỹ năng & Ngữ pháp",
    source: "British Council",
    description:
      "Bài đọc, bài nghe và luyện tập ngữ pháp phân cấp CEFR A1–C1 công khai miễn phí.",
    category: "listening",
    level: "A1 - C1",
    href: "https://learnenglish.britishcouncil.org/",
    isExternal: true,
    actionLabel: "Truy cập British Council",
  },
  {
    id: "cambridge-dictionary",
    title: "Cambridge Dictionary & Phiên âm Anh–Anh / Anh–Mỹ",
    source: "Cambridge University Press",
    description:
      "Tra cứu nghĩa học thuật, collocation, ví dụ chuẩn xác và audio phát âm bản ngữ.",
    category: "vocabulary",
    level: "Mọi trình độ",
    href: "https://dictionary.cambridge.org/",
    isExternal: true,
    actionLabel: "Mở từ điển",
  },
  {
    id: "indigo-writing-lab",
    title: "Luyện viết IELTS Writing Task 1 & 2 theo 4 tiêu chí",
    source: "Indigo Scholar",
    description:
      "Luyện viết có đồng hồ đếm ngược, lưu nháp tự động và nhận đánh giá theo 4 tiêu chí Task Achievement, Coherence, Lexical, Grammar.",
    category: "writing",
    level: "Band 5.0 - 8.5",
    href: "/practice/writing",
    isExternal: false,
    actionLabel: "Vào phòng luyện viết",
  },
  {
    id: "indigo-dictation-lab",
    title: "Kho bài nghe Chép chính tả (Dictation) có kiểm tra từng từ",
    source: "Indigo Scholar",
    description:
      "Nghe từng câu và so sánh từng từ thiếu/dư theo thời gian thực để cải thiện chính tả và bắt âm nối.",
    category: "listening",
    level: "A2 - C1",
    href: "/dictation",
    isExternal: false,
    actionLabel: "Luyện Dictation",
  },
  {
    id: "indigo-speaking-studio",
    title: "Phòng luyện Speaking 3 phần kèm chuyển giọng nói Whisper",
    source: "Indigo Scholar",
    description:
      "Ghi âm trực tiếp câu trả lời IELTS Speaking, lưu an toàn trên bộ nhớ đám mây và đối chiếu transcript thực tế.",
    category: "speaking",
    level: "Band 5.0 - 8.5",
    href: "/practice/speaking",
    isExternal: false,
    actionLabel: "Vào phòng Speaking",
  },
  {
    id: "indigo-vocab-vault",
    title: "Sổ tay Từ vựng & Ôn tập Spaced Repetition",
    source: "Indigo Scholar",
    description:
      "Tổng hợp từ vựng bạn đã lưu trong bài đọc/bài nghe để ôn tập theo chu kỳ trí nhớ.",
    category: "vocabulary",
    level: "Cá nhân hóa",
    href: "/learn/vocabulary",
    isExternal: false,
    actionLabel: "Mở kho từ vựng",
  },
  {
    id: "indigo-error-notebook",
    title: "Sổ ghi nhận lỗi sai từ bài làm thực tế",
    source: "Indigo Scholar",
    description:
      "Rà soát lại những câu đã trả lời sai trong các phiên luyện Reading & Listening để tránh lặp lỗi.",
    category: "reading",
    level: "Cá nhân hóa",
    href: "/error-notebook",
    isExternal: false,
    actionLabel: "Xem lỗi đã ghi nhận",
  },
];

const CATEGORY_TABS: { id: SkillCategory; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "listening", label: "Listening" },
  { id: "reading", label: "Reading" },
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking" },
  { id: "vocabulary", label: "Vocabulary" },
];

function CategoryIcon({ category }: { category: CuratedResource["category"] }) {
  if (category === "listening")
    return <Headphones className="size-4 text-sky-600" />;
  if (category === "writing")
    return <PenLine className="size-4 text-emerald-600" />;
  if (category === "speaking") return <Mic className="size-4 text-amber-600" />;
  if (category === "vocabulary")
    return <Compass className="size-4 text-purple-600" />;
  return <BookOpen className="size-4 text-indigo-600" />;
}

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SkillCategory>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CURATED_RESOURCES.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Thư viện Học liệu Chính thức &amp; Công cụ Thực hành
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Tuyển chọn nguồn học liệu mở chính thức từ hội đồng khảo thí quốc
              tế và các module luyện tập trên Indigo Scholar — tôn trọng bản
              quyền, hoàn toàn miễn phí.
            </p>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tài liệu hoặc công cụ..."
              aria-label="Tìm kiếm tài liệu"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 transition-colors outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:w-72"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                category === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 text-sm text-slate-700">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-indigo-600" />
        <p className="leading-relaxed">
          Indigo Scholar không lưu trữ hoặc phân phối lại sách bản quyền trái
          phép. Các tài liệu bên ngoài dẫn trực tiếp về trang chính thức của
          IELTS.org, British Council và Cambridge Dictionary.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-base font-bold text-slate-800">
            Không tìm thấy tài liệu phù hợp
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Hãy thử từ khóa khác hoặc chọn bộ lọc &quot;Tất cả&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  <CategoryIcon category={item.category} />
                  {item.source}
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {item.level}
                </span>
              </div>

              <h2 className="mb-2 text-base font-bold text-slate-900">
                {item.title}
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>

              <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
                {item.isExternal ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                  >
                    {item.actionLabel}
                    <ArrowUpRight className="size-4" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    {item.actionLabel}
                    <ArrowUpRight className="size-4" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
