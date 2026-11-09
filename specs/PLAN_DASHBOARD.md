# Kế Hoạch Đập Đi Xây Lại & Nâng Cấp Tính Năng (Dashboard)

## Mục Tiêu

Nâng cấp toàn diện trang `/dashboard` (`page.tsx` và `client.tsx`) để biến nó thành một "Command Center" (Trung tâm điều khiển) thực thụ. Không chỉ dừng lại ở việc làm đẹp giao diện, chúng ta sẽ bổ sung các tính năng tương tác (Interactive Features), khắc phục lỗi kỹ thuật, và mang lại trải nghiệm SaaS giáo dục cao cấp.

---

## Các Tính Năng & Chức Năng Sẽ Thêm Mới (Features)

### 1. Smart Learning Insights (Gợi ý học tập thông minh)

- **Tính năng:** Bổ sung một Widget "Smart AI Suggestion" phân tích dữ liệu học (mock data hoặc thuật toán cơ bản).
- **UI:** Ví dụ hiển thị: _"Bạn đang yếu kỹ năng Listening. Gợi ý: Dành 15 phút hôm nay để làm bài Dictation để cải thiện."_ kèm theo một nút Action truy cập nhanh.

### 2. Interactive Word of the Day (Từ vựng mỗi ngày tương tác)

- **Tính năng:** Thay vì một cụm text tĩnh, từ vựng mỗi ngày sẽ thay đổi ngẫu nhiên nhưng cố định theo từng ngày (Deterministic Daily Seed).
- **Bổ sung Text-to-Speech:** Thêm nút "Loa" để phát âm từ vựng ngay trên Dashboard sử dụng API Web Speech gốc của trình duyệt.
- **UI:** Thêm hiệu ứng lật thẻ (Flip Card) hoặc Reveal khi hover vào ví dụ của từ vựng đó.

### 3. Gamification Nâng Cao (Streak & League)

- **Streak Freeze Indicator:** Trạng thái Streak sẽ có thêm icon "Băng" (Ice/Freeze) nếu user đang trang bị Streak Freeze.
- **Weekly League Podium (Bảng xếp hạng trực quan):**
  - Nâng cấp UI của bảng xếp hạng mini hiện tại.
  - Thêm thanh tiến trình biểu diễn khoảng cách XP của user so với người đứng ngay trên mình (VD: "Chỉ cần +50 XP để vượt mặt Nam Hoàng").

### 4. Interactive Quick Practice (Luyện tập chớp nhoáng)

- **Tính năng:** Nâng cấp widget `QuickQuiz` thành một Mini-flashcard có thể tương tác trực tiếp trên Dashboard mà không cần chuyển trang. User có thể bấm xem đáp án hoặc chọn câu trắc nghiệm nhanh 1 câu.

### 5. Goal Adjustment (Điều chỉnh mục tiêu nhanh)

- **Tính năng:** Trong phần "Daily Goal", thêm một nút nhỏ `[Edit]` để user có thể thay đổi mục tiêu số bài học mỗi ngày (từ 2 bài lên 4 bài) thông qua một Popover/Dropdown đơn giản.

---

## Cải Thiện UI/UX (Design Taste & Polish)

### 1. Motion & Micro-interactions

- Áp dụng `RevealStagger` và `RevealFade` (đã tạo ở bước Onboarding) để các block widget (Stats, Continue Learning, Features, Heatmap) trượt lên mượt mà theo thứ tự khi vừa load xong trang.
- Thêm hiệu ứng vật lý (Tactile Feedback): Các chip XP, Streak, và các card khoá học đều có hiệu ứng `active:scale-[0.98]` khi click.

### 2. Sửa lỗi kỹ thuật (React Hydration Fix)

- **Study Heatmap Bug:** Hiện tại `heatData` đang dùng `Math.random()` trực tiếp ở Client render lần đầu, gây ra lỗi **Hydration Mismatch** giữa Server và Client.
- **Giải pháp:** Chuyển thuật toán sinh mảng Heatmap lên `page.tsx` (Server) và truyền xuống qua Props, hoặc dùng một hàm `Deterministic Random` với seed là ngày hiện tại.

### 3. Typography & Spacing

- Căn chỉnh lại `tracking-tighter` (giảm khoảng cách chữ) cho tất cả các Header (`h2`, `h3`) của các Section để tạo cảm giác gọn gàng, sắc sảo.
- Sử dụng màu sắc tương phản tốt hơn cho các trạng thái "Completed" và "In Progress" trong phần Today's Plan.

---

## Lộ Trình Thực Thi (Implementation Steps)

1. **Bước 1 (Data & Logic Fix):** Cấu trúc lại `page.tsx`, thêm logic random deterministic cho Heatmap và Word of the Day truyền xuống `client.tsx`.
2. **Bước 2 (Motion & Layout):** Bọc các thẻ section trong `client.tsx` bằng component `motion/react` để tạo hiệu ứng stagger entrance.
3. **Bước 3 (Build New Features):**
   - Code chức năng Text-to-Speech cho Word of the Day.
   - Xây dựng Mini Interactive QuickQuiz.
   - Nâng cấp giao diện Weekly League và Streak.
4. **Bước 4 (Review & Test):** Chạy `npm run lint` & `npm run build` để kiểm tra Hydration error và tính ổn định.

> **Bạn hãy đọc qua toàn bộ các tính năng mới bổ sung này. Nếu đồng ý với kế hoạch nâng cấp toàn diện, hãy gõ `/goal thực thi PLAN_DASHBOARD.md` nhé!**
