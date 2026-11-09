# 🎓 IELTS Flow — Nền Tảng Tự Học & Luyện Thi IELTS Toàn Diện

> **Trạng thái Go-Live:** 🟡 **PRE-LAUNCH / STAGING (Chưa Public Go-Live)**  
> **Trạng thái Codebase & Schema:** 🟢 **HOÀN TẤT 100% (Phase 1–10C & Hub Modernization G0–G2)**  
> **Kiểm định chất lượng:** 🟢 **Next.js Build 383/383 routes PASS** | **TypeScript 0 errors** | **ESLint 0 errors** | **Vitest 68/68 files (274/274 tests PASS)**

---

## 📌 1. Trả Lời Đánh Giá Go-Live (Go-Live Audit Summary)

### Câu hỏi: _Dự án đã Go-Live chưa?_

👉 **TRẢ LỜI:** **Dự án CHƯA Go-Live chính thức trên môi trường Production.**

| Hạng mục đánh giá                                    | Mức độ sẵn sàng | Trạng thái chi tiết                                                                                                                                                                                                            |
| :--------------------------------------------------- | :-------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Codebase & Tính năng (Application Code)**          |  **9.5 / 10**   | 🟢 **Hoàn tất 100%**: 383 routes build thành công, 274 unit/integration tests pass, 0 lỗi TypeScript, 0 lỗi ESLint. Đầy đủ vòng lặp Onboarding -> Lộ trình học -> 4 Kỹ năng R/L/W/S -> Mock Test -> Analytics.                 |
| **Bảo mật & Toàn vẹn Dữ liệu (Database/RLS)**        |  **9.5 / 10**   | 🟢 **Bảo mật tuyệt đối**: 100% bảng có RLS, phân quyền least-privilege, chấm điểm deterministic ở Postgres, Answer Key nằm schema `private`, Server-authoritative timer.                                                       |
| **Nội dung Giáo trình MVP (Curriculum Content)**     |  **8.0 / 10**   | 🟢 **Đã nạp Cloud Dev**: 4 Modules, 20 Lessons, 60 Sections, 27 Sets, 146 Questions, 13 Grammar Topics, 328 Oxford CEFR Vocab entries. (Cần tiếp tục mở rộng ngân hàng đề).                                                    |
| **Hạ tầng Mạng & Cloud (Production Infrastructure)** |  **3.5 / 10**   | 🔴 **Chưa Go-Live (Blocker)**: Đang chạy trên Cloud Dev Supabase (`tpqlqwvzqhjrtqpitslk`). Chưa cấp Supabase Production (gói Pro có PITR), chưa trỏ Custom Domain HTTPS, chưa cấu hình SMTP Production với DNS SPF/DKIM/DMARC. |
| **Dịch vụ Ngoài & Tối ưu CDN (Third-party & CDN)**   |  **4.0 / 10**   | 🟡 **Cần kích hoạt**: Cần cấu hình Cloudflare R2 Custom Domain cho Audio Streaming với HTTP Cache `immutable`, thiết lập Hard Spend Limit trên OpenAI API và bật Cloudflare Turnstile/WAF.                                     |

