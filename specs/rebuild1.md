# Kế Hoạch Refactor Cấu Trúc Dự Án (Architecture Rebuild)

## Mục Tiêu (Goal Description)

Dự án hiện tại đang áp dụng mô hình Feature-Based (`src/features/*`), tuy nhiên qua quá trình phát triển (đặc biệt là 4 kỹ năng Reading, Listening, Writing, Speaking), code đang có dấu hiệu trùng lặp (duplicate) lớn và ranh giới giữa Server / Client chưa thực sự gắt gao.

Kế hoạch này nhằm **tái cấu trúc (Refactor)** codebase để:

1. **Giảm thiểu trùng lặp code (DRY):** Hợp nhất các luồng logic giống nhau.
2. **Tuân thủ chặt chẽ Feature-Sliced Design (FSD):** Rõ ràng ranh giới giữa UI, Logic, và Data.
3. **Tăng khả năng mở rộng (Scalability):** Dễ dàng thêm các module mới sau này mà không làm phình to size của bundle.

---

## Các Hạng Mục Refactor Đề Xuất (Proposed Changes)

### 1. Hợp nhất hệ thống Luyện tập (Unified Practice Engine)

Hiện tại `reading-runner.tsx`, `listening-runner.tsx`, `writing-runner.tsx`, và `speaking-runner.tsx` đều là những component rất lớn (> 20KB) và chia sẻ chung một flow: `Bắt đầu -> Chạy Countdown -> Làm bài -> Nộp bài -> Chờ chấm -> Kết quả`.

- **Hành động:** Tạo một Feature lõi `src/features/core-practice` chứa component `<GenericPracticeEngine />`.
- **Cách hoạt động:** Các kỹ năng sẽ truyền `Strategy` (ví dụ: `ReadingStrategy`, `ListeningStrategy`) vào Engine này thay vì tự viết lại toàn bộ logic quản lý state, timer, và submission.
- **Lợi ích:** Giảm được khoảng 40% lượng code thừa, dễ dàng bảo trì chung một luồng test.

### 2. Chuẩn hóa cấu trúc thư mục Feature (Strict FSD)

Trong mỗi feature (ví dụ: `src/features/listening`), cấu trúc hiện tại đang để chung các file. Cần chuẩn hóa lại theo FSD:

```text
src/features/listening/
├── api/          # Server Actions, Data Fetching (chỉ chạy trên Server)
├── ui/           # Pure UI Components (Client/Server độc lập)
├── model/        # Zustand stores, Custom Hooks, Zod Schemas
└── index.ts      # Public API (Export duy nhất những gì cần thiết)
```

- **Lợi ích:** Dễ dàng tracking lỗi, đảm bảo Server Actions không bị lọt vào Client bundle.

### 3. Tách bạch Routing (`app/`) và Domain Logic (`features/`)

- **Vấn đề:** Đôi khi logic gọi API (Data Fetching) bị kẹp trực tiếp vào `app/.../page.tsx` khiến file page trở nên quá cồng kềnh.
- **Hành động:** Thư mục `app/` **chỉ** làm nhiệm vụ Routing (nhận URL params, searchParams, metadata) và lập tức gọi đến một `<FeatureScreen />` từ thư mục `features/`. Toàn bộ data fetching sẽ được gom vào các hàm `loadFeatureData()` export từ Feature đó.

### 4. Quy hoạch lại Shared Component (`src/components/`)

- **ui/**: Chỉ chứa các Headless UI, Shadcn UI, hoặc các component tĩnh hoàn toàn, không dính líu đến bất kỳ logic nghiệp vụ nào (VD: `button.tsx`, `badge.tsx`).
- **shared/**: Chứa các component mang tính ứng dụng cao nhưng dùng chung ở nhiều nơi (VD: `empty-state.tsx`, `page-header.tsx`, `reveal-stagger.tsx`).
- **Hành động:** Kiểm tra và chuyển dời các file đang bị đặt sai vị trí (Ví dụ: `word-of-the-day-card.tsx` đang nằm ở `ui/` nên được chuyển về `features/dashboard/ui/`).

---

## Kế Hoạch Thực Thi & Xác Minh (Verification Plan)

**Phase 1:** Quy hoạch lại `src/components/` và chuẩn hóa chuẩn FSD cho 1 Feature nhỏ (VD: `dashboard`).
**Phase 2:** Refactor 4 kỹ năng (Reading, Listening, Writing, Speaking) để dùng chung `GenericPracticeEngine`.
**Phase 3:** Xóa code thừa, dọn dẹp các hook/component không còn sử dụng.

### Automated Tests

Sau mỗi Phase, bắt buộc chạy:

- `npm run typecheck` (Kiểm tra lỗi TypeScript do di chuyển/đổi tên file).
- `npm run lint` (Kiểm tra ESLint).
- `npm run build` (Đảm bảo Next.js build thành công, không vỡ Server/Client boundaries).

### User Review Required

> [!IMPORTANT]  
> Việc tạo ra **Generic Practice Engine (Phase 2)** là một "Breaking Change" lớn đối với cấu trúc code hiện tại. Bạn vui lòng đọc kỹ phương án này. Nếu bạn đồng ý đánh đổi thời gian refactor lấy một cấu trúc gọn gàng và dễ mở rộng hơn, hãy phản hồi lại để tôi tiến hành bắt đầu **Phase 1**.
