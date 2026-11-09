"use client";

import {
  Check,
  ChevronDown,
  CreditCard,
  Flame,
  Info,
  Minus,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    name: "Kho bài tập Reading & Listening",
    free: "Đầy đủ trong giai đoạn Public Beta",
    plus: "Không giới hạn",
    pro: "Không giới hạn",
  },
  {
    name: "Chấm & phản hồi Writing AI",
    free: "5 lượt / tuần (trải nghiệm)",
    plus: "20 lượt / tuần",
    pro: "50 lượt / tuần (4 tiêu chí IELTS)",
  },
  {
    name: "Luyện Speaking AI & Transcript Whisper",
    free: "5 lượt feedback / tuần",
    plus: "15 lượt feedback / tuần",
    pro: "50 lượt feedback / tuần",
  },
  {
    name: "Mock Test chuẩn máy tính",
    free: "Bộ đề tiêu chuẩn trên hệ thống",
    plus: "Mở rộng đề mới định kỳ",
    pro: "Toàn bộ kho Mock Test + lưu lịch sử",
  },
  {
    name: "Từ vựng SRS & Error Notebook",
    free: "Không giới hạn từ lưu",
    plus: "Không giới hạn + đồng bộ FSRS",
    pro: "Không giới hạn + ưu tiên AI",
  },
  {
    name: "Thống kê tiến độ thật",
    free: "Lưu toàn bộ lịch sử thực tế",
    plus: "Lịch sử chi tiết theo kỹ năng",
    pro: "Phân tích chuyên sâu theo tiêu chí",
  },
] as const;

const faqs = [
  {
    question: "Giai đoạn Public Beta hiện tại miễn phí những gì?",
    answer:
      "Khi BILLING_ENABLED chưa bật, tất cả tài khoản đều được sử dụng miễn phí kho bài học, luyện tập, từ vựng SRS, Mock Test và hạn mức AI miễn phí hàng tuần (5 lượt Writing AI + 5 lượt Speaking AI feedback mỗi tuần).",
  },
  {
    question: "Hệ thống AI chấm Writing và Speaking hoạt động ra sao?",
    answer:
      "AI phân tích theo 4 tiêu chí IELTS Band Descriptors để tham khảo ôn luyện. Nếu chưa kích hoạt dịch vụ AI hoặc khi hết hạn mức, hệ thống không sinh band điểm hay nhận xét giả và kết quả này không thay thế kỳ thi chính thức của IDP hoặc British Council.",
  },
  {
    question: "Chính sách hoàn tiền áp dụng như thế nào khi mở thanh toán?",
    answer:
      "Khi thanh toán thương mại được bật, mọi gói nâng cấp áp dụng cửa sổ xem xét hoàn tiền thống nhất trong vòng 14 ngày theo Chính sách hoàn tiền tại /refund.",
  },
] as const;

