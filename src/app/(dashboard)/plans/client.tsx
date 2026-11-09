"use client";

import {
  useState,
  useEffect,
  useMemo,
  useId,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./plans.css";

export interface StagePlan {
  id: number;
  slug: string;
  a: string;
  lo: number;
  hi: number;
  lvl: string;
  wk: number;
  min: number;
  short: string;
  title: string;
  sub: string;
  desc: string;
  perks: string[];
  range: string;
  goal: string;
}

export const STAGES: StagePlan[] = [
  {
    id: 1,
    slug: "stage-1-foundation",
    a: "#5EE0A0",
    lo: 0,
    hi: 2.5,
    lvl: "Foundation",
    wk: 8,
    min: 45,
    short: "Nền Tảng Ngữ Âm & Từ Vựng",
    title: "Chặng 1: Nền Tảng Ngữ Âm & Ngữ Pháp Sơ Cấp",
    sub: "Foundation (0.0 - 2.5) | Chuẩn hóa 44 âm IPA & câu đơn",
    desc: "Chuẩn hóa 44 âm IPA, 800 từ vựng cơ bản, ghép câu đơn rõ nghĩa trong giao tiếp hằng ngày.",
    perks: [
      "Ngữ âm IPA (44 âm): 20 nguyên âm, 24 phụ âm, cơ chế bật hơi",
      "Ngữ pháp cốt lõi: Động từ To Be, Đại từ nhân xưng, Thì Hiện tại/Quá khứ",
      "Từ vựng nền tảng: 800 từ A1 (Gia đình, số đếm, màu sắc, nghề nghiệp)",
    ],
    range: "0.0 - 2.5",
    goal: "2.5",
  },
  {
    id: 2,
    slug: "stage-2-elementary",
    a: "#4BB3FF",
    lo: 2.5,
    hi: 3.5,
    lvl: "Elementary",
    wk: 10,
    min: 60,
    short: "Mở Rộng Câu & Giao Tiếp Cơ Bản",
    title: "Chặng 2: Mở Rộng Câu & Giao Tiếp Cơ Bản",
    sub: "Elementary (2.5 - 3.5) | Giao tiếp hội thoại ngắn, kiểm soát 5 thì",
    desc: "Nối âm, câu ghép, câu hỏi thông dụng và nghe hội thoại đời sống có kiểm soát tốc độ.",
    perks: [
      "Ngữ âm nâng cao: Trọng âm từ, nối âm căn bản, đuôi -s, -es, -ed",
      "Ngữ pháp mở rộng: Tiếp diễn, Hoàn thành, Tương lai, Liên từ, So sánh",
      "Từ vựng chủ đề: 1.500 từ A2 (Giao thông, du lịch, mua sắm)",
    ],
    range: "2.5 - 3.5",
    goal: "3.5",
  },
  {
    id: 3,
    slug: "stage-3-pre-ielts",
    a: "#B9A4FF",
    lo: 3.5,
    hi: 4.5,
    lvl: "Pre-IELTS",
    wk: 12,
    min: 90,
    short: "Định Hình Tư Duy IELTS Nền Tảng",
    title: "Chặng 3: Định Hình Tư Duy IELTS Nền Tảng",
    sub: "Pre-IELTS (3.5 - 4.5) | Làm quen cấu trúc đề, Skimming/Scanning",
    desc: "Đọc hiểu văn bản 400 từ, viết đoạn văn mô tả, mệnh đề quan hệ và câu bị động.",
    perks: [
      "Mệnh đề quan hệ, Thể bị động, Mệnh đề trạng ngữ",
      "Kỹ năng cốt lõi: Skimming, Scanning, Paraphrase",
      "Từ vựng AWL Sublist 1-3: 2.200 từ vựng học thuật cơ bản",
    ],
    range: "3.5 - 4.5",
    goal: "4.5",
  },
  {
    id: 4,
    slug: "stage-4-intermediate",
    a: "#3DD6C6",
    lo: 4.5,
    hi: 5.5,
    lvl: "Intermediate",
    wk: 12,
    min: 90,
    short: "Chuẩn Hóa Kỹ Năng & Chiến Lược",
    title: "Chặng 4: Chuẩn Hóa Kỹ Năng & Chiến Lược",
    sub: "Intermediate (4.5 - 5.5) | Xử lý đề IELTS 4 kỹ năng theo chiến lược",
    desc: "Cấu trúc PEEL, paraphrase logic, từ nối liên kết và phản xạ Speaking Part 2.",
    perks: [
      "Ngữ pháp phức tạp: Câu điều kiện loại 2&3, phân từ rút gọn, câu ghép phức hợp",
      "Writing Frameworks: Cấu trúc PEEL, Intro & Overview Task 1, 2",
      "Speaking Strategy: Mở rộng ý Part 2 (W-H) và duy trì trôi chảy",
    ],
    range: "4.5 - 5.5",
    goal: "5.5",
  },
  {
    id: 5,
    slug: "stage-5-upper-intermediate",
    a: "#F5B73D",
    lo: 5.5,
    hi: 6.5,
    lvl: "Upper-Inter",
    wk: 12,
    min: 120,
    short: "Nâng Cao Biện Luận & Thuần Thục",
    title: "Chặng 5: Nâng Cao Biện Luận & Thuần Thục",
    sub: "Upper-Inter (5.5 - 6.5) | Kiểm soát ngữ cảnh học thuật phức tạp",
    desc: "Collocations C1, cấu trúc đảo ngữ, danh từ hóa và luyện thi thử phòng thi mô phỏng.",
    perks: [
      "Đảo ngữ với phó từ phủ định, Câu chẻ nhấn mạnh, Danh từ hóa",
      "Collocations chuyên sâu học thuật, Phrasal Verbs",
      "Speaking Part 3 Reasoning: Phản biện đa góc nhìn",
    ],
    range: "5.5 - 6.5",
    goal: "6.5",
  },
  {
    id: 6,
    slug: "stage-6-advanced",
    a: "#FF6A82",
    lo: 6.5,
    hi: 7.0,
    lvl: "Advanced",
    wk: 8,
    min: 150,
    short: "Làm Chủ Bứt Phá & Tối Ưu Điểm",
    title: "Chặng 6: Làm Chủ Bứt Phá & Tối Ưu Điểm",
    sub: "Advanced (6.5 - 7.0) | Tư duy sắc bén, giảm lỗi hệ thống",
    desc: "Hedging, độ chính xác từ vựng, quản lý thời gian áp lực cao và bẫy distractors.",
    perks: [
      "Kỹ thuật Hedging, Cấu trúc câu điều kiện hỗn hợp, Lexical Precision",
      "Chiến lược quản lý thời gian Reading & Listening nâng cao",
      "Luyện tập Full Mock Exam 4 kỹ năng với đồng hồ giới hạn thực tế",
    ],
    range: "6.5 - 7.0",
    goal: "7.0",
  },
];

const nz = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export function stageOf(b: number) {
  const i = STAGES.findIndex((s) => b < s.hi);
  return i < 0 ? STAGES.length - 1 : i;
}

export function recId(b: number) {
  return STAGES[stageOf(b)].id;
}

export interface PlansClientProps {
  initialBand?: number;
  initialEnrolledId?: number;
  initialProg?: Record<number, number>;
}

const subscribeNoop = () => () => {};
function getStoredEnrolledSnapshot(): number | null {
  try {
    const saved = localStorage.getItem("plans.enrolled");
    if (!saved) return null;
    const parsed = Number(JSON.parse(saved));
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function PlansClient({
  initialBand = 2.0,
  initialEnrolledId = 1,
  initialProg = {},
}: PlansClientProps) {
  const router = useRouter();
  const searchInputId = useId();
  const bandInputId = useId();

  const storedEnrolled = useSyncExternalStore(
    subscribeNoop,
    getStoredEnrolledSnapshot,
    () => null,
  );
  const [enrolledOverride, setEnrolledOverride] = useState<number | null>(null);
  const enrolled = enrolledOverride ?? storedEnrolled ?? initialEnrolledId;
  const [prog, setProg] = useState<Record<number, number>>(initialProg);
  const [band, setBand] = useState<number>(initialBand);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalStageId, setModalStageId] = useState<number | null>(null);

  const saveState = (
    newEnrolled: number,
    newProg: Record<number, number>,
    newBand: number,
  ) => {
    try {
      localStorage.setItem("plans.enrolled", JSON.stringify(newEnrolled));
      localStorage.setItem("plans.prog", JSON.stringify(newProg));
      localStorage.setItem("plans.band", JSON.stringify(newBand));
    } catch {
      // ignore
    }
  };

  const handleBandChange = (newBand: number) => {
    setBand(newBand);
    saveState(enrolled, prog, newBand);
  };

  const handleEnroll = (stageId: number) => {
    if (
      enrolled &&
      enrolled !== stageId &&
      typeof window !== "undefined" &&
      !window.confirm(
        `Chuyển từ Chặng ${enrolled} sang Chặng ${stageId}? Tiến độ chặng cũ vẫn được giữ.`,
      )
    ) {
      return;
    }
    const updatedEnrolled = stageId;
    const updatedProg = { ...prog, [stageId]: prog[stageId] ?? 0 };
    setEnrolledOverride(updatedEnrolled);
    setProg(updatedProg);
    saveState(updatedEnrolled, updatedProg, band);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalStageId !== null) {
        setModalStageId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalStageId]);

  const bi = stageOf(band);
  const curStage = STAGES[bi];
  const frac = Math.min(
    1,
    Math.max(0, (band - curStage.lo) / (curStage.hi - curStage.lo)),
  );
  const markerPos = ((bi + frac) / STAGES.length) * 100;
  const leftWeeks = STAGES.slice(bi).reduce((acc, x) => acc + x.wk, 0);
  const totalWeeks = STAGES.reduce((acc, x) => acc + x.wk, 0);

  const enrolledStage = STAGES.find((s) => s.id === enrolled);
  const currentProgPercent = enrolledStage
    ? Math.min(100, Math.max(0, prog[enrolledStage.id] ?? 0))
    : 0;
  const displayTotalWeeks = enrolledStage ? enrolledStage.wk : 0;
  const doneWeeks = enrolledStage
    ? Math.round((currentProgPercent * enrolledStage.wk) / 100)
    : 0;

  const filteredStages = useMemo(() => {
    return STAGES.filter((s) => {
      const matchesTab = activeTab === 0 || s.id === activeTab;
      if (!matchesTab) return false;
      if (!searchQuery.trim()) return true;

      const fullSearchText = nz(
        [s.title, s.sub, s.desc, s.lvl, s.range, `${s.goal} ielts`].join(" "),
      );
      return fullSearchText.includes(nz(searchQuery));
    });
  }, [activeTab, searchQuery]);

  const modalStage =
    modalStageId !== null ? STAGES.find((s) => s.id === modalStageId) : null;
  const modalHrs = modalStage
    ? Math.round((modalStage.wk * 7 * modalStage.min) / 60)
    : 0;
  const isEnrolledModal = modalStage ? enrolled === modalStage.id : false;
  const modalProg = modalStage ? (prog[modalStage.id] ?? 0) : 0;

  return (
    <div className="plans-root">
      <div className="plans-wrap">
        <section className="plans-hero" aria-label="Giới thiệu lộ trình">
          <div>
            <h1>
              <span>Lộ trình học tập chi tiết</span>
              <span>
                <em className="plans-mk">theo năng lực cá nhân</em>
              </span>
            </h1>
            <p>
              Kế hoạch học tập phân theo từng chặng kỹ năng, cập nhật tiến độ
              thực tế từ hồ sơ học tập của bạn.
            </p>
          </div>

          <div className="plans-cur" id="cur">
            {enrolledStage ? (
              <>
                <small>Lộ trình gợi ý theo Band của bạn</small>
                <h2>{enrolledStage.short}</h2>
                <div className="row">
                  <span>Tiến độ {currentProgPercent}%</span>
                  <span>
                    {doneWeeks}/{displayTotalWeeks} tuần
                  </span>
                </div>
                <div
                  className="t"
                  role="progressbar"
                  aria-valuenow={currentProgPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <i style={{ width: `${currentProgPercent}%` }} />
                </div>
                <button
                  className="plans-go"
                  onClick={() => router.push("/learn")}
                  aria-label="Học tiếp lộ trình đang đăng ký"
                >
                  Học tiếp
                </button>
              </>
            ) : (
              <>
                <small>Lộ trình bạn đang học</small>
                <h2>Chưa chọn chặng học</h2>
                <p style={{ position: "relative", zIndex: 1, opacity: 0.85 }}>
                  Chọn một chặng bên dưới để bắt đầu.
                </p>
              </>
            )}
          </div>
        </section>

        <section
          className="plans-journey"
          aria-label="Hành trình band 0.0 đến 7.0"
        >
          <div className="plans-jh">
            <h2>Hành trình từ band 0.0 đến 7.0</h2>
            <p>
              {STAGES.length} chặng, tổng {totalWeeks} tuần
            </p>
          </div>

          <div className="plans-track">
            <div
              className="plans-marker"
              style={{ left: `clamp(60px, ${markerPos}%, calc(100% - 60px))` }}
            >
              Bạn ở đây · {band.toFixed(1)}
            </div>

            <div className="plans-bars">
              {STAGES.map((x, i) => {
                const f = i < bi ? 100 : i === bi ? Math.round(frac * 100) : 0;
                const isSelected = activeTab === x.id;
                return (
                  <button
                    key={x.id}
                    className="plans-seg"
                    style={
                      {
                        "--a": x.a,
                        "--f": `${f}%`,
                      } as React.CSSProperties
                    }
                    data-t={x.id}
                    aria-pressed={isSelected}
                    aria-label={`Chặng ${x.id}, band ${x.range}`}
                    onClick={() => {
                      setActiveTab((prev) => (prev === x.id ? 0 : x.id));
                      const gridEl = document.getElementById("plans-grid");
                      if (gridEl) {
                        gridEl.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <span className="b" />
                    <b>
                      <span className="l">Chặng {x.id}</span>
                      <span className="s">{x.id}</span>
                    </b>
                    <small>{x.range}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="plans-band">
            <label htmlFor={bandInputId}>
              Band hiện tại của mình<b>{band.toFixed(1)}</b>
            </label>
            <input
              id={bandInputId}
              type="range"
              min="0"
              max="7"
              step="0.5"
              value={band}
              onChange={(e) => handleBandChange(parseFloat(e.target.value))}
              aria-label="Điều chỉnh band hiện tại"
            />
            <div className="rec">
              {band >= 7 ? (
                <>
                  Bạn đã đạt mốc 7.0. Có thể ôn lại Chặng 6 để duy trì phong độ.
                </>
              ) : (
                <>
                  Gợi ý: bắt đầu từ <b>Chặng {curStage.id}</b>. Theo đủ các
                  chặng còn lại, cần ước tính <b>{leftWeeks} tuần</b> để tới mốc
                  7.0.
                </>
              )}
            </div>
          </div>
        </section>

        <div className="plans-tools">
          <div className="plans-tabsrow">
            <div className="plans-tabs" role="tablist">
              <button
                className="plans-tab"
                role="tab"
                aria-selected={activeTab === 0}
                onClick={() => setActiveTab(0)}
              >
                Tất cả lộ trình
              </button>
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  className="plans-tab"
                  role="tab"
                  aria-selected={activeTab === s.id}
                  onClick={() => setActiveTab(s.id)}
                >
                  Chặng {s.id} ({s.lo.toFixed(1)}-{s.hi.toFixed(1)})
                </button>
              ))}
            </div>

            <label className="plans-search" htmlFor={searchInputId}>
              <svg
                width="17"
                height="17"
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
                id={searchInputId}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên lộ trình hoặc mục tiêu..."
                autoComplete="off"
                aria-label="Tìm lộ trình"
              />
            </label>
          </div>
        </div>

        <div className="plans-grid" id="plans-grid">
          {filteredStages.length > 0 ? (
            filteredStages.map((s, i) => {
              const on = enrolled === s.id;
              const rec = recId(band) === s.id && !on;
              const estTotalHours = Math.round((s.wk * 7 * s.min) / 60);
              return (
                <article
                  key={s.id}
                  className={`plans-card ${on ? "on" : ""}`}
                  style={
                    {
                      "--a": s.a,
                      animationDelay: `${i * 40}ms`,
                    } as React.CSSProperties
                  }
                >
                  {on && <span className="plans-badge">Lộ trình đang học</span>}
                  {rec && <span className="plans-rec-tag">Gợi ý cho bạn</span>}

                  <div className="plans-ch">
                    <span className="plans-pill">
                      {s.range} | {s.lvl}
                    </span>
                    <span className="plans-wk">{s.wk} tuần</span>
                  </div>

                  <h3>{s.title}</h3>
                  <div className="plans-sub">{s.sub}</div>
                  <p className="plans-desc">{s.desc}</p>

                  <div className="plans-facts">
                    <div>
                      <small>Mục tiêu</small>
                      <b>{s.goal} IELTS</b>
                    </div>
                    <div>
                      <small>Thời lượng mỗi ngày</small>
                      <b>{s.min} phút</b>
                    </div>
                  </div>

                  <div className="plans-perks">
                    <h4>Nội dung trọng tâm</h4>
                    <ul>
                      {s.perks.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plans-foot">
                    <span>≈ {estTotalHours} giờ học tiêu chuẩn</span>
                    <button
                      className="plans-cta"
                      onClick={() => setModalStageId(s.id)}
                      aria-label={`Xem chi tiết ${s.title}`}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="plans-empty">
              <h2>Không tìm thấy lộ trình nào</h2>
              <p>
                Thử từ khoá khác, ví dụ &quot;5.5&quot;, &quot;Pre-IELTS&quot;
                hoặc &quot;ngữ âm&quot;.
              </p>
            </div>
          )}
        </div>
      </div>

      {modalStage && (
        <div
          className="plans-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalStageId(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="plans-dialog"
            style={{ "--a": modalStage.a } as React.CSSProperties}
          >
            <div className="plans-dh">
              <button
                className="x"
                onClick={() => setModalStageId(null)}
                aria-label="Đóng hộp thoại"
              >
                ✕
              </button>
              <span className="plans-pill">
                {modalStage.range} | {modalStage.lvl}
              </span>
              <h2 id="modal-title">{modalStage.title}</h2>
              <p style={{ color: "var(--mute)" }}>{modalStage.desc}</p>
            </div>

            <div className="plans-db">
              <div className="plans-stats4">
                <div>
                  <small>Thời lượng</small>
                  <b>{modalStage.wk} tuần</b>
                </div>
                <div>
                  <small>Mục tiêu</small>
                  <b>{modalStage.goal} IELTS</b>
                </div>
                <div>
                  <small>Mỗi ngày</small>
                  <b>{modalStage.min} phút</b>
                </div>
                <div>
                  <small>Tổng cộng</small>
                  <b>≈ {modalHrs} giờ</b>
                </div>
              </div>

              <div className="plans-perks">
                <h3>Bạn sẽ học</h3>
                <ul>
                  {modalStage.perks.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>

              {isEnrolledModal && (
                <p style={{ color: "var(--mute)", marginBottom: 18 }}>
                  Tiến độ hệ thống ghi nhận: {modalProg}%.
                </p>
              )}

              <p
                style={{ color: "var(--mute)", fontSize: 13, marginBottom: 6 }}
              >
                Tổng giờ tính theo mức tối thiểu mỗi ngày trong {modalStage.wk}{" "}
                tuần.
              </p>
            </div>

            <div className="plans-df">
              <div className="pn">
                <button
                  onClick={() => setModalStageId(modalStage.id - 1)}
                  disabled={modalStage.id === 1}
                  aria-label="Chặng trước"
                >
                  ‹
                </button>
                <button
                  onClick={() => setModalStageId(modalStage.id + 1)}
                  disabled={modalStage.id === STAGES.length}
                  aria-label="Chặng sau"
                >
                  ›
                </button>
              </div>

              <div className="plans-actions">
                <Link
                  href={`/plans/${modalStage.slug}`}
                  className="plans-btn ghost"
                  onClick={() => setModalStageId(null)}
                >
                  Xem giáo trình chi tiết từng ngày →
                </Link>

                {isEnrolledModal ? (
                  <button className="plans-btn done" disabled>
                    Đang học chặng này
                  </button>
                ) : (
                  <button
                    className="plans-btn"
                    onClick={() => handleEnroll(modalStage.id)}
                  >
                    Đăng ký lộ trình này
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
