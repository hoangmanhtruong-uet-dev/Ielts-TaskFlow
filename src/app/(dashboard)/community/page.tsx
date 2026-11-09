import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  MessageSquare,
  Mic,
  PenLine,
  Sparkles,
} from "lucide-react";

import { requireCurrentAccount } from "@/features/auth/server/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cộng đồng học tập (Beta) | Indigo Scholar",
  description:
    "Không gian trao đổi bài Writing, Speaking và giải đáp thắc mắc IELTS trên Indigo Scholar.",
};

export default async function CommunityPage() {
  await requireCurrentAccount();
  const communityBetaEnabled = process.env.ENABLE_COMMUNITY_BETA === "true";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <section className="rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wider text-indigo-700 uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {communityBetaEnabled ? "Public Beta Mở rộng" : "Đang hoàn thiện"}
        </div>

        <h1 className="font-display mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cộng đồng Học tập Indigo Scholar
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          {communityBetaEnabled
            ? "Tính năng thảo luận nhóm và chữa bài ngang hàng (peer review) đang được triển khai theo từng đợt cho người dùng Public Beta."
            : "Trong giai đoạn Public Beta hiện tại, cộng đồng trao đổi bài viết và phòng luyện nói trực tiếp đang được kiểm duyệt dữ liệu thực trước khi mở công khai."}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <MessageSquare
              className="mt-0.5 size-5 shrink-0 text-indigo-600"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              Trong thời gian này, bạn có thể luyện Writing &amp; Speaking với
              phản hồi chi tiết và rà soát các câu trả lời sai thực tế trong Sổ
              tay lỗi sai cá nhân.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Tính năng luyện tập sẵn sàng"
        className="grid gap-4 sm:grid-cols-2"
      >
        <Link
          href="/practice/writing"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300"
        >
          <div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <PenLine className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              Phòng luyện Writing &amp; AI Review
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Viết Task 1 / Task 2 có lưu nháp tự động và nhận đánh giá 4 tiêu
              chí.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
            Vào phòng luyện viết{" "}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/practice/speaking"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300"
        >
          <div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Mic className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              Phòng luyện Speaking 3 phần
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Ghi âm câu trả lời theo đề thi chuẩn, chuyển giọng nói và theo dõi
              tiến bộ.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
            Vào phòng Speaking{" "}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/error-notebook"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300"
        >
          <div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <BookOpenCheck className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              Sổ tay lỗi sai cá nhân
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Tổng hợp trực tiếp các câu trả lời chưa đúng từ những lần bạn đã
              làm bài.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
            Mở sổ tay lỗi sai{" "}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href="/resources"
          className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300"
        >
          <div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Compass className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              Thư viện học liệu chính thức
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Liên kết trực tiếp tới nguồn IELTS.org, British Council và
              Cambridge Dictionary.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
            Xem thư viện <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </Link>
      </section>
    </div>
  );
}