export function PricingTable({
  billingEnabled = false,
}: {
  billingEnabled?: boolean;
}) {
  const [isYearly, setIsYearly] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const plusPrice = isYearly ? "65.000đ" : "99.000đ";
  const proPrice = isYearly ? "129.000đ" : "199.000đ";

  function handleSelectPlan(planName: string) {
    if (!billingEnabled) return;
    setCheckoutMessage(
      `Yêu cầu nâng cấp gói ${planName} đang chờ tích hợp cổng thanh toán trực tuyến.`,
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
        {!billingEnabled ? (
          <div
            role="status"
            className="mb-8 flex flex-col gap-2 rounded-2xl border border-[#c7d2fe] bg-[#eef2ff] p-4 text-sm text-[#312e81] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 shrink-0 text-[#4338CA]" />
              <div>
                <p className="font-bold">
                  Indigo Scholar đang ở giai đoạn Public Beta (Miễn phí trải
                  nghiệm)
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[#3730a3]">
                  Thanh toán thương mại hiện chưa bật. Bạn được truy cập miễn
                  phí lộ trình, từ vựng SRS, Mock Test và hạn mức AI hàng tuần
                  mà không mất phí.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 rounded-xl bg-[#4338CA] px-4 py-2 text-center text-xs font-bold text-white hover:bg-[#3730a3]"
            >
              Vào học ngay
            </Link>
          </div>
        ) : null}

        {checkoutMessage ? (
          <div
            role="status"
            className="mb-8 rounded-2xl border border-[var(--border)] bg-[#fbf9ff] p-4 text-sm font-medium text-[var(--foreground)]"
          >
            {checkoutMessage}
          </div>
        ) : null}

        {/* Header Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d2ff] bg-[#efedff] px-4 py-1.5 text-sm font-bold text-[#4338CA]">
            <ShieldCheck size={16} /> Minh bạch quyền lợi &amp; Chính sách 14
            ngày
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--foreground)] uppercase sm:text-4xl">
            Các gói học tập trên Indigo Scholar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--muted-foreground)]">
            Thông tin quyền lợi dự kiến khi nền tảng mở thanh toán chính thức.
            Trong giai đoạn Beta hiện tại, toàn bộ người dùng bắt đầu từ tài
            khoản miễn phí.
          </p>

          {/* Toggle Switch */}
          <div className="mx-auto mt-8 inline-flex items-center rounded-full bg-[var(--muted)] p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                !isYearly
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                isYearly
                  ? "bg-[#4338CA] text-white shadow-md"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Theo năm{" "}
              <span className="flex items-center gap-1 rounded bg-[#EF4444] px-1.5 py-0.5 text-[10px] text-white">
                <Flame size={10} /> Tiết kiệm ~35%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {/* Card 1: Free */}
          <div className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[#fbf9ff] p-8 text-[var(--foreground)]">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[var(--muted-foreground)] uppercase">
                Cơ bản
              </span>
              <h2 className="mt-2 text-xl font-black text-[var(--foreground)]">
                Gói Khởi Động
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Trải nghiệm đầy đủ lộ trình nền tảng, từ vựng SRS và hạn mức AI
                miễn phí hàng tuần.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[var(--foreground)]">
                  0đ
                </span>
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                  / mãi mãi
                </span>
              </div>

              <ul className="mt-8 space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> Bài
                  học nền tảng, Reading, Listening &amp; Dictation
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> Lưu từ
                  vựng FSRS &amp; Sổ tay lỗi sai
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> 5 lượt
                  chấm Writing AI &amp; 5 lượt Speaking AI / tuần
                </li>
                <li className="flex items-start gap-3 text-[var(--muted-foreground)] opacity-75">
                  <Minus size={18} className="shrink-0" /> Mở rộng hạn mức AI 50
                  lượt / tuần (khi bật Pro)
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 block w-full rounded-xl bg-[var(--muted)] px-4 py-3.5 text-center text-sm font-bold text-[var(--foreground)] hover:opacity-90"
            >
              Đang mở miễn phí
            </Link>
          </div>

          {/* Card 2: Plus */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#d8d2ff] bg-[#efedff] p-8 text-[var(--foreground)] shadow-sm">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#4338CA] uppercase">
                Dự kiến mở sau Beta
              </span>
              <h2 className="mt-2 text-xl font-black text-[var(--foreground)]">
                Gói Go Plus
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Tăng cường hạn mức luyện Reading, Listening và Writing AI hàng
                tuần.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[var(--foreground)]">
                  {plusPrice}
                </span>
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                  / tháng
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold text-[#047857]">
                {isYearly
                  ? "Thanh toán 12 tháng: tiết kiệm ~35% so với gói tháng"
                  : "Thanh toán linh hoạt từng tháng"}
              </p>

              <ul className="mt-8 space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> Toàn
                  bộ bài tập Reading &amp; Listening trên hệ thống
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" />{" "}
                  Flashcard SRS thông minh không giới hạn
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> 20
                  lượt Writing AI / tuần
                </li>
                <li className="flex items-start gap-3 text-[var(--muted-foreground)] opacity-75">
                  <Minus size={18} className="shrink-0" /> Hạn mức Speaking AI
                  cao cấp (50 lượt/tuần)
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={!billingEnabled}
              onClick={() => handleSelectPlan("Go Plus")}
              className="mt-8 w-full rounded-xl bg-[#4338CA] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {billingEnabled
                ? "Chọn Go Plus"
                : "Chưa mở thanh toán (Public Beta)"}
            </button>
          </div>

          {/* Card 3: Pro */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#4338CA] bg-white p-8 text-[var(--foreground)] shadow-xl">
            <div className="absolute -top-4 right-6 flex items-center gap-1.5 rounded-full bg-[#4338CA] px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Star size={12} fill="currentColor" /> TOÀN DIỆN
            </div>
            <div>
              <span className="rounded bg-[#efedff] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#4338CA] uppercase">
                Đầy đủ 4 kỹ năng + AI
              </span>
              <h2 className="mt-3 text-xl font-black text-[var(--foreground)]">
                Gói IELTS Pro
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Mở rộng tối đa hạn mức chấm Writing &amp; Speaking AI theo 4
                tiêu chí tham khảo.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#4338CA]">
                  {proPrice}
                </span>
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                  / tháng
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold text-[#4338CA]">
                Xem xét hoàn tiền trong vòng 14 ngày theo{" "}
                <Link href="/refund" className="underline">
                  Chính sách hoàn tiền
                </Link>
              </p>

              <ul className="mt-8 space-y-4 text-sm font-bold">
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> Đầy đủ
                  bài luyện Nghe - Nói - Đọc - Viết
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> 50
                  lượt chấm Writing AI / tuần theo 4 tiêu chí
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> 50
                  lượt Speaking AI &amp; Whisper transcript / tuần
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> Mock
                  Test 4 kỹ năng lưu lịch sử thực tế
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="shrink-0 text-[#4338CA]" /> Thống
                  kê tiến độ học từ dữ liệu thật của tài khoản
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={!billingEnabled}
              onClick={() => handleSelectPlan("IELTS Pro")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4338CA] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {billingEnabled
                ? "Đăng ký gói Pro"
                : "Chưa mở thanh toán (Public Beta)"}
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl bg-[#fbf9ff] p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#efedff] text-[#4338CA]">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[var(--foreground)]">
                Hoàn tiền trong 14 ngày
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Áp dụng điều kiện minh bạch tại trang{" "}
                <Link href="/refund" className="font-semibold underline">
                  /refund
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-[#fbf9ff] p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#efedff] text-[#4338CA]">
              <Zap size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[var(--foreground)]">
                Giai đoạn Public Beta
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {billingEnabled
                  ? "Kích hoạt tự động sau khi xác thực webhook thanh toán"
                  : "Trải nghiệm miễn phí không cần nhập thẻ"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-[#fbf9ff] p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#efedff] text-[#4338CA]">
              <CreditCard size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[var(--foreground)]">
                Không quảng cáo, không ẩn phí
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Không tự động trừ tiền khi chưa xác nhận gói
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              So sánh chi tiết tính năng
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Xem kỹ hạn mức và đặc quyền của từng gói trước khi lựa chọn.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-4 pl-4 text-left font-bold text-[var(--foreground)]">
                    Tính năng
                  </th>
                  <th className="py-4 text-center font-bold text-[var(--foreground)]">
                    Gói Khởi Động
                  </th>
                  <th className="py-4 text-center font-bold text-[var(--foreground)]">
                    Gói Go Plus
                  </th>
                  <th className="rounded-t-2xl bg-[#fbf9ff] py-4 text-center font-bold text-[#4338CA]">
                    IELTS Pro{" "}
                    <Star
                      size={14}
                      className="mb-0.5 inline text-[#F59E0B]"
                      fill="currentColor"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {features.map((feature) => (
                  <tr key={feature.name}>
                    <td className="py-5 pl-4 font-semibold text-[var(--foreground)]">
                      {feature.name}
                    </td>
                    <td className="py-5 text-center text-[var(--muted-foreground)]">
                      {feature.free}
                    </td>
                    <td className="py-5 text-center text-[var(--muted-foreground)]">
                      {feature.plus}
                    </td>
                    <td className="bg-[#fbf9ff] py-5 text-center font-bold text-[#4338CA]">
                      {feature.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Câu hỏi thường gặp (FAQ)
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Thông tin về giai đoạn Beta, hạn mức AI và chính sách hoàn tiền.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl bg-[#fbf9ff] p-5 transition-colors open:bg-[#efedff]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    size={18}
                    className="text-[var(--muted-foreground)] transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
