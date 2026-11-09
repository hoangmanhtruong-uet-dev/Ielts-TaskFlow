# Báo Cáo Audit Dự Án Chi Tiết: IELTS Self-Study App (Bản Mở Rộng)

**Ngày đánh giá:** 2026-09-30
**Trạng thái phát triển:** Hoàn tất Phase 1 đến Phase 10C (Mức độ Repository/Schema)

## 1. Tổng quan dự án (Project Overview)

Dự án là một ứng dụng tự học IELTS toàn diện, được xây dựng theo kiến trúc Modular Monolith trên nền Next.js + Supabase. Kiến trúc này bám sát nguyên tắc "Server-first, Domain-oriented", chú trọng mạnh mẽ vào tính toàn vẹn dữ liệu (Idempotency) và bảo mật dữ liệu người học (RLS, Ownership).
Hệ thống hiện đã bao phủ vòng lặp học tập end-to-end từ lúc Onboarding đến lúc làm bài thi Mock Test và xem phân tích kết quả học tập.

## 2. Công nghệ sử dụng (Tech Stack)

- **Core:** Next.js 16 (App Router), React 19, TypeScript (strict mode).
- **Styling:** Tailwind CSS v4, shadcn/ui.
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Storage), `@supabase/ssr`, Supabase CLI.
- **AI & Integrations:** `openai` SDK (Gọi hoàn toàn trên server qua Responses API + Structured Outputs).
- **Validation & Utility:** Zod, React Hook Form, React Markdown.
- **Testing:** `vitest`, `@testing-library/react`, Playwright (E2E), pgTAP (Database/RLS testing).
- **Architecture Patterns:** Database-backed Job Queue, Row-Level Security (RLS), Optimistic Concurrency (Autosave).

## 3. Phân rã Các Dịch Vụ và Chức Năng Đã Có (Bounded Modules)

Ứng dụng không phải là một khối monolithic lộn xộn mà được chia thành các _Bounded Modules_ (Phân hệ) rõ ràng, mỗi phân hệ chịu trách nhiệm về một domain cụ thể:

## 3.1. Dịch vụ Hệ thống & Quản lý người dùng

## 1. Identity & Profile (Định danh & Hồ sơ học viên):

- Xác thực (Auth): Ủy thác toàn bộ cho Supabase Auth (hỗ trợ Email, Google, Apple ID và Anonymous/Guest mode để giảm ma sát chuyển đổi).
- Quản lý Profile:
  - Thông tin cơ bản: Tên, avatar, ngôn ngữ hiển thị.
  - Dữ liệu học tập: Khung trình độ CEFR, mục tiêu học tập, thời lượng học cam kết, cấu hình nhắc nhở học tập hàng ngày.
- Luồng Onboarding tinh gọn:
  - Thu thập tối đa 3-4 thông số khởi tạo lộ trình học.
  - Cho phép bỏ qua (Skip) bài kiểm tra đầu vào sâu để trải nghiệm Dashboard ngay; lưu trạng thái `onboarding_completed: boolean`.
- Tuân thủ & Quyền riêng tư: Quản lý đồng ý điều khoản (Terms of Service, Privacy Policy), gắn cờ tài khoản trẻ vị thành niên nếu thuộc diện áp dụng.

## 2. Admin & Vận hành (Ops):

- Quản lý phân quyền (RBAC): Phân chia rõ ràng các nhóm quyền: Super Admin, Content Editor/Teacher, Support Staff, Student (Free/Pro).
- Hỗ trợ khách hàng: Tính năng giả lập tài khoản (User Impersonation) có kiểm toán để hỗ trợ xử lý sự cố học tập cho người dùng.
- Kiểm toán & Giám sát: Lưu vết hành vi quản trị (Audit Logs), cấu hình cờ tính năng (Feature Flags theo từng cấp người dùng Free/Pro), tích hợp Sentry/OpenTelemetry để giám sát lỗi hệ thống.

## 3.2. Dịch vụ Học tập Cốt lõi (Learning Engine)

## 3. Goals & Planning (Mục tiêu & Kế hoạch học tập):

