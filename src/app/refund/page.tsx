import type { Metadata } from "next";
import Link from "next/link";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền",
  description:
    "Chính sách hoàn tiền trong 14 ngày và hủy gia hạn gói cước của Indigo Scholar.",
};

export default function RefundPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--surface)]">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <MarketingHeader />
      <main id="main-content">
        <Container className="max-w-3xl py-12 sm:py-16">
          <p className="text-sm font-semibold text-[var(--primary)]">
            Cập nhật lần cuối: Tháng 11, 2026
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Chính sách hoàn tiền (Refund Policy)
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted-foreground)]">
            Bằng việc đăng ký và thanh toán các gói nâng cấp trên Indigo Scholar
            (khi cổng thanh toán được kích hoạt), bạn đồng ý với các quy định rõ
            ràng dưới đây, phù hợp với Luật Bảo vệ quyền lợi người tiêu dùng
            2023.
          </p>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--primary-subtle)] p-5 text-sm leading-6 text-[var(--foreground)]">
            <strong>Thông báo giai đoạn Public Beta:</strong> Khi cổng thanh
            toán đang tắt, toàn bộ người dùng trải nghiệm các tính năng học tập
            nền tảng miễn phí trong hạn mức quy định mà không phát sinh bất kỳ
            khoản thu phí tự động nào.
          </div>

          <div className="mt-10 space-y-9 text-[var(--foreground)] [&_h2]:text-xl [&_h2]:font-bold [&_li]:leading-7 [&_p]:leading-7 [&_p]:text-[var(--muted-foreground)] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            <section>
              <h2>1. Cửa sổ hoàn tiền 14 ngày</h2>
              <p className="mt-3">
                Bạn có quyền gửi yêu cầu xem xét hoàn tiền trong vòng{" "}
                <strong>14 ngày kể từ thời điểm thanh toán thành công</strong>{" "}
                nếu đáp ứng điều kiện sử dụng hợp lý dưới đây. Chính sách được
                áp dụng thống nhất tại trang Bảng giá và Điều khoản giao dịch.
              </p>
            </section>
            <section>
              <h2>2. Các trường hợp được hoàn tiền</h2>
              <p className="mt-3">
                Indigo Scholar hoàn tiền 100% hoặc phần tương ứng trong các
                trường hợp:
              </p>
              <ul>
                <li>
                  <strong>Lỗi kỹ thuật hệ thống:</strong> sự cố gián đoạn nghiêm
                  trọng kéo dài quá 48 giờ liên tục ảnh hưởng trực tiếp tới
                  quyền lợi gói đã mua mà đội ngũ kỹ thuật chưa khắc phục được.
                </li>
                <li>
                  <strong>Lỗi thanh toán:</strong> hệ thống ghi nhận thu sai số
                  tiền hoặc thu trùng nhiều lần cho cùng một đơn hàng.
                </li>
                <li>
                  <strong>
                    Yêu cầu trong 14 ngày đầu chưa phát sinh AI lớn:
                  </strong>{" "}
                  tài khoản gửi yêu cầu trong vòng 14 ngày kể từ khi nâng cấp và
                  chưa tiêu thụ quá 2 lượt chấm Writing/Speaking AI có chi phí
                  trên hệ thống.
                </li>
              </ul>
            </section>
            <section>
              <h2>3. Hủy gia hạn gói cước</h2>
              <p className="mt-3">
                Bạn có thể tắt tự động gia hạn (nếu sử dụng gói định kỳ) bất kỳ
                lúc nào trước kỳ thanh toán tiếp theo. Sau khi hủy gia hạn,
                quyền lợi gói hiện tại vẫn được giữ nguyên cho tới hết thời hạn
                đã thanh toán.
              </p>
            </section>
            <section>
              <h2>4. Quy trình tiếp nhận &amp; thời hạn xử lý</h2>
              <p className="mt-3">
                Gửi yêu cầu kèm email tài khoản và mã giao dịch tới{" "}
                <a
                  className="font-semibold text-[var(--primary)] underline"
                  href={`mailto:${siteConfig.supportEmail}`}
                >
                  {siteConfig.supportEmail}
                </a>{" "}
                với tiêu đề &ldquo;Yêu cầu hoàn tiền - [Email tài khoản]&rdquo;.
                Chúng tôi xác nhận tiếp nhận trong 24 giờ và hoàn tất xử lý qua
                kênh thanh toán ban đầu trong vòng{" "}
                <strong>3-5 ngày làm việc</strong>.
              </p>
            </section>
            <section>
              <h2>5. Phạm vi kết quả tham khảo từ AI</h2>
              <p className="mt-3">
                Như đã nêu trong{" "}
                <Link
                  className="font-semibold text-[var(--primary)] underline"
                  href="/terms"
                >
                  Điều khoản sử dụng
                </Link>
                , điểm số và nhận xét do AI chấm mang tính tham khảo học thuật.
                Indigo Scholar không áp dụng hoàn tiền ngoài cửa sổ 14 ngày chỉ
                vì khác biệt đánh giá chủ quan giữa AI và điểm thi chính thức.
              </p>
            </section>
          </div>

          <p className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
            Xem thêm{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/pricing"
            >
              Bảng giá
            </Link>{" "}
            ·{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/terms"
            >
              Điều khoản sử dụng
            </Link>{" "}
            ·{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/privacy"
            >
              Chính sách quyền riêng tư
            </Link>
          </p>
        </Container>
      </main>
    </div>
  );
}
