# TASK EXECUTION PLAN: Rebuild Reading Hub (`/practice/reading`) — Indigo Scholar Dark Navy & 3D Lexical Matrix

## 1. Mục Tiêu (Goal)

Tái cấu trúc và nâng cấp toàn diện trang Luyện Đọc IELTS (`src/app/(dashboard)/practice/reading`) sang chuẩn Dark Navy & Indigo Scholar, tích hợp:

- Khối ma trận từ vựng 3D Three.js (`ThreeReadingVisualizer`)
- Trạm phản xạ đọc hiểu tức thì (`LiveReadingLab`): Bẫy True/False/Not Given, Speed Reading WPM Meter, Bẫy Matching Headings
- Bento Grid 4 Chế độ đọc chuyên sâu
- Split-View Quick Reading Modal (Passage bên trái, Câu hỏi bên phải)
- Kho bài đọc thực chiến với bộ lọc Passage 1-3, tìm kiếm chủ đề và popover từ vựng học thuật C1/C2

---

## 2. Danh Sách File Cần Tạo & Chỉnh Sửa

| File                                                                         | Hành Động   | Mô Tả                                                                            |
| ---------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `src/app/(dashboard)/practice/reading/components/reading-curated-data.ts`    | **CREATE**  | Định nghĩa types & dữ liệu Curated (Passages, T/F/NG traps, Speed tests, Tracks) |
| `src/app/(dashboard)/practice/reading/components/ThreeReadingVisualizer.tsx` | **CREATE**  | Three.js WebGL 3D Cybernetic Lexical Matrix & Laser Scanner                      |
| `src/app/(dashboard)/practice/reading/components/LiveReadingLab.tsx`         | **CREATE**  | Mini-lab đọc hiểu: T/F/NG Detective, Speed WPM Meter, Matching Headings          |
| `src/app/(dashboard)/practice/reading/components/QuickReadingModal.tsx`      | **CREATE**  | Split-View modal đọc và làm bài trực tiếp (Passage + Question Sheet)             |
| `src/app/(dashboard)/practice/reading/reading.css`                           | **CREATE**  | Bổ sung styling hiệu ứng laser scan, split-view layout                           |
| `src/app/(dashboard)/practice/reading/client.tsx`                            | **CREATE**  | Component điều phối trung tâm Reading Hub                                        |
| `src/app/(dashboard)/practice/reading/page.tsx`                              | **REWRITE** | Server Component tải dữ liệu Supabase song song và render client                 |
| `src/app/(dashboard)/practice/reading/reading.test.tsx`                      | **CREATE**  | Unit tests toàn diện cho trang Reading Hub                                       |

---

## 3. Các Bước Thực Hiện Chi Tiết

1. **Bước 1**: Tạo file `components/reading-curated-data.ts` với đầy đủ types TypeScript an toàn. [HOÀN THÀNH]
2. **Bước 2**: Tạo component `ThreeReadingVisualizer.tsx` và `LiveReadingLab.tsx`. [HOÀN THÀNH]
3. **Bước 3**: Tạo `QuickReadingModal.tsx` và `reading.css`. [HOÀN THÀNH]
4. **Bước 4**: Tạo `client.tsx` và cập nhật `page.tsx`. [HOÀN THÀNH]
5. **Bước 5**: Tạo `reading.test.tsx` và kiểm tra TypeScript (`npx tsc --noEmit`), chạy vitest (66/66 test files passed, 262/262 tests passed) và Next.js production build (`npm run build` thành công 100%). [HOÀN THÀNH]

---

## 4. Trạng Thái Hiện Tại: HOÀN TẤT G0 (CLOUD DATABASE RESTORED)

1. Tái cấu trúc Reading Hub và Listening Hub theo chuẩn Indigo Scholar & Dark Navy 3D: Đã hoàn tất 100%.
2. Giải quyết nút thắt Go-Live về kho nội dung mỏng:
   - Sửa lỗi POS trong `scripts/content/ingest-oxford-vocab.mjs` và nạp thành công 320 từ vựng Oxford CEFR (`20261024100000_seed_oxford_cefr_vocabulary.sql`).
   - Xây dựng script `scripts/content/seed-mvp-curriculum.mjs` và sinh migration `20261025000000_seed_mvp_learning_curriculum.sql`.
   - Đồng bộ toàn bộ dữ liệu vào `supabase/seed.sql` cho môi trường dev/local.
   - Cập nhật UI Thư viện học `src/app/(dashboard)/learn/client.tsx` để hiển thị 4 module mới.
3. **HOÀN THÀNH G0 — KHÔI PHỤC VÀ ĐẨY DỮ LIỆU LÊN CLOUD DEV SUPABASE (`tpqlqwvzqhjrtqpitslk`)**:
   - Định danh chính xác Region: `ap-northeast-1` (Tokyo, Nhật Bản).
   - Cấu hình IPv4 Connection Pooler: `aws-0-ap-northeast-1.pooler.supabase.com:5432`.
   - Đẩy thành công toàn bộ dữ liệu giáo trình lên Cloud:
     - `learning_modules`: 4 Modules (`published`)
     - `lessons`: 20 Lessons
     - `lesson_versions`: 20 Versions (`published`)
     - `lesson_sections`: 60 Sections
     - `exercise_sets`: 27 Sets
     - `exercise_questions`: 146 Questions
     - `grammar_topics`: 13 Topics
     - `vocabulary_entries`: 328 Entries
4. Xác minh kỹ thuật toàn diện:
   - TypeScript `tsc --noEmit`: 0 lỗi.
   - Vitest: 19/19 tests Hubs passed, 66/66 test files passed.
   - Next.js build: 383/383 routes passed.
5. **HOÀN THÀNH G2 MILESTONE: SỬA LỖI TOOLING/LINT & TÁI CẤU TRÚC TOÀN DIỆN SPEAKING + WRITING HUBS**:
   - Khắc phục lỗi `next lint` trên Next.js 16 CLI và dọn sạch toàn bộ ESLint errors (`0 errors`).
   - Tái cấu trúc Speaking Hub (`/practice/speaking`) với Three.js WebGL Acoustic Visualizer, IPA Phoneme Gym, 60s Prep Coach và Quick Studio Modal.
   - Tái cấu trúc Writing Hub (`/practice/writing`) với Three.js WebGL Lexical Crystal, Paraphrase Forge, Cohesion Matrix và Zen Focus Writing Studio.
   - Kiểm thử toàn trình: TypeScript (`0 errors`), ESLint (`0 errors`), Vitest (68/68 files passed, 274/274 tests passed), Next.js Build (383/383 routes passed 100%).
