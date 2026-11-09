import type { Metadata } from "next";
import Link from "next/link";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site";
import { TERMS_VERSION } from "@/features/auth/policies";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng nền tảng tự học IELTS Indigo Scholar.",
};

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--surface)]">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <MarketingHeader />
      <main id="main-content">
        <Container className="max-w-3xl py-12 sm:py-16">
          <p className="text-sm font-semibold text-[var(--primary)]">
            Phiên bản {TERMS_VERSION}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Điều khoản sử dụng
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted-foreground)]">
            Khi tạo tài khoản và sử dụng dịch vụ trên Indigo Scholar, bạn đồng ý
            dùng nền tảng cho mục đích tự học hợp pháp và tuân thủ các quy định
            bảo vệ tính toàn vẹn học thuật dưới đây.
          </p>

          <div className="mt-10 space-y-9 text-[var(--foreground)] [&_h2]:text-xl [&_h2]:font-bold [&_li]:leading-7 [&_p]:leading-7 [&_p]:text-[var(--muted-foreground)] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            <section>
              <h2>1. Tài khoản và sử dụng chấp nhận được</h2>
              <ul>
                <li>
                  Giữ bí mật thông tin đăng nhập, mật khẩu và không chia sẻ hoặc
                  sử dụng tài khoản của người khác.
                </li>
                <li>
                  Không dò quét, vượt phân quyền, can thiệp API, truy cập nháp
                  câu trả lời, đáp án máy chủ hoặc dữ liệu học viên khác.
                </li>
                <li>
                  Không dùng script tự động hóa để tạo điểm XP, gửi yêu cầu AI
                  hàng loạt nhằm vượt hạn mức hoặc gây gián đoạn hệ thống.
                </li>
              </ul>
            </section>
            <section>
              <h2>2. Bản quyền nội dung &amp; Tài sản trí tuệ</h2>
              <p className="mt-3">
                Bài đọc, bài nghe, bài viết và câu hỏi trên Indigo Scholar được
                biên soạn độc lập hoặc trích dẫn từ nguồn tài liệu có giấy phép
                hợp pháp. Nền tảng không phân phối trái phép đề thi có bản quyền
                của IDP Education, British Council hay Cambridge University
                Press &amp; Assessment. Mọi hành vi thu thập dữ liệu hàng loạt
                (scraping) hoặc tái phân phối thương mại không có văn bản chấp
                thuận đều bị nghiêm cấm.
              </p>
            </section>
            <section>
              <h2>3. Nội dung học tập &amp; Tuyên bố về AI Feedback</h2>
              <p className="mt-3">
                Kết quả chấm tự động, ước lượng band điểm và nhận xét AI trên
                Indigo Scholar chỉ mang tính chất tham khảo phục vụ việc tự ôn
                luyện. Kết quả này{" "}
                <strong>không đại diện và không có giá trị thay thế</strong> cho
                chứng chỉ hoặc bảng điểm IELTS chính thức do IDP hoặc British
                Council cấp.
              </p>
            </section>
            <section>
              <h2>4. Tính sẵn sàng và cập nhật điều khoản</h2>
              <p className="mt-3">
                Dịch vụ có thể tạm ngưng có thông báo để bảo trì hoặc xử lý sự
                cố bảo mật. Khi điều khoản thay đổi đáng kể, Indigo Scholar sẽ
                công bố phiên bản mới và yêu cầu xác nhận lại trước khi tiếp tục
                các tính năng liên quan.
              </p>
            </section>
            <section>
              <h2>5. Liên hệ</h2>
              <p className="mt-3">
                Mọi câu hỏi về điều khoản, bản quyền hoặc tài khoản vui lòng gửi
                về:{" "}
                <a
                  className="font-semibold text-[var(--primary)] underline"
                  href={`mailto:${siteConfig.supportEmail}`}
                >
                  {siteConfig.supportEmail}
                </a>
                .
              </p>
            </section>
          </div>

          <p className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
            Xem{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/privacy"
            >
              Chính sách quyền riêng tư
            </Link>{" "}
            và{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/refund"
            >
              Chính sách hoàn tiền
            </Link>{" "}
            để biết cách dữ liệu và quyền lợi giao dịch được bảo vệ.
          </p>
        </Container>
      </main>
    </div>
  );
}
