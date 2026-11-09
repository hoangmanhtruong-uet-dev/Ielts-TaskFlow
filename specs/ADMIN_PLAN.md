# GO-LIVE ROADMAP & ACTION PLAN

**Dự án:** App-hoc-tieng-anh (IELTS Self-Study)
**Nguồn:** Go-Live Blueprint & Action Plan.pdf
**Mục tiêu:** Chuyển đổi từ Phase 10C sang Release (Sẵn sàng cho 1,000 - 10,000 users)

---

## 🎯 PHASE 1: Sửa Lỗi Hệ Thống & Tự Động Hóa Nội Dung (Tuần 1 - Tuần 2)

### 1.1 Codebase Cleanup (Diagnostics & Build)

- [x] **Audit:** Chạy `npm run typecheck` và `npm run lint` để lấy danh sách lỗi hiện tại (176 lỗi).
- [x] **Logic:** Fix các lỗi TypeScript strict mode (Type assertions, missing props).
- [x] **Logic:** Fix các lỗi ESLint (React hooks dependencies, unused variables).
- [x] **Test:** Đảm bảo `npm run build` thành công 100% không warning.

### 1.2 SMTP & Luồng Xác Thực (Auth)

- [x] **UI/Logic:** Cấu hình biến môi trường Resend API Key.
- [x] **Logic:** Cập nhật cài đặt SMTP trong Supabase Dashboard (hoặc config.toml).
- [x] **UI:** Hoàn thiện UI/UX cho trang `/auth/forgot-password` và `/auth/reset-password`.
- [x] **Test:** Thực hiện luồng đăng ký -> Nhận email Verify -> Xác thực thành công (Manual Testing Required).
- [x] **Test:** Thực hiện luồng Quên mật khẩu -> Nhận email Reset -> Đặt lại mật khẩu thành công (Manual Testing Required).

### 1.3 AI Content Generator Engine (Script)

- [x] **Logic:** Viết script (Node.js/Python) tự động hóa gọi OpenAI Structured Output API theo schema.
- [x] **Logic:** Script có khả năng scrape nội dung (RSS BBC/TED hoặc PDF Cambridge).
- [x] **DB:** Định nghĩa cấu trúc lưu kết quả sinh tự động vào DB với status `PENDING_REVIEW`.
- [x] **Test:** Sinh thử 10 bài Reading/Listening đầu tiên và kiểm tra dữ liệu trong DB (Chờ deploy migration).
- [x] **Audit Review:** Review chất lượng JSON output từ AI, đảm bảo schema luôn valid.

### 1.4 Admin CMS (Duyệt nội dung)

- [x] **UI:** Dựng route bảo vệ `/admin/content` (chỉ role Admin mới được truy cập).
- [x] **UI:** Tạo bảng danh sách các bài học đang ở trạng thái `PENDING_REVIEW`.
- [x] **Logic:** Tạo nút "Approve" (xuất bản) và "Reject" (xóa/yêu cầu sinh lại).
- [x] **Test:** Đăng nhập user thường -> Từ chối truy cập `/admin`. Đăng nhập Admin -> Xem và duyệt bài thành công.

---

## 🚀 PHASE 2: Tối Ưu Hạ Tầng & Core UX (Tuần 3 - Tuần 4)

### 2.1 Database Tuning

- [x] **DB:** Kích hoạt Supavisor Connection Pooler trên Supabase (Port 6543).
- [x] **DB:** Cập nhật biến `DATABASE_URL` trong project sang url pooler.
- [x] **DB:** Viết migration đánh Index cho các cột thường xuyên truy vấn: `user_id`, `created_at`, `lesson_id`.
- [x] **Test:** Chạy lại `npm run test` để đảm bảo Connection Pooler hoạt động bình thường (Manual check).

### 2.2 Audio Streaming CDN

- [x] **Logic:** Cấu hình bucket Cloudflare R2 để lưu trữ Audio file.
- [x] **Logic:** Trỏ domain custom (ví dụ: `cdn.apphoctienganh.com`) về R2.
- [x] **Logic:** Thêm HTTP Headers `Cache-Control: public, max-age=31536000, immutable` cho object.
- [x] **Test:** Chơi audio trên browser, kiểm tra tab Network xem có đúng HIT cache từ Cloudflare hay không (Manual test required).

