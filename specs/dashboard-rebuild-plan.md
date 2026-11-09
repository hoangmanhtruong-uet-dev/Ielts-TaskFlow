# Kế Hoạch Tái Cấu Trúc & Xây Dựng Lại Dashboard (Command Center)

## 1. Tầm nhìn & Mục tiêu (Goal Description)

Dashboard hiện tại đang chủ yếu sử dụng dữ liệu giả lập (mock data) và được gộp chung trong một file `client.tsx` khá lớn (gần 700 dòng). Mục tiêu của kế hoạch này là "đập đi xây lại" kiến trúc của trang Dashboard để biến nó thành một **Trung tâm chỉ huy (Command Center)** thực thụ, chuẩn Production cho một ứng dụng học tiếng Anh/IELTS:

- **Modular hóa**: Chia nhỏ các UI components.
- **Data-driven**: Kết nối dữ liệu thật từ database (Supabase).
- **Gamification mạnh mẽ**: Tạo động lực học tập qua Streak, XP, League.
- **Cá nhân hóa**: Lộ trình và Daily Plan dựa trên mục tiêu của user.

---

## 2. Luồng & Logic Dữ Liệu (Logic & Data Flow)

Sử dụng mô hình Server Components kết hợp với Client Components để tối ưu SEO và Performance.

1. **Server Fetching (Page.tsx):**
   - Fetch dữ liệu song song (`Promise.all`) trực tiếp từ Supabase (bỏ qua API Route nếu không cần thiết để giảm latency).
   - Dữ liệu bao gồm: `UserProfile`, `LearningProgress`, `DailyGoals`, `GamificationStats` (XP, Streak), `LeaderboardRank`.
2. **Client Interaction (Client Components):**
   - Các hành động như: Bấm nghe Audio "Word of the Day", tương tác Quick Quiz, thay đổi Daily Goal sẽ gọi Server Actions hoặc Supabase RPC.
   - Sử dụng `React Query` hoặc `SWR` cho các widget cần realtime hoặc polling (như Leaderboard).
3. **Caching & Revalidation:**
   - Cấu hình Next.js cache cho các dữ liệu ít thay đổi (Word of the Day thay đổi mỗi ngày một lần ở mốc 00:00).

---

## 3. Bảo mật & Quản lý truy cập (Security)

1. **Xác thực (Authentication):** Require JWT token từ Supabase Auth. Trả về `redirect('/login')` nếu chưa đăng nhập.
2. **Phân quyền (Authorization) & RLS:**
   - Bật **Row Level Security (RLS)** trên tất cả các bảng (UserStats, Progress, DailyGoals). Đảm bảo query từ Client hay Server đều chỉ lấy được dữ liệu của chính `auth.uid()`.
3. **Data Mutation:** Mọi Server Actions đều phải check `requireCurrentAccount()` trước khi thực hiện ghi đè dữ liệu.

---

## 4. UI/UX, Bố cục & Component Architecture

Tách file `client.tsx` khổng lồ thành cấu trúc thư mục feature-based:

```text
src/app/(dashboard)/dashboard/
├── page.tsx                     # Server component (Data Fetching, Auth Check)
├── loading.tsx                  # Skeleton layout
├── components/
│   ├── dashboard-header.tsx     # Lời chào, XP, Streak chips
│   ├── welcome-onboarding.tsx   # Empty state cho user mới
│   ├── stats-overview.tsx       # 4 thẻ thống kê (Lessons, Streak, Time, Level)
│   ├── continue-learning.tsx    # Card bài học tiếp theo
│   ├── study-heatmap.tsx        # Lịch sử học tập GitHub style
│   ├── daily-goal-widget.tsx    # Mục tiêu ngày (Right sidebar)
│   ├── todays-plan-list.tsx     # Danh sách task hôm nay
│   ├── word-of-the-day.tsx      # Flashcard từ vựng
│   └── weekly-league.tsx        # Bảng xếp hạng thu nhỏ
```

### 4.1. Responsive Layout (Bố cục)

- **Desktop (>= lg):** Giữ nguyên tỷ lệ Grid 70/30 (7 columns cho Main Content, 3 columns cho Right Sidebar). Áp dụng `sticky top-24` cho cột phải nếu cần thiết để widget luôn hiển thị khi scroll.
- **Tablet (md):** Chia cột 50/50 hoặc hiển thị dạng thẻ lưới (Grid card).
- **Mobile (< sm):** Đưa toàn bộ về 1 cột (Stacking). Cột Main Content hiển thị trước, cột Sidebar (Daily Goal, Plan) đẩy xuống dưới. Cần ưu tiên hiển thị "Continue Learning" và "Today's Plan" lên đầu trên Mobile.

### 4.2. UI Design & Micro-interactions

- Giữ nguyên triết lý thiết kế: bo góc mềm mại (`rounded-3xl`, `rounded-2xl`), shadow mượt (`shadow-sm`, hover shadow), Glassmorphism nhẹ cho Header.
- Bổ sung hiệu ứng **Confetti** khi user hoàn thành Daily Goal.
- Thêm Hover states rõ ràng cho "Word of the Day" (lật thẻ hoặc trượt chữ).

---

## 5. Tính năng & Nội dung Chi tiết (Features Breakdown)

### 5.1. Khối nội dung chính (Left Column)

