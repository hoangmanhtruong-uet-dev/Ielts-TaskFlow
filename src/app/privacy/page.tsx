import type { Metadata } from "next";
import Link from "next/link";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site";
import { PRIVACY_VERSION } from "@/features/auth/policies";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư",
  description:
    "Cách Indigo Scholar thu thập, sử dụng, bảo vệ và xóa dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--surface)]">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <MarketingHeader />
      <main id="main-content">
        <Container className="max-w-3xl py-12 sm:py-16">
          <p className="text-sm font-semibold text-[var(--primary)]">
            Phiên bản {PRIVACY_VERSION}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Chính sách quyền riêng tư
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted-foreground)]">
            Indigo Scholar tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá
            nhân, chỉ thu thập và xử lý dữ liệu tối thiểu cần thiết để cung cấp
            tài khoản, lưu tiến độ học tập, chấm bài và phản hồi học thuật. Dữ
            liệu cá nhân của bạn không được chia sẻ cho học viên khác.
          </p>

          <div className="mt-10 space-y-9 text-[var(--foreground)] [&_h2]:text-xl [&_h2]:font-bold [&_li]:leading-7 [&_p]:leading-7 [&_p]:text-[var(--muted-foreground)] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            <section>
              <h2>1. Mục đích và loại dữ liệu được xử lý</h2>
              <ul>
                <li>
                  <strong>Dữ liệu cá nhân cơ bản:</strong> email đăng nhập, tên
                  hiển thị, múi giờ, band hiện tại/mục tiêu và lịch sử đồng ý
                  điều khoản.
                </li>
                <li>
                  <strong>Dữ liệu học tập:</strong> câu trả lời Reading,
                  Listening, bài luận Writing, kết quả mock test, từ vựng cá
                  nhân và điểm kinh nghiệm.
                </li>
                <li>
                  <strong>Dữ liệu giọng nói (Speaking):</strong> tệp ghi âm
                  riêng tư được xác thực kích thước/thời lượng; transcript và
                  nhận xét AI chỉ được tạo khi bạn chủ động nhấn yêu cầu và đồng
                  ý rõ ràng.
                </li>
                <li>
                  <strong>Dữ liệu kỹ thuật tối thiểu:</strong> nhật ký phiên xác
                  thực, giới hạn tần suất yêu cầu để chống lạm dụng và chẩn đoán
                  lỗi hệ thống (không lưu nội dung mật khẩu hoặc khóa bí mật).
                </li>
              </ul>
            </section>
            <section>
              <h2>2. Lưu trữ, bảo vệ và thời hạn xóa</h2>
              <p className="mt-3">
                Bản ghi âm Speaking được lưu trong bucket riêng tư (Cloudflare
                R2 / Supabase Storage) với URL ký tạm thời và thời hạn lưu giữ
                tối đa <strong>30 ngày</strong>. Tiến trình dọn dẹp máy chủ tự
                động xóa đối tượng lưu trữ trước khi cập nhật trạng thái
                metadata đã xóa. Bài làm, transcript và lịch sử học tập được duy
                trì để hiển thị quá trình tiến bộ cho tới khi bạn tự xóa tài
                khoản hoặc gửi yêu cầu xóa hợp lệ.
              </p>
            </section>
            <section>
              <h2>
                3. Bên xử lý dữ liệu thứ ba &amp; chuyển dữ liệu xuyên biên giới
              </h2>
              <p className="mt-3">
                Để vận hành dịch vụ, một số dữ liệu cần thiết được xử lý thông
                qua các nhà cung cấp hạ tầng đạt chuẩn bảo mật:
              </p>
              <ul>
                <li>
                  <strong>Supabase &amp; Vercel:</strong> xác thực tài khoản, cơ
                  sở dữ liệu PostgreSQL (áp dụng Row Level Security tách biệt dữ
                  liệu theo từng người dùng) và hạ tầng ứng dụng web.
                </li>
                <li>
                  <strong>Cloudflare R2:</strong> lưu trữ tệp âm thanh Speaking
                  riêng tư có chữ ký truy cập ngắn hạn.
                </li>
                <li>
                  <strong>OpenAI:</strong> chỉ nhận nội dung bài luận hoặc audio
                  Speaking từ máy chủ khi bạn chủ động xác nhận gửi chấm AI.
                  Khóa API và service-role không bao giờ được gửi xuống trình
                  duyệt; nếu AI chưa cấu hình hoặc lỗi, hệ thống không sinh điểm
                  hay nhận xét giả.
                </li>
                <li>
                  <strong>Crisp Chat (tùy chọn):</strong> widget hỗ trợ chỉ tải
                  khi bạn bấm đồng ý cookie chức năng/hỗ trợ trên trình duyệt.
                </li>
              </ul>
            </section>
            <section>
              <h2>4. Quyền của chủ thể dữ liệu &amp; Tự xóa tài khoản</h2>
              <p className="mt-3">
                Theo Nghị định 13/2023/NĐ-CP, bạn có quyền truy cập, chỉnh sửa,
                rút lại sự đồng ý và yêu cầu xóa dữ liệu cá nhân:
              </p>
              <ul>
                <li>
                  <strong>Tự xóa tài khoản ngay lập tức:</strong> truy cập mục{" "}
                  <Link
                    className="font-semibold text-[var(--primary)] underline"
                    href="/profile#account-deletion"
                  >
                    Xóa tài khoản vĩnh viễn tại Hồ sơ
                  </Link>{" "}
                  để hệ thống xóa toàn bộ file ghi âm trên Cloudflare R2/Storage
                  và xóa tài khoản khỏi hệ thống xác thực.
                </li>
                <li>
                  <strong>Liên hệ Bộ phận Bảo vệ dữ liệu / Hỗ trợ:</strong> gửi
                  email tới{" "}
                  <a
                    className="font-semibold text-[var(--primary)] underline"
                    href={`mailto:${siteConfig.supportEmail}`}
                  >
                    {siteConfig.supportEmail}
                  </a>{" "}
                  để yêu cầu trích xuất, chỉnh sửa hoặc hỗ trợ xử lý dữ liệu
                  (phản hồi trong vòng 72 giờ làm việc sau khi xác minh danh
                  tính).
                </li>
              </ul>
            </section>
          </div>

          <p className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
            Xem thêm{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/terms"
            >
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link
              className="font-semibold text-[var(--primary)] underline"
              href="/refund"
            >
              Chính sách hoàn tiền
            </Link>
            .
          </p>
        </Container>
      </main>
    </div>
  );
}
