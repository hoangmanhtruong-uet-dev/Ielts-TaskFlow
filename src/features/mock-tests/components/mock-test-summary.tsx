import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Headphones,
  Mic,
  PenLine,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PrintReportButton } from "@/features/mock-tests/components/print-report-button";
import { formatMockDuration } from "@/features/mock-tests/model";
import type { MockSessionPageData } from "@/features/mock-tests/server/content";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function MockTestSummary({ data }: { data: MockSessionPageData }) {
  const result = data.result;
  const readingRaw = rawScore(result?.reading_score, result?.reading_max_score);
  const listeningRaw = rawScore(
    result?.listening_score,
    result?.listening_max_score,
  );

  const readingPct = scorePercent(
    result?.reading_score,
    result?.reading_max_score,
  );
  const listeningPct = scorePercent(
    result?.listening_score,
    result?.listening_max_score,
  );

  const sectionElapsedSeconds = data.sections.reduce((total, section) => {
    const startMs = section.attempt?.started_at
      ? Date.parse(section.attempt.started_at)
      : NaN;
    const endMs = section.attempt?.submitted_at
      ? Date.parse(section.attempt.submitted_at)
      : NaN;
    if (
      Number.isFinite(startMs) &&
      Number.isFinite(endMs) &&
      endMs >= startMs
    ) {
      return total + Math.round((endMs - startMs) / 1000);
    }
    return total;
  }, 0);

  const totalLimitSeconds = data.sections.reduce(
    (total, section) => total + section.timeLimitSeconds,
    0,
  );

  const completedDateLabel = data.session.completed_at
    ? dateFormatter.format(new Date(data.session.completed_at))
    : "Chưa ghi nhận thời điểm hoàn thành";

  const readingSection = data.sections.find((s) => s.type === "reading");
  const listeningSection = data.sections.find((s) => s.type === "listening");
  const writingSection = data.sections.find((s) => s.type === "writing");
  const speakingSection = data.sections.find((s) => s.type === "speaking");

  const writingEval = data.writingEvaluation ?? null;
  const speakingEval = data.speakingEvaluation ?? null;

  const totalReceptiveCorrect =
    (result?.reading_score ?? 0) + (result?.listening_score ?? 0);
  const totalReceptiveMax =
    (result?.reading_max_score ?? 0) + (result?.listening_max_score ?? 0);
  const receptivePct =
    totalReceptiveMax > 0
      ? Math.round((totalReceptiveCorrect / totalReceptiveMax) * 100)
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans">
      <header className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-black tracking-wider text-indigo-700 uppercase">
              Tổng kết Mock Test · Điểm luyện tập tham khảo
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
              • Hoàn thành lúc {completedDateLabel}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800">
            {data.version.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="secondary"
            className="h-11 rounded-xl border border-slate-200 px-5 font-bold text-slate-700 shadow-sm hover:bg-slate-100 print:hidden"
          >
            <Link href="/mock-tests">
              <ArrowLeft aria-hidden="true" size={16} className="mr-2" />
              Danh sách Mock Test
            </Link>
          </Button>
          <PrintReportButton />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-4">
          <p className="mb-3 text-[11px] font-black tracking-widest text-slate-500 uppercase">
            Điểm thô Listening &amp; Reading
          </p>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-indigo-600 tabular-nums">
              {totalReceptiveMax > 0
                ? `${totalReceptiveCorrect}/${totalReceptiveMax}`
                : "—"}
            </span>
            {receptivePct !== null ? (
              <span className="text-lg font-bold text-slate-500">
                ({receptivePct}%)
              </span>
            ) : null}
          </div>
          <div className="mb-4 inline-flex w-max items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
            <CheckCircle2 aria-hidden="true" size={14} /> Đã chấm tự động từ
            PostgreSQL
          </div>
          <p className="text-xs leading-relaxed font-medium text-slate-600">
            Hệ thống lưu chính xác số câu đúng thực tế và tham chiếu bài Writing
            / Speaking của bạn. Không quy đổi hay bịa đặt điểm IELTS Band chính
            thức khi chưa có đánh giá từng phần.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2 lg:col-span-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Headphones
                  aria-hidden="true"
                  size={16}
                  className="text-indigo-500"
                />
                Listening
              </span>
              <span className="text-xs font-black text-slate-500">
                {listeningRaw}
              </span>
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-2xl font-black text-slate-800">
                {listeningPct !== null ? `${listeningPct}%` : "—"}
              </span>
              <span className="mb-0.5 text-xs font-semibold text-slate-500">
                độ chính xác
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${listeningPct ?? 0}%` }}
              />
            </div>
            {listeningSection?.reviewPath ? (
              <Link
                href={listeningSection.reviewPath}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                Xem đáp án chi tiết <ArrowRight aria-hidden="true" size={12} />
              </Link>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <BookOpen
                  aria-hidden="true"
                  size={16}
                  className="text-indigo-500"
                />
                Reading
              </span>
              <span className="text-xs font-black text-slate-500">
                {readingRaw}
              </span>
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-2xl font-black text-slate-800">
                {readingPct !== null ? `${readingPct}%` : "—"}
              </span>
              <span className="mb-0.5 text-xs font-semibold text-slate-500">
                độ chính xác
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${readingPct ?? 0}%` }}
              />
            </div>
            {readingSection?.reviewPath ? (
              <Link
                href={readingSection.reviewPath}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                Xem đáp án chi tiết <ArrowRight aria-hidden="true" size={12} />
              </Link>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <PenLine
                  aria-hidden="true"
                  size={16}
                  className="text-indigo-500"
                />
                Writing
              </span>
              <span className="text-xs font-black text-slate-500">
                {writingEval ? `${writingEval.wordCount} từ` : "Đã nộp"}
              </span>
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-2xl font-black text-slate-800">
                {writingEval?.overallBandEstimate != null
                  ? `Band ${writingEval.overallBandEstimate.toFixed(1)}`
                  : "Chờ đánh giá"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${writingEval?.overallBandEstimate != null ? (writingEval.overallBandEstimate / 9) * 100 : 0}%`,
                }}
              />
            </div>
            {writingSection?.reviewPath ? (
              <Link
                href={writingSection.reviewPath}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                {writingEval?.overallBandEstimate != null
                  ? "Xem góp ý AI Writing"
                  : "Mở bài viết & yêu cầu AI chấm"}
                <ArrowRight aria-hidden="true" size={12} />
              </Link>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Mic aria-hidden="true" size={16} className="text-indigo-500" />
                Speaking
              </span>
              <span className="text-xs font-black text-slate-500">
                {speakingSection?.attempt?.status === "submitted"
                  ? "Đã nộp"
                  : "—"}
              </span>
            </div>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-2xl font-black text-slate-800">
                {speakingEval?.overallBandEstimate != null
                  ? `Band ${speakingEval.overallBandEstimate.toFixed(1)}`
                  : "Chờ đánh giá"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{
                  width: `${speakingEval?.overallBandEstimate != null ? (speakingEval.overallBandEstimate / 9) * 100 : 0}%`,
                }}
              />
            </div>
            {speakingSection?.reviewPath ? (
              <Link
                href={speakingSection.reviewPath}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                {speakingEval?.overallBandEstimate != null
                  ? "Xem góp ý AI Speaking"
                  : "Mở bài nói & yêu cầu AI chấm"}
                <ArrowRight aria-hidden="true" size={12} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-3">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
              <Clock3
                aria-hidden="true"
                size={18}
                className="text-indigo-500"
              />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Thời gian làm thực tế
              </p>
              <p className="text-lg font-black text-slate-800">
                {sectionElapsedSeconds > 0
                  ? formatElapsed(sectionElapsedSeconds)
                  : "—"}{" "}
                <span className="text-xs font-bold text-slate-400">
                  / {formatMockDuration(totalLimitSeconds)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
              <Target
                aria-hidden="true"
                size={18}
                className="text-indigo-500"
              />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Trạng thái phần thi
              </p>
              <p className="text-lg font-black text-slate-800">
                {
                  data.sections.filter((s) => s.attempt?.status === "submitted")
                    .length
                }
                /{data.sections.length}{" "}
                <span className="text-xs font-bold text-slate-400">
                  section đã nộp
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-lg font-black text-slate-800">
          Chi tiết từng phần thi đã nộp
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.sections.map((section) => (
            <article
              key={section.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5"
            >
              <div>
                <p className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
                  Phần {section.order} · {section.type}
                </p>
                <h3 className="mt-1 text-base font-bold text-slate-800">
                  {section.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Giới hạn: {formatMockDuration(section.timeLimitSeconds)}
                  {section.attempt?.submitted_after_time_limit
                    ? " · Nộp sau khi hết giờ"
                    : section.attempt?.submitted_at
                      ? " · Nộp đúng hạn"
                      : ""}
                </p>
              </div>
              {section.reviewPath ? (
                <Link
                  href={section.reviewPath}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
                >
                  Xem bài <ArrowRight aria-hidden="true" size={14} />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {writingEval?.summary || speakingEval?.summary ? (
        <section className="grid gap-6 md:grid-cols-2">
          {writingEval?.summary ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-800">
                <Sparkles
                  aria-hidden="true"
                  size={18}
                  className="text-indigo-600"
                />
                Nhận xét AI Writing (Band{" "}
                {writingEval.overallBandEstimate?.toFixed(1)})
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {writingEval.summary}
              </p>
            </div>
          ) : null}
          {speakingEval?.summary ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-800">
                <Sparkles
                  aria-hidden="true"
                  size={18}
                  className="text-indigo-600"
                />
                Nhận xét AI Speaking (Band{" "}
                {speakingEval.overallBandEstimate?.toFixed(1) ?? "—"})
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {speakingEval.summary}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-indigo-500 shadow-sm">
            <Target aria-hidden="true" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">
              Tiếp tục ôn luyện từ bài thi này
            </h2>
            <p className="text-xs font-medium text-slate-600">
              Mở từng phần Reading/Listening để xem lời giải, hoặc luyện đề mock
              tiếp theo.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="secondary"
            className="h-11 rounded-xl border border-slate-200 bg-white px-6 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Link href={`/mock-tests/${data.test.slug}`}>
              <RotateCcw aria-hidden="true" size={16} className="mr-2" />
              Làm lại đề này
            </Link>
          </Button>
          {readingSection?.reviewPath ? (
            <Button
              asChild
              className="h-11 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              <Link href={readingSection.reviewPath}>Xem lời giải Reading</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function rawScore(
  score: number | null | undefined,
  max: number | null | undefined,
) {
  return score === null ||
    score === undefined ||
    max === null ||
    max === undefined
    ? "Chưa có dữ liệu"
    : `${score}/${max}`;
}

function scorePercent(
  score: number | null | undefined,
  max: number | null | undefined,
) {
  if (
    score === null ||
    score === undefined ||
    max === null ||
    max === undefined ||
    max <= 0
  ) {
    return null;
  }
  return Math.round((score / max) * 100);
}

function formatElapsed(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours > 0) return `${hours}g ${minutes}p`;
  return `${Math.max(1, minutes)} phút`;
}
