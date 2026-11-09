# Profile Page Sidebar Layout Fix Plan

## Vấn đề hiện tại (Broken Layout)

Cột sidebar bên trái ở trang Profile (`src/app/(dashboard)/profile/page.tsx`) đang gặp vấn đề về layout:

1. **Lỗi Sticky trên Desktop:**
   - Hiện tại, class `sticky top-24` được đặt ở thẻ `<nav>`. Tuy nhiên, thẻ cha của nó là `<aside>` lại nằm trong một CSS Grid có thuộc tính `lg:items-start`.
   - Thuộc tính `lg:items-start` làm cho `<aside>` co lại bằng đúng chiều cao của nội dung bên trong nó (tức là bằng `<nav>`).
   - Vì container (`<aside>`) không cao hơn phần tử con (`<nav>`), thuộc tính `sticky` hoàn toàn vô tác dụng và sidebar sẽ bị trôi đi khi cuộn trang thay vì ghim lại.

2. **Lỗi hiển thị trên Mobile (Vỡ giao diện/Khó dùng):**
   - Trên màn hình nhỏ (mobile), sidebar đang hiển thị dạng danh sách dọc (`flex-col`) đẩy nội dung chính (main content) xuống tuốt bên dưới, làm trải nghiệm cuộn trang rất mệt mỏi và không giống một menu điều hướng phụ.

## Phương án khắc phục (Fix Plan)

### Bước 1: Sửa lỗi Sticky trên Desktop

Có 2 cách để sửa lỗi này, ưu tiên Cách 1:

- **Cách 1:** Di chuyển class `sticky top-24` (hoặc thêm một chút margin `self-start sticky top-24`) từ thẻ `<nav>` ra ngoài thẻ `<aside>`. Khi đó `<aside>` sẽ trượt bên trong grid container.
- **Cách 2:** Xóa bỏ `lg:items-start` ở thẻ `<div className="mt-6 grid...">` bọc ngoài, để các cột tự động stretch (kéo dài) bằng nhau. Khi đó `<aside>` sẽ có chiều cao bằng với thẻ `<main>`, và thẻ `<nav>` bên trong có thể `sticky` bình thường.

### Bước 2: Tối ưu Sidebar cho Mobile (Responsive)

Thay đổi layout của `<nav>` trên thiết bị di động để không chiếm quá nhiều không gian dọc:

- Chuyển `flex-col` thành dạng trượt ngang (horizontal scrollable) trên mobile.
- Ví dụ class mới cho `<nav>`:
  `flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0`
- Đồng thời cập nhật các item (`<Link>`) bên trong để chúng hiển thị nowrap trên mobile:
  `whitespace-nowrap shrink-0`

## File cần sửa:

- `src/app/(dashboard)/profile/page.tsx`

## Triển khai:

Nếu bạn đồng ý với kế hoạch này, hãy cho mình biết để mình tiến hành sửa trực tiếp vào code nhé!