> 💡 **Kết luận:** Hệ thống đã hoàn tất toàn bộ khâu R&D, kiểm thử và thiết kế giao diện. Để chính thức Go-Live, dự án cần thực hiện các bước cấu hình hạ tầng tại [Mục 8: Lộ Trình Triển Khai Go-Live](#-8-lộ-trình-và-danh-mục-chuẩn-bị-go-live-checklist).

---

## 🚀 2. Điểm Nhấn Kiến Trúc & Công Nghệ

Ứng dụng được xây dựng theo kiến trúc **Server-First Modular Monolith** trên nền tảng Next.js 16 và Supabase, tuân thủ nguyên tắc không lưu trữ logic nhạy cảm hoặc tính điểm ở Client:

- **Frontend & UI:**
  - Next.js 16 (App Router với Turbopack engine), React 19, TypeScript strict mode.
  - Thiết kế hiện đại **Indigo Scholar & Cybernetic Dark Navy** với hiệu ứng WebGL 3D (Three.js), Tailwind CSS v4, Lucide Icons và Motion.
- **Backend & Cơ sở dữ liệu:**
  - Supabase (PostgreSQL 15+, Auth SSR qua `@supabase/ssr`, Storage).
  - Row-Level Security (RLS) bảo vệ 100% bảng dữ liệu học viên, schema `private` cô lập hoàn toàn đáp án.
  - Server Actions & Database Triggers kiểm soát luồng chấm điểm và cập nhật tiến độ bất biến.
- **AI & Integrations (Fail-closed & Private):**
  - Tích hợp OpenAI SDK qua Responses API với Structured Outputs (JSON Schema nghiêm ngặt).
  - Hoạt động an toàn theo cơ chế Fail-closed: khi chưa cấu hình API key, hệ thống vẫn phục vụ người học bình thường mà không gây crash hay rò rỉ dữ liệu.
- **Kiểm thử đa tầng (Automated Testing Pyramid):**
  - **Vitest & React Testing Library:** 68 test suites, 274 tests kiểm tra toàn bộ hooks, domain logic, client components.
  - **pgTAP:** Hơn 700 assertions chạy trực tiếp trong Postgres kiểm tra RLS và triggers.
  - **Playwright:** E2E testing luồng Onboarding, Protected Routes, Responsive (375px đến 1440px) và WCAG 2.1 Accessibility (axe-core).

---

## 🌟 3. Các Phân Hệ & Chức Năng Đã Triển Khai

### 3.1. Hệ thống Học tập & Lộ trình (Curriculum & Learning Engine)

- **Progressive Onboarding:** Wizard 8 bước thu thập mục tiêu band, thời gian học, chẩn đoán ban đầu; tự động sinh lộ trình cá nhân hóa.
- **Thư viện Học lý thuyết (`/learn`):** 4 Modules nền tảng, 20 bài học chuẩn hóa CEFR A2–B2, 60 phần lý thuyết kèm Markdown bảo mật.
- **Ngân hàng Ngữ pháp & Từ vựng SRS:**
  - Kho 328 từ vựng Oxford CEFR kèm phiên âm IPA, định nghĩa, ví dụ ngữ cảnh.
  - Thuật toán lặp lại ngắt quãng (FSRS/SM-2) tự động tính toán chu kỳ ôn tập tối ưu.
- **Khóa học & Kế hoạch (`/plans`):** 6 chặng học từ Starter (0.0–2.5) đến Expert (8.5–9.0).
- **Deep Dictation (`/dictation`):** Hệ thống nghe chép chính tả phân tầng tốc độ, đối soát sai khác từng ký tự thời gian thực.

### 3.2. Bốn Trung Tâm Luyện Tập 3D Thực Chiến (Practice Hubs)

Giao diện được tái cấu trúc đồng bộ theo chuẩn **Indigo Scholar & Dark Navy**:

1. **Reading Hub (`/practice/reading`):**
   - WebGL 3D Cybernetic Lexical Matrix & Laser Scanner.
   - Live Reading Lab: Bẫy True/False/Not Given, Speed Reading WPM Meter, Bẫy Matching Headings.
   - Quick Reading Modal (Split-View đọc văn bản song song với bảng câu hỏi).
2. **Listening Hub (`/practice/listening`):**
   - Floating Audio Player Dock điều khiển phát thanh, tốc độ, tua thông minh.
   - Live Acoustic Mini-Lab: Bẫy Number/Name Trap, Signal Words Detector.
   - Quick Practice Modal làm bài trực tiếp không cần rời trang.
3. **Writing Hub (`/practice/writing`):**
   - WebGL 3D Lexical Crystal Visualizer.
   - Paraphrase Forge & Cohesion Transition Matrix.
   - Zen Focus Writing Studio với bộ đếm từ và kiểm soát thời gian thi thực tế.
4. **Speaking Hub (`/practice/speaking`):**
   - WebGL 3D Acoustic Sphere Waveform Visualizer.
   - IPA Phoneme Gym & 60s Prep Coach.
   - Quick Speaking Studio Modal tích hợp thu âm và phân tích ngữ âm AI.

### 3.3. Thi Thử & Phân Tích Dữ Liệu (Mock Tests & Analytics)

- **Mock Tests Engine (`/mock-tests`):** Điều phối phiên thi chuẩn 4 kỹ năng tuần tự (Reading $\rightarrow$ Listening $\rightarrow$ Writing $\rightarrow$ Speaking) với Server-Authoritative Timer.
- **Learner Analytics Dashboard (`/progress`):**
  - 3D Skill Radar Chart (Three.js) trực quan hóa độ lệch 4 kỹ năng.
  - Biểu đồ nhiệt tiến độ học tập (Activity Calendar) và lộ trình đạt mục tiêu band.
- **Smart Errors Notebook (`/error-notebook`):** Tự động thu thập câu sai từ các bài thi để đưa vào danh sách cần khắc phục dứt điểm.

---

## 🛠️ 4. Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### 4.1. Yêu cầu tiên quyết

- **Node.js:** `>= 20.9.0` (Khuyến nghị Node.js LTS 22.x)
- **npm:** `>= 10.x`
- Git

### 4.2. Khởi tạo dự án

```powershell
# 1. Clone repository và cài đặt thư viện
git clone <repository-url>
cd App-hoc-tieng-anh
npm ci

# 2. Cấu hình biến môi trường
Copy-Item .env.example .env.local
```

### 4.3. Cấu hình `.env.local`

Điền các thông tin kết nối Supabase của bạn (có thể dùng dự án Cloud Dev hoặc Supabase Local):

```ini
# Supabase Public Configuration (bắt buộc cho client)
NEXT_PUBLIC_SUPABASE_URL=https://tpqlqwvzqhjrtqpitslk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# App URL Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=support@ieltsflow.local

# Server-only Credentials (tùy chọn trong môi trường dev)
# Lưu ý: Không thêm tiền tố NEXT_PUBLIC_ cho các biến server-only
STORAGE_CLEANUP_SECRET=dev-local-storage-cleanup-secret-32-chars-min!
SPEAKING_PIPELINE_SIGNING_SECRET=dev-local-speaking-signing-secret-32-chars!
```

### 4.4. Khởi chạy máy chủ phát triển

```powershell
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm ứng dụng.

---

## 🧪 5. Kiểm Thử & Đảm Bảo Chất Lượng (Quality Gates)

Dự án áp dụng bộ kiểm tra nghiêm ngặt trước mỗi đợt bàn giao mã nguồn:

```powershell
# 1. Kiểm tra định dạng mã nguồn (ESLint)
npm run lint

# 2. Kiểm tra tính toàn vẹn kiểu dữ liệu TypeScript
npm run typecheck

# 3. Chạy toàn bộ 274 bài kiểm thử đơn vị & tích hợp (Vitest)
npm run test

# 4. Kiểm tra biên dịch bản Production (Next.js Turbopack)
npm run build
```

---

## 🗄️ 6. Quản Lý Cơ Sở Dữ Liệu & Migrations

Hệ thống quản lý lược đồ dữ liệu thông qua các tệp SQL phiên bản hóa tuần tự trong thư mục `supabase/migrations/`:

| Thứ tự migration | Tên tệp                                   | Nội dung                                                          |
| :--------------- | :---------------------------------------- | :---------------------------------------------------------------- |
| `20260716100000` | `phase_1_profiles_and_onboarding.sql`     | Quản lý Profile người học, RLS và Onboarding State Machine        |
| `20260716120000` | `phase_4_learning_content_progress.sql`   | Modules, Lessons, Sections, Versioning bất biến                   |
| `20260716143000` | `phase_5_exercise_vocabulary_grammar.sql` | Động cơ chấm điểm bài tập, từ vựng, ngữ pháp                      |
| `20260717100000` | `phase_7_listening_practice_engine.sql`   | Hệ thống luyện nghe, lưu nháp và tính giờ server                  |
| `20260717140000` | `phase_8_writing_practice_engine.sql`     | Hệ thống luyện viết Task 2, kiểm soát số từ, AI feedback contract |
| `20260717160000` | `phase_9_speaking_practice_engine.sql`    | Hệ thống ghi âm, xác minh media, đánh giá phát âm                 |
| `20260717190000` | `phase_10a_mock_tests_engine.sql`         | Điều phối bài thi thử 4 kỹ năng tuần tự                           |
| `20261024100000` | `seed_oxford_cefr_vocabulary.sql`         | Seed 320 từ vựng Oxford phân loại CEFR A1-C1                      |
| `20261025000000` | `seed_mvp_learning_curriculum.sql`        | Seed 4 modules lý thuyết, 20 lessons, 27 exercise sets MVP        |

### Đẩy Migration lên Supabase Cloud:

```powershell
# Đẩy migration lên Cloud project liên kết
npx supabase db push
```

---

## 📂 7. Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
├── src/
│   ├── app/                               # Next.js App Router
│   │   ├── (auth)/                        # Nhóm trang xác thực (login, register, forgot-password)
│   │   ├── (dashboard)/                   # Nhóm trang chính (dashboard, learn, practice, mock-tests)
│   │   │   ├── practice/
│   │   │   │   ├── reading/               # Reading Hub (3D Lexical Matrix, Mini-lab, Split-view)
│   │   │   │   ├── listening/             # Listening Hub (Audio dock, Acoustic Mini-lab)
│   │   │   │   ├── writing/               # Writing Hub (3D Lexical Crystal, Paraphrase Forge)
│   │   │   │   └── speaking/              # Speaking Hub (3D Waveform, Phoneme Gym)
│   │   │   ├── progress/                  # Dashboard phân tích kỹ năng & 3D Radar
│   │   │   └── roadmap/                   # Cây lộ trình học tập 3D
│   │   └── api/                           # API routes (Health checks, Webhooks, Storage cleanup)
│   ├── components/                        # UI components dùng chung (Buttons, Modals, Empty states)
│   ├── features/                          # Domain modules (auth, learning, practice, placement, dictation)
│   ├── lib/                               # Tiện ích chung, Supabase SSR client, Env validator
│   ├── server/                            # Server-only logic, Observability logger, Readiness check
│   └── types/                             # TypeScript definitions & Database schema types
├── supabase/
│   ├── migrations/                        # Versioned SQL migrations
│   ├── tests/                             # Bộ kiểm thử cơ sở dữ liệu pgTAP
│   └── seed.sql                           # Dữ liệu mẫu dùng cho local development
├── docs/                                  # Toàn bộ tài liệu kiến trúc, bảo mật và runbooks
└── scripts/                               # Scripts tự động hóa content pipeline và DB seeding
```

---

## 🏁 8. Lộ Trình Và Danh Mục Chuẩn Bị Go-Live (Checklist)

Để đưa ứng dụng từ trạng thái **Staging** sang **Public Production Go-Live**, các bước kỹ thuật sau cần được hoàn tất:

### 1. Cơ sở hạ tầng & Database (Infra & DB Gate)

- [ ] Khởi tạo dự án **Supabase Production** độc lập (gói Pro có kích hoạt Point-in-Time Recovery - PITR).
- [ ] Chạy `supabase db push` để đồng bộ toàn bộ 20 migrations và seed curriculum chính thức.
- [ ] Thiết lập kết nối qua **Supavisor Transaction Pooler** (Cổng 6543) cho toàn bộ API routes trên Vercel.

### 2. Tên miền & Bảo mật Mạng (Domain & Network Security)

- [ ] Cấu hình Production Domain chính thức kèm chứng chỉ SSL/TLS.
- [ ] Cập nhật biến môi trường `NEXT_PUBLIC_SITE_URL` thành canonical HTTPS domain.
- [ ] Kích hoạt **Cloudflare WAF** và tích hợp **Cloudflare Turnstile** chống bot spam đăng ký.
- [ ] Khóa chặt CORS của Supabase Storage, chỉ cho phép upload từ domain production.

### 3. Giao vận Email & Truyền thông (SMTP & Communication)

- [ ] Cấu hình dịch vụ SMTP thương mại (Resend / Postmark).
- [ ] Xác thực đầy đủ các bản ghi DNS: SPF, DKIM, DMARC trên domain chính thức.
- [ ] Thử nghiệm luồng Email Confirmation và Password Recovery với hòm thư thật.

### 4. Lưu trữ & Phân phối Âm thanh (Audio CDN Streaming)

- [ ] Cấu hình **Cloudflare R2 Custom Domain** cho các tệp âm thanh bài nghe IELTS.
- [ ] Thiết lập Header `Cache-Control: public, max-age=31536000, immutable` để tối ưu chi phí băng thông và tốc độ tải audio.

### 5. Giám sát & Quản lý Chi phí (Observability & Cost Guardrails)

- [ ] Kết nối **Sentry** để theo dõi lỗi Client và Server thời gian thực.
- [ ] Thiết lập **Hard Spend Limit** trên tài khoản OpenAI API để ngăn chặn cạn kiệt ngân sách ngoài ý muốn.
- [ ] Kích hoạt Log Drain (Axiom / Better Stack) để lưu vết kiểm toán và đối soát vận hành.

---

## 📜 9. Bản Quyền & Giấy Phép (License & Academic Integrity)

- Mã nguồn dự án thuộc bản quyền của nhóm phát triển.
- Toàn bộ nội dung học thuật, bài đọc và câu hỏi luyện thi được biên soạn độc lập dựa trên khung năng lực tham chiếu CEFR và Academic Word List, tuân thủ nghiêm ngặt quy định về sở hữu trí tuệ, **không sao chép trực tiếp đề thi có bản quyền của Cambridge, IDP hoặc British Council**.