- Quản lý phiên bản Study Plan (Dynamic Roadmap theo mục tiêu đầu ra và thời hạn).
- Daily Task Engine: Tự động sinh danh sách nhiệm vụ mỗi ngày dựa trên tiến độ bài mới và lịch ôn tập đến hạn.
- Smart Reschedule & Recovery: Tự động cân bằng tải (load balancing) khi học viên nghỉ học nhiều ngày; tránh tích tụ backlog quá lớn gây nản lòng; hỗ trợ Streak Freeze.

## 4. Content Management & Versioning (Quản lý Nội dung):

- Cấu trúc phân cấp: Course -> Module -> Lesson -> Question -> Asset / AI Prompt.
- Immutable Published Content: Toàn bộ nội dung một khi đã Publish là Bất biến. Cập nhật nội dung sẽ tạo Minor/Major Version mới; bài làm cũ của học viên luôn được ghim chặt (pinned) vào đúng Version tại thời điểm làm bài.
- Quản lý Prompt AI: Version hóa các system prompts dùng cho việc sinh bài tập hoặc làm tiêu chí chấm bài (grading rubrics).

## 5. Practice & Assessment Engine (Luyện tập & Chấm điểm):

- Vòng đời phiên học (Session Lifecycle): Quản lý trạng thái phiên (`in_progress`, `submitted`, `evaluated`, `abandoned`), hỗ trợ lưu nháp cục bộ và cơ chế Idempotency khi nộp bài.
- Kiến trúc phân tách chấm điểm:
  - Deterministic Grading (Trắc nghiệm, chọn từ): Chấm tức thì bằng backend logic/Edge Function. Answer key được bảo vệ tại schema `private`, Client chỉ nhận kết quả + giải thích chi tiết sau khi đã nộp bài thành công.
  - Asynchronous Grading (Speaking/Writing AI): Đưa vào hàng đợi xử lý ngầm, streaming phản hồi hoặc push thông báo qua Supabase Realtime khi có điểm.

## 6. Vocabulary & Grammar with SRS (Từ vựng, Ngữ pháp & Lặp lại ngắt quãng):

- Personal Wordbook: Lưu trữ từ vựng, cụm từ, cấu trúc ngữ pháp học viên thu thập được từ các bài học.
- Thuật toán SRS (Spaced Repetition System): Ứng dụng FSRS/SM-2 để tính toán chu kỳ quên, tự động gán ngày cần ôn (`due_date`) và mức độ thành thạo (`mastery_level`).
- Dynamic Review Sets: Sinh các Exercise Sets phục vụ ôn tập hàng ngày dựa trên các từ/ngữ pháp đến hạn trả bài thay vì chỉ dùng bộ bài tập cố định.

### 3.3. Dịch vụ Luyện tập Kỹ năng (Skill Practice Engines)

## 7. Reading Engine (Phase 6):

- Giao diện linh hoạt: Hỗ trợ Split-view (văn bản một bên, câu hỏi một bên) trên Desktop và Tab-view trên Mobile; hỗ trợ công cụ Highlight/Ghi chú lưu kèm Draft.
- Server-Authoritative Timer: Tính giờ hoàn toàn dựa trên Server Timestamps (`started_at`, `submitted_at`). Client chỉ render UI countdown, không được quyền gửi dữ liệu thời gian làm bài.
- Autosave an toàn: Lưu nháp tự động định kỳ (Debounced Autosave) kết hợp Optimistic Locking (dùng `version_id`) để triệt tiêu nguy cơ ghi đè dữ liệu khi chạy đa thiết bị.

## 8. Listening Engine (Bổ sung):

- Quản lý luồng phát Audio: Stream qua CDN bảo mật (Signed CloudFront/Supabase URLs ngắn hạn).
- Kiểm soát tương tác (Playback Policy): Cấu hình số lần nghe cho phép (1 lần cho Mock Test, nghe tự do cho Practice), vô hiệu hóa thanh tua (seek-bar) trong chế độ thi để mô phỏng áp lực thực tế.

## 9. Writing Engine (Phase 8):