- **Header & Stats:** Hiển thị thời lượng học thật (tính tổng từ bảng study_sessions).
- **Continue Learning:** Logic tự động tìm bài học cuối cùng user đang dở dang. Trạng thái thanh progress bar phải lấy từ DB.
- **Features Overview:** Cần disable hoặc gắn tag "Pro" nếu tính năng yêu cầu trả phí (ví dụ: Dictation VIP).
- **Quick Practice & Heatmap:** Heatmap phải lấy history thật của 365 ngày qua. Quick Quiz lấy ngẫu nhiên 1 câu hỏi grammar mà user từng sai (Error review loop).

### 5.2. Khối điều hướng & Mục tiêu (Right Sidebar)

- **Daily Goals:** Thiết kế hệ thống tính điểm linh hoạt. Ví dụ mục tiêu: 3 bài học + 1 bài nghe.
- **Today's Plan:** Danh sách TODO thông minh, tự động gạch bỏ (strike-through) khi user hoàn thành module trong ngày.
- **Word of the Day:** Logic Server tính toán "Từ của ngày" đồng bộ cho tất cả user (dựa trên seed là ngày tháng) hoặc cá nhân hóa dựa trên band điểm mục tiêu của user (A2 vs IELTS 7.0 sẽ có từ khác nhau).
- **Weekly League:** Kết nối realtime với bảng xếp hạng. Chỉ hiển thị +/- 1 rank so với user hiện tại để kích thích sự cạnh tranh.

---

## 6. Lộ trình triển khai (Proposed Changes)

1. **Giai đoạn 1: Database & API (Backend-first)**
   - Khởi tạo schemas trên Supabase cho `UserStats`, `StudySessions`, `DailyGoals`.
   - Viết các hàm helper fetch data trong thư mục `server/`.
2. **Giai đoạn 2: Refactor UI Components (Component-first)**
   - Tạo thư mục `dashboard/components`.
   - Cắt từng phần trong `client.tsx` ra các file riêng biệt. Vẫn truyền mock data qua props để đảm bảo UI không vỡ.
3. **Giai đoạn 3: Data Integration (Kết nối)**
   - Thay thế mock data bằng Server fetching trong `page.tsx`.
   - Truyền dữ liệu thật xuống các Client components. Xử lý các edge cases (loading, empty, error).
4. **Giai đoạn 4: Polish & Animation (Hoàn thiện)**
   - Tối ưu loading với `Suspense` và Skeleton.
   - Thêm hiệu ứng âm thanh/hoạt ảnh khi bấm nút.

---

## 7. Quality Assurance & Edge Cases (Kế hoạch Test & Xử lý ngoại lệ)

> [!CAUTION]
> Để tránh các lỗi ẩn trên Production, cần đặc biệt lưu ý và implement các Test Cases sau trong quá trình code:

### 7.1. Xử lý Múi giờ (Timezone)

- **Vấn đề:** Các chỉ số như Streak, Daily Goal, Heatmap phụ thuộc vào ngày hiện tại. Múi giờ của Server (thường là UTC) có thể khác với múi giờ của thiết bị User.
- **Giải pháp:** Cần lưu timestamp theo dạng UTC trong Supabase. Khi hiển thị hoặc tính toán logic ngày mới (reset daily goals), phải dùng múi giờ của Client (`Intl.DateTimeFormat().resolvedOptions().timeZone`) để tính. Viết Test case thử thay đổi múi giờ để kiểm chứng Streak không bị sập.

### 7.2. Edge Cases (Biên dữ liệu & UI)

- **Tràn Text (Text Overflow):** Tên user hoặc tên bài học quá dài phải được xử lý bằng `truncate` hoặc `line-clamp` để không làm vỡ Grid/Flex.
- **Extreme Data:** User có Streak 9,999 ngày, hoặc XP > 1,000,000 thì badge chứa số trên header vẫn phải hiển thị gọn gàng (có thể format thành `1M` hoặc `1.2M`).
- **Lỗi Mạng (Network Issues):** Triển khai file `error.tsx` riêng cho khu vực Dashboard làm Error Boundary, hiển thị UI thân thiện kèm nút "Thử lại" thay vì để vỡ trang khi gọi Supabase bị timeout.

### 7.3. Testing Strategy

- **Unit Tests:** Viết các Unit tests (dùng Vitest/Jest) tập trung vào logic lõi: hàm tính điểm XP, hàm tính chuỗi Streak liên tiếp, hàm format ngày giờ.
- **E2E Tests:** Sử dụng Playwright để mô phỏng một end-to-end user flow: `Đăng nhập -> Vào Dashboard -> Xem hiển thị mặc định -> Click vào "Continue Learning"`.
- **Security Tests:** Kiểm thử trực tiếp bằng code để chứng minh Row Level Security (RLS) hoạt động: API gọi bằng Token của User A không thể read/write data của User B.

---

## Ý kiến phản hồi (User Review Required)

> [!IMPORTANT]
> **Về Word of The Day:** Bạn muốn từ vựng này giống nhau cho tất cả mọi người, hay cá nhân hóa dựa trên trình độ bài test đầu vào của user?
> **Về Heatmap:** Bạn có muốn tích hợp Github-style Heatmap thành một component thư viện riêng (như `react-activity-calendar`) hay tiếp tục dùng bản custom tự build?

_Vui lòng duyệt qua bản kế hoạch đã được bổ sung này. Nếu mọi thứ đã rõ ràng và đúng định hướng của bạn, chúng ta sẽ bắt đầu chuyển sang bước thực thi (Giai đoạn 1 & 2)._
