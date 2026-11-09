"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./learn.css";

export interface LearnItem {
  id: string;
  sec: "skills" | "more" | "found";
  cat: string[];
  ic: string;
  a: string;
  tag: string;
  ai?: boolean;
  title: string;
  desc: string;
  meta: string;
  href: string;
  p: number;
}

export interface LearnSection {
  id: string;
  title: string;
  sub: string;
  cls: string;
  isHorizontal: boolean;
}

const DEFAULT_ITEMS: LearnItem[] = [
  {
    id: "li",
    sec: "skills",
    cat: ["skill"],
    ic: "Li",
    a: "#8B8FFF",
    tag: "CHUẨN FORMAT THI",
    title: "Listening Practice",
    desc: "Luyện nghe audio bản xứ, chỉnh tốc độ, bài tập điền từ và trắc nghiệm kèm transcript tương tác sau khi nộp.",
    meta: "4 Parts • 25m",
    href: "/practice/listening",
    p: 0,
  },
  {
    id: "re",
    sec: "skills",
    cat: ["skill"],
    ic: "Re",
    a: "#5EE0A0",
    tag: "READING ACADEMIC",
    title: "Reading Practice",
    desc: "Kho bài đọc chuẩn đề thi thật, tra từ một chạm, highlight dẫn chứng và phân tích đáp án chi tiết.",
    meta: "3 Passages • 60m",
    href: "/practice/reading",
    p: 0,
  },
  {
    id: "wr",
    sec: "skills",
    cat: ["skill"],
    ic: "Wr",
    a: "#F5B73D",
    tag: "AI POWERED",
    ai: true,
    title: "Writing Practice",
    desc: "Luyện Task 1 và Task 2 có đếm từ tự động, gợi ý dàn ý, lưu nháp liên tục và AI chấm chi tiết theo 4 tiêu chí.",
    meta: "Task 1 & 2 • 60m",
    href: "/practice/writing",
    p: 0,
  },
  {
    id: "sp",
    sec: "skills",
    cat: ["skill"],
    ic: "Sp",
    a: "#4BB3FF",
    tag: "AI POWERED",
    ai: true,
    title: "Speaking AI Practice",
    desc: "Luyện nói 1:1 với AI, chấm phát âm IPA, độ trôi chảy và phản xạ câu hỏi Part 1-3.",
    meta: "Part 1-3 • 15m",
    href: "/practice/speaking",
    p: 0,
  },
  {
    id: "mt",
    sec: "more",
    cat: ["mock"],
    ic: "Mt",
    a: "#A9B1E8",
    tag: "FULL TEST",
    title: "Thi thử (Mock Test Room)",
    desc: "Mô phỏng giao diện thi trên máy tính (Computer-delivered IELTS) chuẩn IDP/BC, chia đôi màn hình, highlight và ghi chú.",
    meta: "4 Skills • 3h",
    href: "/mock-tests",
    p: 0,
  },
  {
    id: "er",
    sec: "more",
    cat: ["mine"],
    ic: "!",
    a: "#FF6A82",
    tag: "SMART LOG",
    title: "Sổ tay lỗi sai",
    desc: "Tự động gom các câu làm sai, phân loại theo dạng bài và gợi ý bài tập khắc phục điểm yếu.",
    meta: "Tổng hợp từ bài làm",
    href: "/error-notebook",
    p: 0,
  },
  {
    id: "vo",
    sec: "found",
    cat: ["found", "mine"],
    ic: "Aa",
    a: "#FF8FA3",
    tag: "OXFORD 3000/5000",
    title: "Vocabulary Foundation",
    desc: "Bộ từ vựng học thuật theo chủ đề, ví dụ ngữ cảnh, phát âm chuẩn IPA và bài tập phản xạ.",
    meta: "Kho từ vựng cá nhân",
    href: "/learn/vocabulary",
    p: 0,
  },
  {
    id: "gr",
    sec: "found",
    cat: ["found"],
    ic: "Gr",
    a: "#B9A4FF",
    tag: "IELTS & GIAO TIẾP",
    title: "Grammar Intensive",
    desc: "Hệ thống ngữ pháp trọng tâm, phân tích lỗi sai kinh điển và bài tập ứng dụng tự động chấm.",
    meta: "Ngữ pháp trọng tâm",
    href: "/learn/grammar",
    p: 0,
  },
  {
    id: "mod-foundations",
    sec: "found",
    cat: ["found"],
    ic: "F1",
    a: "#5EE0A0",
    tag: "MODULE 1 • 5 LESSONS",
    title: "IELTS Foundations & Test Architecture",
    desc: "Cấu trúc 4 kỹ năng Cambridge, phân tích tiêu chí Band Descriptors, quản lý thời gian thi máy và kỹ thuật Skimming/Scanning.",
    meta: "5 Bài học • 120m",
    href: "/learn/ielts-foundations",
    p: 0,
  },
  {
    id: "mod-grammar",
    sec: "found",
    cat: ["found"],
    ic: "G2",
    a: "#B9A4FF",
    tag: "MODULE 2 • 5 LESSONS",
    title: "Academic Grammar Mastery",
    desc: "Hòa hợp chủ-vị phức tạp, câu phức & mệnh đề quan hệ rút gọn, thể bị động học thuật, cấu trúc đảo ngữ C1/C2 và liên từ Cohesion.",
    meta: "5 Bài học • 150m",
    href: "/learn/academic-grammar",
    p: 0,
  },
  {
    id: "mod-vocab",
    sec: "found",
    cat: ["found"],
    ic: "V3",
    a: "#FF8FA3",
    tag: "MODULE 3 • 5 LESSONS",
    title: "Essential Academic Vocabulary & Collocations",
    desc: "Từ vựng học thuật C1/C2 theo 4 chủ đề lớn: Môi trường, Smart Cities, AI trong giáo dục, Xã hội toàn cầu hóa và nghệ thuật Paraphrase.",
    meta: "5 Bài học • 150m",
    href: "/learn/academic-vocabulary",
    p: 0,
  },
  {
    id: "mod-strategies",
    sec: "found",
    cat: ["found"],
    ic: "S4",
    a: "#F5B73D",
    tag: "MODULE 4 • 5 LESSONS",
    title: "Core Exam Strategies & Trap Avoidance",
    desc: "Chiến thuật thực chiến: Giải mã bẫy True/False/Not Given, Matching Headings, bẫy Distractor Listening, dàn ý Task 2 và Fluency Speaking.",
    meta: "5 Bài học • 140m",
    href: "/learn/core-strategies",
    p: 0,
  },
];