- Quản lý nộp bài: Lưu Draft liên tục; nộp bài là hành động Bất biến (Immutable Submission - cấm chỉnh sửa sau khi submit).
- Phân tích văn bản thời gian thực: Đếm từ (Word count), phát hiện hành vi Paste nội dung bất thường (trong bài thi).
- Xử lý chấm điểm AI Asynchronous:
  - Chuyển bài nộp vào Hàng đợi (Queue/Worker) để xử lý tác vụ LLM tốn thời gian.
  - Nhận kết quả qua Webhook có bảo mật chữ ký HMAC (HMAC SHA-256 Signature Verification) trước khi ghi điểm vào Database.
  - Chuẩn hóa Rubric: Ép AI trả về JSON Schema chi tiết theo tiêu chí quốc tế (Task Response, Coherence, Grammar, Lexical).

## 10. Speaking Engine (Phase 9):

- Thu âm & Lưu trữ phân tầng:
  - Client upload file ghi âm trực tiếp lên Private Bucket của Supabase Storage qua Signed Upload URLs (TTL ngắn 10-15 phút; tự động cleanup nếu bài làm bị hủy).
- Xử lý Media & Pipeline chấm điểm:
  - Media Worker: Chuẩn hóa codec đa nền tảng (chuyển đổi WebM từ Android/Chrome và M4A từ iOS sang định dạng chuẩn bằng FFmpeg).
  - Multi-layer Evaluation: Kết hợp Speech-to-Text (ASR) để lấy transcript, API phân tích ngữ âm (Phoneme/Pronunciation Assessment) để chấm phát âm, và LLM để chấm độ trôi chảy, ngữ pháp và từ vựng.

## 11. Mock Tests Engine (Phase 10A):

- Test Orchestration State Machine: Điều phối tuần tự các module (Listening -> Reading -> Writing -> Speaking). Mỗi chặng thi có trạng thái chuyển tiếp chặt chẽ (`not_started` -> `in_progress` -> `locked` -> `completed`).
- Chống gian lận & Xử lý sự cố mạng: Chặn hoàn toàn việc client tự gửi tín hiệu hoàn thành; áp dụng cơ chế Server-side Time Freeze / Grace Period linh hoạt nếu phát hiện mất kết nối mạng thật.
- Tổng hợp kết quả (Composite Scorecard): Tự động tính toán điểm từng kỹ năng và quy đổi ra Overall Band Score theo thang điểm chuẩn (IELTS/TOEIC/CEFR).

### 3.4. Dịch vụ Phân tích & AI (Analytics & AI Intelligence)

## 11. DB-backed Job Queue & AI Orchestration:

- Kiến trúc Queue trên PostgreSQL:
  - Sử dụng pattern `SELECT FOR UPDATE SKIP LOCKED` tối ưu cho Supabase, tách biệt rạch ròi giữa việc Nhận Job (Claim) và Xử lý ngoại vi để không chiếm dụng connection pool của DB.
  - Cơ chế phục hồi sự cố: Quản lý Timeout qua `locked_at` (Heartbeat), thuật toán Exponential Backoff khi retry, và Dead Letter Queue (DLQ) cho các tác vụ thất bại quá 3 lần.
- Tối ưu hóa chi phí & Bảo vệ hệ thống:
  - Rate Limiting: Giới hạn số lượt chấm Writing/Speaking bằng AI theo cấp tài khoản (Free vs Pro) để tránh lạm dụng.
  - Push Realtime: Client lắng nghe trạng thái qua Supabase Realtime (CDC broadcast), loại bỏ hoàn toàn cơ chế Polling gây nghẽn network.
- Chuẩn hóa đầu ra (Strict JSON Schema): Mọi phản hồi chấm bài từ LLM đều được kiểm định tính toàn vẹn (Schema Validation) trước khi cập nhật vào bảng điểm chính thức.

## 12. Analytics & Progress Engine (Phase 10B):

- Phân tích kỹ năng đa tầng (Taxonomy-driven Insights):
  - Theo dõi dữ liệu học tập dựa trên bộ thẻ chuẩn hóa (Skill -> Question Type -> Grammar/Vocabulary Tag).
  - Phát hiện Vùng yếu (Weak Areas): Tự động kích hoạt cờ cảnh báo khi tỷ lệ chính xác của một tag cụ thể rơi xuống dưới 70% sau tối thiểu 2 lần kiểm tra.