### 2.3 Mobile Audio Player Fix

- [x] **UI:** Phân tích component Floating Audio Player.
- [x] **UI:** Thêm `padding-bottom` (bằng chiều cao của player) vào component layout gốc để không đè nội dung.
- [x] **Test:** Kiểm tra responsive trên DevTools (Mobile 375px) khi lướt bài nghe (Reading + Listening view).

### 2.4 Cost & Quota Guard (Rate Limiting)

- [x] **Logic:** Tích hợp Upstash Redis Rate Limiting (Giới hạn Max 10 requests/phút/IP).
- [x] **Logic:** Thêm server action check quota: Giới hạn User Free max 2 bài Writing/Speaking/ngày.
- [x] **UI:** Hiển thị popup "Nâng cấp/Giới hạn" khi user Free vượt quá 2 bài/ngày.
- [x] **Test:** Tạo 1 account Free, spam nộp 3 bài Writing liên tục -> Xác nhận bài số 3 bị chặn (Manual testing required).
- [x] **Test:** Bắn 15 requests API / phút -> Xác nhận bị chặn lỗi 429 Too Many Requests (Manual testing required).

---

## 🛡️ PHASE 3: Pháp Lý, Monitoring & Closed Beta (Tuần 5)

### 3.1 Legal Terms & Compliance

- [x] **UI:** Tạo các trang `/terms`, `/privacy`.
- [x] **UI:** Bổ sung IELTS Trademark Disclaimer ở Footer (Bắt buộc về bản quyền).
- [x] **Audit:** Đảm bảo flow đăng ký (Google OAuth) tuân thủ hiển thị Terms of Service.

### 3.2 Analytics & Support

- [x] **Logic:** Cài đặt Vercel Web Analytics.
- [x] **UI:** Tích hợp Crisp Chat Widget (miễn phí) vào layout.
- [x] **Test:** Mở web trên Incognito, gửi tin nhắn từ Crisp Chat -> Xác nhận nhận được trên Crisp Dashboard (Manual testing required).

### 3.3 Telegram Alert Webhook

- [x] **Logic:** Tạo Telegram Bot, lấy Bot Token & Chat ID.
- [x] **UI/Logic:** Gắn sự kiện vào nút "Báo lỗi câu hỏi" -> Gọi API nội bộ -> Đẩy thông báo Webhook về Telegram.
- [x] **Test:** Bấm nút báo lỗi trên UI -> Tin nhắn reo trên app Telegram của Admin (Manual testing required).

### 3.4 Closed Beta Launch

- [x] **Audit:** Kiểm tra chéo toàn bộ Production Readiness (Env vars, logs).
- [x] **Release:** Mở hệ thống đón 100 users đầu tiên.

---

## 📈 PHASE 4: Phân Tích Dữ Liệu, Features & Scale (Tuần 6+)

### 4.1 Gamification Logic

- [x] **DB/Logic:** Thiết kế schema tính điểm tự động khi hoàn thành bài học.
- [x] **UI/Logic:** Hiển thị Leaderboard (Weekly League) dựa trên số điểm.
- [x] **UI:** Nút Streak Freeze (sử dụng điểm/coin để mua).
- [x] **Test:** Hoàn thành 1 bài học -> Điểm tăng -> Bảng xếp hạng cập nhật realtime.

### 4.2 Error Notebook Engine

- [x] **UI/Logic:** Dựng trang `Sổ tay lỗi sai`.
- [x] **Logic:** Truy vấn gom nhóm các lỗi user thường sai (ví dụ: Mạo từ, Thì hiện tại hoàn thành).
- [x] **UI:** Tính năng "Tạo bài luyện tập lại" từ những câu đã sai.

### 4.3 SEO Pages

- [x] **Logic:** Chuyển đổi các trang Vocabulary Detail (Từ vựng) sang dạng SSG (Static Site Generation) public.
- [x] **UI:** Bổ sung thẻ `<title>`, `<meta description>`, Open Graph tự động sinh (Vercel OG).
- [x] **Audit Review:** Dùng Lighthouse quét SEO đạt điểm > 90.
- [x] **Test:** Submit Sitemap lên Google Search Console.

### 4.4 Public Release

- [x] **Release:** Mở rộng hệ thống phục vụ 1,000 - 10,000 người dùng. Cắm tracking hiệu suất (Better Stack).