const SECTIONS: LearnSection[] = [
  {
    id: "skills",
    title: "Bốn kỹ năng IELTS",
    sub: "Nghe, đọc, viết, nói",
    cls: "four",
    isHorizontal: false,
  },
  {
    id: "more",
    title: "Thi thử và ôn lỗi sai",
    sub: "Kiểm tra và lấp lỗ hổng",
    cls: "two",
    isHorizontal: true,
  },
  {
    id: "found",
    title: "Nền tảng",
    sub: "Từ vựng và ngữ pháp",
    cls: "two",
    isHorizontal: true,
  },
];

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "skill", label: "4 Kỹ năng IELTS" },
  { key: "found", label: "Nền tảng Từ vựng & Ngữ pháp" },
  { key: "mock", label: "Thi thử" },
  { key: "mine", label: "Kho của tôi" },
];

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "doing", label: "Đang học" },
  { key: "new", label: "Chưa bắt đầu" },
  { key: "ai", label: "Có AI chấm" },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export interface LearnClientProps {
  continueLesson?: {
    title: string;
    subtitle?: string;
    progressPercent: number;
    href: string;
  };
  initialItems?: LearnItem[];
}

export function LearnClient({
  continueLesson,
  initialItems = DEFAULT_ITEMS,
}: LearnClientProps) {
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") || "all";
  const urlFilter = searchParams.get("f") || "all";
  const urlQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState(urlTab);
  const [activeFilter, setActiveFilter] = useState(urlFilter);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [menuOpen, setMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  // Sync state with URL params
  const updateUrl = useCallback((tab: string, f: string, q: string) => {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    if (f !== "all") params.set("f", f);
    if (q.trim()) params.set("q", q.trim());
    const queryStr = params.toString();
    const newPath = queryStr ? `/learn?${queryStr}` : "/learn";
    window.history.replaceState(null, "", newPath);
  }, []);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    updateUrl(tabKey, activeFilter, searchQuery);
  };

  const handleFilterChange = (filterKey: string) => {
    setActiveFilter(filterKey);
    setMenuOpen(false);
    updateUrl(activeTab, filterKey, searchQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrl(activeTab, activeFilter, val);
  };

  const handleResetFilters = () => {
    setActiveTab("all");
    setActiveFilter("all");
    setSearchQuery("");
    setMenuOpen(false);
    updateUrl("all", "all", "");
    searchInputRef.current?.focus();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setMenuOpen(false);
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close filter menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterWrapRef.current &&
        !filterWrapRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter helper functions
  const checkFilter = useCallback((item: LearnItem, f: string) => {
    if (f === "all") return true;
    if (f === "doing") return item.p > 0 && item.p < 100;
    if (f === "new") return item.p === 0;
    if (f === "ai") return Boolean(item.ai);
    return true;
  }, []);

  const checkQuery = useCallback((item: LearnItem, q: string) => {
    if (!q) return true;
    const normQ = normalize(q);
    const target = normalize(
      `${item.title} ${item.desc} ${item.tag} ${item.meta}`,
    );
    return target.includes(normQ);
  }, []);

  const checkTab = useCallback((item: LearnItem, t: string) => {
    if (t === "all") return true;
    return item.cat.includes(t);
  }, []);

  // Count items for each tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of TABS) {
      counts[tab.key] = initialItems.filter(
        (it) =>
          checkTab(it, tab.key) &&
          checkFilter(it, activeFilter) &&
          checkQuery(it, searchQuery),
      ).length;
    }
    return counts;
  }, [
    initialItems,
    activeFilter,
    searchQuery,
    checkTab,
    checkFilter,
    checkQuery,
  ]);

  // Filtered visible items
  const visibleItems = useMemo(() => {
    return initialItems.filter(
      (it) =>
        checkTab(it, activeTab) &&
        checkFilter(it, activeFilter) &&
        checkQuery(it, searchQuery),
    );
  }, [
    initialItems,
    activeTab,
    activeFilter,
    searchQuery,
    checkTab,
    checkFilter,
    checkQuery,
  ]);

  // Continue lesson values
  const continueTitle =
    continueLesson?.title || "Tiếp tục lộ trình IELTS của bạn";
  const continueProgress = continueLesson?.progressPercent ?? 0;
  const continueHref = continueLesson?.href || "/practice/listening";

  return (
    <div className="learn-scope">
      <div className="wrap">
        {/* Page Head */}
        <div className="pagehead">
          <h1>Thư viện học</h1>
          <p>Chọn một kỹ năng để luyện, hoặc làm tiếp bài đang dở.</p>
        </div>

        {/* Continue Hero Banner */}
        <section className="cont" aria-label="Tiếp tục bài học dở gần nhất">
          <div>
            <small>Tiếp tục học</small>
            <h2>{continueTitle}</h2>
            <div className="cbar">
              <span>Tiến độ {continueProgress}%</span>
              <div
                className="t"
                role="progressbar"
                aria-valuenow={continueProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Tiến độ bài học: ${continueProgress}%`}
              >
                <i style={{ width: `${continueProgress}%` }} />
              </div>
            </div>
          </div>
          <Link href={continueHref} prefetch={false} className="go">
            Làm tiếp ngay
          </Link>
        </section>

        {/* Sticky Toolbar */}
        <div className="tools">
          <div className="bar">
            {/* Search Bar */}
            <label className="search" htmlFor="learn-search-input">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="learn-search-input"
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm bài luyện, kỹ năng..."
                autoComplete="off"
                aria-label="Tìm kiếm bài luyện hoặc kỹ năng"
              />
              <kbd aria-hidden="true">/</kbd>
            </label>

            {/* Filter Dropdown */}
            <div className="fwrap" ref={filterWrapRef}>
              <button
                type="button"
                className="fbtn"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5h18l-7 8v6l-4 2v-8z" />
                </svg>
                <span>Lọc kết quả</span>
                {activeFilter !== "all" ? <b id="fcount">1</b> : null}
              </button>

              <div
                className="menu"
                hidden={!menuOpen}
                role="menu"
                aria-label="Tùy chọn lọc bài học"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={activeFilter === f.key}
                    onClick={() => handleFilterChange(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="tabs"
            role="tablist"
            aria-label="Phân loại kỹ năng học"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.key;
              const count = tabCounts[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className="tab"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Output */}
        <div id="out">
          {visibleItems.length === 0 ? (
            <div className="empty">
              <h2>Không tìm thấy bài nào</h2>
              <p>
                {searchQuery
                  ? `Không có kết quả cho "${searchQuery}".`
                  : "Không có bài nào khớp bộ lọc này."}{" "}
                Thử từ khoá khác hoặc xoá bộ lọc.
              </p>
              <button type="button" onClick={handleResetFilters}>
                Xoá bộ lọc
              </button>
            </div>
          ) : (
            SECTIONS.map((sec) => {
              const sectionItems = visibleItems.filter(
                (it) => it.sec === sec.id,
              );
              if (sectionItems.length === 0) return null;

              return (
                <section key={sec.id} className="s">
                  <div className="sh">
                    <h2>{sec.title}</h2>
                    <p>{sec.sub}</p>
                  </div>

                  <div className={`cards ${sec.cls}`}>
                    {sectionItems.map((item, idx) => {
                      const ctaText = item.p > 0 ? "Làm tiếp" : "Bắt đầu";
                      const style = {
                        "--a": item.a,
                        animationDelay: `${idx * 40}ms`,
                      } as React.CSSProperties;

                      if (sec.isHorizontal) {
                        return (
                          <article
                            key={item.id}
                            className="card h"
                            style={style}
                          >
                            <div className="ic">{item.ic}</div>
                            <div className="body">
                              <span className="tag">{item.tag}</span>
                              <h3>{item.title}</h3>
                              <p>{item.desc}</p>
                              <div className="meta">
                                <span>{item.meta}</span>
                                <b>{item.p}%</b>
                              </div>
                              <div className="track">
                                <i style={{ width: `${item.p}%` }} />
                              </div>
                              <Link
                                href={item.href}
                                prefetch={false}
                                className="cta"
                              >
                                {ctaText}
                              </Link>
                            </div>
                          </article>
                        );
                      }

                      return (
                        <article key={item.id} className="card" style={style}>
                          <div className="top">
                            <div className="ic">{item.ic}</div>
                            <span className="tag">{item.tag}</span>
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.desc}</p>
                          <div className="meta">
                            <span>{item.meta}</span>
                            <b>{item.p}%</b>
                          </div>
                          <div className="track">
                            <i style={{ width: `${item.p}%` }} />
                          </div>
                          <Link
                            href={item.href}
                            prefetch={false}
                            className="cta"
                          >
                            {ctaText}
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <div className="foot" />
      </div>
    </div>
  );
}