- Kiến trúc tính toán hiệu năng cao:
  - Áp dụng mô hình Aggregation Table (Bảng tích lũy tiến độ theo ngày/kỹ năng) thay vì quét trực tiếp toàn bộ log bài làm cũ.
  - Cung cấp số liệu qua Security Invoker RPCs: Đảm bảo kiểm soát quyền truy cập cấp dòng (RLS), ngăn chặn tuyệt đối rò rỉ dữ liệu giữa các học viên.

## 13. Smart Errors Notebook (Sổ lỗi thông minh):

- Tự động thu thập: Tự động trích xuất các câu làm sai từ Reading, Listening, Grammar cùng lời giải thích và ngữ cảnh lỗi.
- Vòng đời khắc phục lỗi (Mistake Lifecycle):
  - Quản lý trạng thái: `Unresolved` (Mới sai) -> `Reviewing` (Đang ôn luyện) -> `Mastered` (Đã sửa được).
  - Điều kiện Mastered: Trả lời chính xác câu hỏi đó hoặc biến thể tương đương tối thiểu 2 lần ngắt quãng.
- Tích hợp sâu vào Lộ trình: Đẩy các lỗi tồn đọng vào bộ bài tập ôn luyện hàng ngày (Daily Tasks) để đảm bảo học viên thực sự lấp được lỗ hổng kiến thức.

## 4. Chiến lược Đảm bảo Chất lượng (Quality Assurance & Testing Pyramid)

Hệ thống áp dụng mô hình kim tự tháp kiểm thử 4 tầng toàn diện, tích hợp chặt chẽ vào CI/CD pipeline:

## 1. Database Security & Integrity (pgTAP):

- Duy trì hơn 700 assertions chạy trực tiếp trong PostgreSQL.
- Bao phủ 100% các chính sách Row-Level Security (RLS), ngăn chặn triệt để truy cập chéo giữa các học viên và bảo vệ schema `private` (chứa Answer Keys).
- Kiểm thử toàn vẹn dữ liệu: Database Triggers, Foreign Key Cascades, và Constraints của hệ thống versioning nội dung.

## 2. Core Domain & Business Logic (Vitest):

- Thuật toán học tập: Kiểm thử đơn vị toàn diện cho thuật toán Lặp lại ngắt quãng (FSRS/SM-2) và công thức tính điểm (Deterministic Scoring).
- State Machine: Kiểm tra các bước chuyển trạng thái của Session làm bài, Mock Test Timer, và quy tắc phạt quá giờ.
- Data Validation: Kiểm thử tính toàn vẹn của Zod Schemas dùng cho API contracts và AI outputs.

## 3. End-to-End & Trải nghiệm Người dùng (Playwright):

- Luồng cốt lõi: Auth, Progressive Onboarding, nộp bài Reading chia đôi màn hình, và nộp bài Writing.
- Giả lập Media (Speaking/Listening): Chạy E2E với Fake Audio Streams để kiểm tra trọn vẹn luồng cấp quyền Micro, đếm sóng âm, và upload file lên Supabase Storage.
- Accessibility & Multi-platform: Tích hợp thư viện axe-core để kiểm tra tiêu chuẩn WCAG 2.1; test responsive trên viewports Desktop và Mobile.

## 4. AI Evaluation & Performance Testing:

- LLM Benchmark (Evals): Bộ dữ liệu chuẩn (Golden Dataset) gồm các bài Writing/Speaking mẫu để kiểm tra độ trôi dạt điểm số (score drift) và tính ổn định rubric mỗi khi cập nhật Prompt.
- Stress & Concurrency Testing (k6): Giả lập tải đột biến khi thi Mock Test; kiểm tra khả năng chịu tải của DB-backed Job Queue (`FOR UPDATE SKIP LOCKED`) và độ bão hòa Connection Pool của Supabase.

## 5. Các Vấn Đề Tồn Đọng & Mức độ Sẵn sàng (Production Readiness Checklist)

Dự án đã hoàn thành code-base Phase 10C. Các hạng mục kỹ thuật bắt buộc phải hoàn tất và nghiệm thu trước khi Public Launch:

## 1. Cơ sở hạ tầng & Dữ liệu (Infra & Database):

- [KI-085A] Backup & Khôi phục: Kích hoạt Point-in-Time Recovery (PITR) trên Supabase; thực hiện diễn tập khôi phục dữ liệu (Restore drill) thành công trên môi trường Staging.
- [Bổ sung] Connection Pooling: Cấu hình chuẩn kết nối qua Supavisor (Port 6543 - Transaction Mode) cho toàn bộ API routes trên Vercel để ngăn chặn cạn kiệt Connection Pool.
- [Bổ sung] Migration Pipeline: Thiết lập quy trình CI/CD tự động migrate DB qua Supabase CLI, đảm bảo zero-downtime khi deploy schema mới.

## 2. Bảo mật mạng & Kiểm soát truy cập (Security & WAF):

- [KI-087 & KI-092] Rate Limiting & Bot Protection: Kích hoạt Vercel/Cloudflare WAF; tích hợp Cloudflare Turnstile / hCaptcha tại các endpoint nhạy cảm (Sign-up, Reset Password, Submit Exam).
- [KI-090 & KI-091] Hardening Domain: Cấu hình HSTS (preload, includeSubDomains); triển khai Content Security Policy (CSP) nghiêm ngặt với Nonce-based cho scripts, loại bỏ hoàn toàn `unsafe-inline`.
- [Bổ sung] CORS & Storage Security: Khóa chặt CORS của Supabase Storage, chỉ cho phép origin từ domain production upload audio.

## 3. Dịch vụ Bên thứ ba & Kiểm soát Chi phí (Third-party & Cost Guardrails):

- [KI-085B] Giao vận Email: Cấu hình SMTP Production (Resend/Postmark) kèm đầy đủ bản ghi xác thực DNS (SPF, DKIM, DMARC) để đảm bảo tỷ lệ vào Inbox đạt 99%.
- [Bổ sung] AI Budgeting & Circuit Breaker: Cài đặt hạn mức chi phí (Hard Spend Limit) trên OpenAI; áp dụng quota token theo cấp tài khoản (Free/Pro); có cơ chế tự ngắt worker nếu lỗi API tăng đột biến.

## 4. Giám sát & Khả năng quan sát (Observability & Ops):

- [KI-087B] Cấu hình Log Drain: Đẩy Vercel Logs và Supabase Logs về hệ thống tập trung (Better Stack / Axiom / Datadog) để lưu vết phục vụ đối soát.
- [Bổ sung] Error Tracking: Tích hợp Sentry cho cả Web client và Server-side để theo dõi crash, timeout của tác vụ chấm điểm và lỗi codec audio trên các thiết bị di động.

## 6. Đánh giá Khái Quát

Dự án được **kiến trúc cực kỳ xuất sắc**. Tác giả không dùng các phương pháp giải quyết dễ dãi (như tính điểm ở Client hay lưu Answer Key gửi xuống trình duyệt). Mọi logic quan trọng (Chấm điểm, Verify Upload, Tính toán Mock Test, Tính giờ) đều đặt ở Backend/Database với tính bất biến cao.
Có thể nói dự án này không chỉ là một ứng dụng "Chạy được", mà đã mang kiến trúc của một ứng dụng SaaS Giáo dục chuyên nghiệp, sẵn sàng để Scale.

### Bổ Sung

## 1. Phân hệ Kinh doanh & Cổng thanh toán (Billing & Monetization)

Dự án có phân quyền Student (Free/Pro) và giới hạn quota AI, nhưng chưa có thiết kế cho luồng tiền:

- Cổng thanh toán: Tích hợp cổng nào? (Quốc tế: Stripe; Việt Nam: VNPay, MoMo, hoặc giải pháp quét mã VietQR tự động qua SePay/Casso).
- Vòng đời gói cước (Subscription Lifecycle):Xử lý State Machine: trialing $\rightarrow$ active $\rightarrow$ past_due $\rightarrow$ canceled.
- Xử lý Webhook thanh toán bất đồng bộ (chống việc rớt gói khi mạng lag hoặc người dùng tắt trình duyệt sau khi quét QR).
- Quy tắc hạ cấp (Downgrade): Khi hết hạn Pro, dữ liệu bài làm cũ, lịch sử chấm AI và SRS Wordbook sẽ được xử lý ra sao (read-only hay khóa)?
  Chính sách Paywall: Điểm chặn mua hàng nằm ở đâu? (Ví dụ: Chấm Writing miễn phí 1 bài đầu tiên; Mock Test chỉ mở cho Pro; giới hạn 20 từ vựng/ngày với Free).

## 2. Quy trình Vận hành & Nhập liệu Nội dung (Content Ops & Authoring CMS)

IELTS là sản phẩm sống bằng chất lượng đề thi. Hệ thống có tính năng Immutable Content ở database, nhưng ai là người đưa đề vào hệ thống?

- CMS cho Giáo viên / Content Creator: Giao diện nào để người không biết code nhập bài đọc dài 1.000 từ, upload audio từng Section của bài Listening, bôi đen đáp án trắc nghiệm, gắn thẻ Taxonomy (Grammar/Skill tag)?
- Cơ chế Import hàng loạt (Bulk Ingestion): Khả năng import đề thi từ file JSON/Markdown/Excel chuẩn hóa thay vì nhập tay từng câu hỏi trên giao diện admin.
- Quy trình Kiểm duyệt (Editorial Workflow): Trạng thái nội dung: Draft $\rightarrow$ In Review (Giáo viên duyệt đề/audio) $\rightarrow$ Staging Test $\rightarrow$ Published (Immutable).

## 3. Động lực học tập & Tương tác (Gamification & Retention Engine)

Với app tự học, tỷ lệ người dùng bỏ cuộc sau 7 ngày thường trên 80%. Hệ thống cần có cơ chế giữ chân:

- Hạ tầng Thông báo (Push Notification & Email Lifecycle):Tích hợp Web Push / Mobile Push (FCM, OneSignal) và Email động (Resend).
- Lịch bắn tự động: Nhắc học theo khung giờ cá nhân hóa (reminder_time), cảnh báo sắp đứt Streak trước 20:00 hàng ngày, tóm tắt báo cáo tiến độ tuần vào sáng Chủ Nhật.
- Cơ chế Gamification:
  - Thuật toán tính Streak (Chuỗi ngày học liên tục) và cơ chế mua/dùng "Bình đóng băng" (Streak Freeze).
  - Hệ thống điểm kinh nghiệm (XP), cấp độ (Level) và Bảng xếp hạng (Leaderboard) theo tuần để kích thích thi đua.

## 4. Rủi ro Bản quyền & Pháp lý (Legal & IP Risks)

Đây là "tử huyệt" của các app luyện thi IELTS:

- Bản quyền đề thi (Copyright IP): Đề thi lấy từ đâu? Nếu dùng trực tiếp đề trong bộ Cambridge IELTS mà không có giấy phép sở hữu trí tuệ, app có nguy cơ bị Apple/Google gỡ khỏi Store hoặc bị kiện bản quyền. Kế hoạch cần nêu rõ: Đề do đội ngũ học thuật tự biên soạn tương đương hay dùng nguồn nào?
- Điều khoản dịch vụ & Hoàn tiền (ToS & Refund Policy): Quy định rõ cam kết chất lượng AI (AI chấm chỉ mang tính tham khảo, không đại diện cho điểm thi thật của IDP/British Council) để tránh khiếu nại pháp lý.

## 5. Kế hoạch Triển khai & Quản lý Dự án (Project Execution & Rollout)

Một bản kế hoạch A-Z bắt buộc phải có lộ trình thời gian và cách phân bổ tài nguyên:

- Lộ trình Rollout (Giai đoạn ra mắt):
  - Alpha (Nội bộ): Test toàn bộ pipeline kỹ thuật và 700 test pgTAP.
  - Closed Beta (50-100 học viên thật): Đo độ lệch điểm AI Writing/Speaking so với giáo viên thật; đo tỉ lệ rớt mạng khi thi Mock Test.
  - Public Launch (Thương mại hóa): Mở cổng thanh toán và chạy chiến dịch tiếp cận người dùng.
- Kế hoạch Dự phòng & SLA (Incident Response Runbook):
  - Kịch bản xử lý khi OpenAI API bị sập toàn cầu trong lúc học viên đang thi Mock Test.
  - Chỉ số RTO (Thời gian phục hồi tối đa) và RPO (Mức độ mất mát dữ liệu chấp nhận được) khi khôi phục database từ PITR.
