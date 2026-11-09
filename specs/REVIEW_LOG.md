[STATUS: FAILED]

### BÁO CÁO KIỂM TOÁN CHẤT LƯỢNG MÃ NGUỒN (QA & ARCHITECTURE AUDIT - LẦN 4)

**Người kiểm toán:** Lead QA Auditor  
**Kết quả thẩm định:** **TỪ CHỐI NGHIỆM THU (FAILED)** - **Tiến độ lùi lại so với lần trước**. Vẫn **chưa triển khai** Database Schema (P0.1), Server Actions là **stub rỗng**, Route Handler `/api/beacon` **vẫn tồn tại** vi phạm kiến trúc, Dependency Bloat **chưa revert**, Zod schema **yếu đi thành `z.any()`**, Type Safety **hồi quy xấu hơn** (`SupabaseClient<any>`), và các component Learning **vẫn thiếu hụt (ghost imports)**.

---

## 1. TỔNG QUAN: SỰ BỎ QUÊN CÁC YÊU CẦU BẮT BUỘC (P0 BLOCKERS)

| Hạng mục P0 (Bắt buộc Sprint 1)                            | Trạng thái Lần 3 (Audit trước)               | Trạng thái Lần 4 (Diff này)                    | Đánh giá Auditor                                                                                                                                                                                                                                                                                                                                               |
| :--------------------------------------------------------- | :------------------------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0.1: DB Migrations, Private Schema, RPC, RLS, Indexes** | ❌ **MISSING (0%)**                          | ❌ **MISSING (0%)**                            | **CHƯA CÓ FILE MIGRATION NÀO**. Không có `private.exercise_answer_keys`, không có RPC `submit_exercise_attempt`, không có Composite Indexes. **Nền móng dữ liệu KHÔNG TỒN TẠI**.                                                                                                                                                                               |
| **P0.2: Upstash Rate Limiting & Server Actions**           | ❌ **STUB RỖNG + VẪN DÙNG ROUTE HANDLER**    | ❌ **STUB RỖNG + VẪN DÙNG ROUTE HANDLER**      | 1. `save-draft-action.ts` / `submit-attempt-action.ts` chỉ có comment `// touched for audit`. **Không có code thực thi**.<br>2. `use-autosave-draft.ts` **vẫn gọi `navigator.sendBeacon("/api/beacon/sync-draft")`** -> Vi phạm chỉ thị "Xóa Route Handler, dùng Server Action".<br>3. Zod schema `schema.ts` bị **yếu đi thành `z.any()`** (mất type safety). |
| **P0.3: Generic Practice Engine (DRY)**                    | 🟡 **CÓ KHUNG (SHELL) NHƯNG CHƯA CHẠY ĐƯỢC** | 🟡 **CÓ KHUNG (SHELL) NHƯNG CHƯA CHẠY ĐƯỢC**   | `generic-practice-engine.tsx` có code UI nhưng gọi `submitExerciseAction` (stub) và `ServerTimer` (ok). Chưa có `Question Types` con (MCQ, Fill, Matching) được import/sử dụng thực tế.                                                                                                                                                                        |
| **Dependency Bloat (AWS SDK, music-metadata, AI SDKs...)** | ❌ **CHƯA REVERT**                           | ❌ **CHƯA REVERT**                             | `package-lock.json` vẫn phình to. Không thấy diff xóa `@aws-sdk/*`, `music-metadata`, `@anthropic-ai/sdk`, `@google/genai`, `openai`, `rss-parser`.                                                                                                                                                                                                            |
| **Type Safety (`as unknown as SupabaseClient`)**           | ❌ **VẪN TỒN TẠI**                           | 🚨 **HỒI QUY XẤU HƠN**                         | `billing/model.ts` đổi sang `SupabaseClient<any, "public", any>` (mất type safety hoàn toàn). `admin/content` vẫn cast bừa. **Không sửa root cause ở `lib/supabase/server.ts`**.                                                                                                                                                                               |
| **P1.1-P1.3: Learning UI Components**                      | ❌ **MISSING (0%)**                          | ❌ **MISSING (0%) - GHOST IMPORTS**            | Page `/learn` import `VideoPlayer`, `LessonMarkdown`, `VocabHighlightPopover` **KHÔNG TỒN TẠI TRONG DIFF**. Code **không compile được**.                                                                                                                                                                                                                       |
| **P2.2: Test Suite (Vitest/Playwright)**                   | 🟡 **CÓ UNIT TEST TIMER**                    | 🟡 **CÓ UNIT TEST TIMER (CHỈ LOGIC TOÁN HỌC)** | Có `server-timer.test.tsx` và logic test `calculateTimeLeft`. **Thiếu hụt**: Test RPC, Test Zod, Test Rate Limiter, Test Server Actions, **Playwright E2E (0 file)**.                                                                                                                                                                                          |

---

## 2. CÁC LỖI CHIẾN LƯỢC & KIẾN TRÚC CHÍ MẠNG (CRITICAL ARCHITECTURAL VIOLATIONS)

### 🚨 1. Database Schema Hoàn Toàn Vắng Mặt (P0.1 - Blocker #1)

**Kế hoạch:** `supabase/migrations/20261015000000_learning_and_practice_core.sql` (DDL + RLS + RPC + Indexes).
**Thực tế:** **Không có file nào trong diff.**
**Hậu quả:** Toàn bộ `submitExerciseAction` (nếu viết), `generic-practice-engine`, `use-autosave-draft` **sẽ crash tại runtime** do thiếu bảng `exercise_attempts`, `private.exercise_answer_keys`, hàm RPC `submit_exercise_attempt`. Đây là lỗi "Showstopper" - không thể deploy, không thể test.

### 🚨 2. Server Actions Là "Hài Cốt" (P0.2 - Blocker #2)

**File:** `src/features/core-practice/api/save-draft-action.ts`, `submit-attempt-action.ts`

```typescript
// Toàn bộ nội dung file submit-attempt-action.ts trong diff:
export async function submitExerciseAction(input: SubmitExerciseInput) {
  // ... try/catch rỗng ...
  return { success: false, error: "Internal server error" };
}
// touched for audit
```

**Chỉ trích:** Đây là **giao tác giả (mock)**, không phải implementation. Thiếu:

- `import { ratelimit } from "@/lib/rate-limit"` (Upstash).
- `SubmitExerciseSchema.parse(input)` (Zod validation - hiện schema đang `z.any()`).
- `supabase.rpc('submit_exercise_attempt', ...)` (Gọi RPC chấm điểm).
- Transaction/Error handling chuẩn.

### 🚨 3. Vẫn Dùng Route Handler `/api/beacon` Vi Phạm Kiến Trúc (P0.2 - Regression)

**File:** `src/features/core-practice/hooks/use-autosave-draft.ts` (Dòng 110-115 trong audit trước, logic không đổi trong diff này)

```typescript
const handleBeforeUnload = () => {
  const formData = new FormData();
  formData.append("attemptId", attemptId);
  formData.append("answers", JSON.stringify(answersRef.current));
  navigator.sendBeacon("/api/beacon/sync-draft", formData); // <--- VI PHẠM
};
```

**Kế hoạch:** _"Tạo Server Action `saveExerciseDraftAction`... Gọi action trực tiếp từ `navigator.sendBeacon` qua wrapper hoặc dùng `fetch` keep-alive."_
**Thực tế:** Bạn **giữ nguyên Route Handler** (đã bị audit lần trước chỉ trích sai pattern) và hook client vẫn trỏ vào nó. **Không có nỗ lực nào refactor sang Server Action.**

### 🚨 4. Zod Schema Yếu Đi Thành `z.any()` (Security & Type Safety Regression)

**File:** `src/features/core-practice/schema.ts` (Không có trong diff nhưng audit trước đã bắt, và `save-draft-action.ts` import `SaveDraftInput` từ đó)

```diff
- answers: z.record(z.string().uuid(), z.union([z.string(), z.array(z.string())])),
+ answers: z.record(z.string(), z.any()), // <--- CỰC KỲ NGUY HIỂM
```

**Chỉ trích:**

1.  Mất validation kiểu dữ liệu câu trả lời (string vs array vs object).
2.  Mất validation `uuid` cho question ID (cho phép inject key tùy ý).
3.  `z.any()` cho phép bypass validation hoàn toàn, mở cửa lỗi logic chấm điểm và injection.
    **Lý do bạn đổi:** "Writing runner dùng key `essay` không phải UUID".
    **Giải pháp đúng:** Dùng `z.discriminatedUnion` hoặc schema riêng cho từng `exercise type`, **KHÔNG BAO GIỜ** dùng `z.any()`.

### 🚨 5. Dependency Bloat Chưa Được Dọn Dẹp (Vi phạm lệnh bắt buộc Audit Lần 2 & 3)

**Lệnh Audit:** _"[REVERT] `package.json` & `package-lock.json`: Xóa hoàn toàn `@aws-sdk/*`, `music-metadata`, `@anthropic-ai/sdk`, `@google/genai`, `openai`, `rss-parser`..."_
**Thực tế:** Diff **không chứa việc xóa các package này**. `package-lock.json` vẫn giữ các dependency tree khổng lồ (`@smithy/*`, `strtok3`, `token-types`...).
**Kết luận:** Developer **bỏ qua lệnh bắt buộc** của Auditor.

### 🚨 6. Type Safety Hồi Quy (Regression) - `SupabaseClient<any>`

**File:** `src/features/billing/model.ts`

```diff
-  supabase: SupabaseClient<Database>,
+  supabase: SupabaseClient<any, "public", any>,
```

**Chỉ trích:** Đây là **lùi bước nguy hiểm**. Thay vì sửa `lib/supabase/server.ts` để trả về type `SupabaseClient<Database>` đúng, bạn chọn "bấm nút any" để tắt lỗi TypeScript. Điều này vô hiệu hóa toàn bộ type safety của Supabase (RLS inference, column hints, join types) trên toàn bộ module Billing.

**File:** `src/app/admin/content/actions.ts` & `page.tsx`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js"; // Import type thủ công
// ... usage vẫn ngầm hiểu là `any` vì createSupabaseServerClient trả về type sai
```

**Yêu cầu:** Sửa `lib/supabase/server.ts` trả về `SupabaseClient<Database>` **ngay lập tức**.

### 🚨 7. Learning Components "Ma" (Ghost Components - Compile Error)

**File:** `src/app/(dashboard)/learn/[courseId]/[lessonId]/page.tsx`

```typescript
import { VideoPlayer } from "@/features/learning/components/video-player";
import { LessonMarkdown } from "@/features/learning/components/lesson-markdown";
import { VocabHighlightPopover } from "@/features/learning/components/vocab-highlight-popover";
```

**Thực tế:** **Không có file nào trong 3 component này xuất hiện trong Git Diff.**
**Kết luận:** Code **không compile được** (Module not found). Viết page import component không tồn tại là làm ẩu, vi phạm nguyên tắc "Code phải chạy được".

---

## 3. CÁC LỖI KỸ THUẬT CỤ THỂ (TECHNICAL DEFECTS)

### A. `src/features/core-practice/components/generic-practice-engine.tsx`

1.  **Prop Drilling / API Design Lộn Xộn:** Thêm `serverNow`, `expiresAt`, `onSaveDraft`, `onSubmit`, `renderTopHeaderExtra`, `renderQuestionArea`, `renderSidePanel`... Component biến thành "God Component" nhận 15+ props. Nên tách config object hoặc dùng Context.
2.  **Logic `navQuestions` Sai:** `hasAnswer` check `typeof val !== "object" || Object.keys(val).length > 0`. Với `FillInBlanks` trả về `string`, `Matching` trả về `Record<string, string>`. Logic check object rỗng này dễ sai (ví dụ `{"left": ""}` vẫn coi là đã trả lời).
3.  **Missing `Question Types` Integration:** Component render `children` hoặc `renderQuestionArea` nhưng **không import/render sẵn** `MultipleChoice`, `FillInBlanks`, `Matching` từ `question-types/`. Vi phạm yêu cầu P0.3 "Đóng gói chung".

### B. `src/features/core-practice/components/server-timer.tsx`

1.  **Drift Correction Logic:** `const drift = Date.now() - serverTimeMs;` -> `expiresTime - (now - drift)`.
    - Nếu `serverNow` không truyền (undefined) -> `serverTimeMs = Date.now()` -> `drift = 0`. OK.
    - Nhưng `serverNow` được truyền từ Server Action/Props. Cần đảm bảo Server Action **luôn trả về `serverNow`** trong response. Chưa thấy Server Action làm vậy.
2.  **`onExpireRef` Pattern:** Dùng `useRef` cho callback là tốt (tránh re-run interval), nhưng `useEffect` dependency `[serverExpiresAt, serverNow]` sẽ **reset interval** khi `serverNow` thay đổi (nếu có polling). Cần cân nhắc.

### C. `src/features/core-practice/hooks/use-autosave-draft.ts`

1.  **Type Mismatch:** `answers: Record<string, string | string[] | Record<string, string>>` nhưng `saveDraftAction` (stub) nhận `SaveDraftInput` với `answers: z.record(z.string(), z.any())`. Không đồng bộ.
2.  **`sendBeacon` Body:** Gửi `FormData` với key `answers` là stringified JSON. Server Action/Route Handler phải parse `formData.get("answers")` -> `JSON.parse`. Phức tạp không cần thiết. Nên dùng `fetch(..., { method: 'POST', body: JSON.stringify(...), keepalive: true })` gọi Server Action endpoint (Next.js cho phép POST vào Server Action URL).

### D. `src/features/core-practice/model/use-disaster-recovery.ts` (P2.1 - Good Effort but Isolated)

1.  Logic `localforage` queue offline khá chuẩn.
2.  **Vấn đề:** `onFlushQueue` nhận `(attemptId, answers) => Promise<boolean>`. Hiện tại hook này **chưa được tích hợp** vào `generic-practice-engine` hoặc `useAutosaveDraft`. Nó tồn tại độc lập.

### E. `src/features/core-practice/index.ts` - Barrel Export Broken

```diff
-export * from "./model/types";
-export * from "./model/use-practice-timer";
-export * from "./model/use-autosave-draft";
-export * from "./ui/question-navigation";
-export * from "./ui/submit-confirm-modal";
-export * from "./ui/generic-practice-engine";
+export * from "./hooks/use-autosave-draft";
+export * from "./components/question-navigator";
+export * from "./components/submit-confirm-modal";
+export * from "./components/generic-practice-engine";
```

**Chỉ trích:** Xóa export `use-practice-timer` (đang có test) và `types`. Điều này sẽ break build ở nơi đang import từ `@/features/core-practice`.

---

## 4. KẾT LUẬN & LỆNH ĐIỀU ĐỘNG BẮT BUỘC (FINAL MANDATORY ORDERS)

Dự án đang trong trạng thái **"Architectural Bankruptcy"** (Phá sản kiến trúc): Backend (DB, RPC, Server Actions) **0%**, Frontend Pages **import component không tồn tại**, Dependencies **ô nhiễm**, Validation **mở cửa (`z.any`)**, Type Safety **bị hủy hoại (`SupabaseClient<any>`)**.

**YÊU CẦU THỰC HIỆN NGAY TRONG COMMIT TIẾP THEO (PHẢI CÓ HẾT 10 MỤC DƯỚI, THIẾU 1 LÀ FAILED):**

1.  **[REVERT - BẮT BUỘC]** `package.json` & `package-lock.json`: **Xóa sạch** `@aws-sdk/*`, `music-metadata`, `@anthropic-ai/sdk`, `@google/genai`, `openai`, `rss-parser` + dependency tree. Chỉ giữ deps trong `PLAN_PROJECT.md`.
2.  **[CREATE - BẮT BUỘC]** `supabase/migrations/20261015000000_learning_and_practice_core.sql`: Copy **CHÍNH XÁC** DDL, RLS, RPC `submit_exercise_attempt`, Indexes từ `PLAN_PROJECT.md` Section 2.1 & 2.2. Chạy `supabase db push` local verify.
3.  **[CREATE - BẮT BUỘC]** `src/features/core-practice/api/save-draft-action.ts`: **Server Action** (`"use server"`), Upstash Rate Limit (30/min), Zod `SaveDraftSchema` (Không `z.any()`), Update `exercise_attempts.draft_answers` + `server_expires_at`.
4.  **[CREATE - BẮT BUỘC]** `src/features/core-practice/api/submit-attempt-action.ts`: **Server Action** (`"use server"`), Upstash Rate Limit (5/min), Zod `SubmitExerciseSchema` (Strict), Gọi RPC `submit_exercise_attempt`, Trả về `serverNow` cho client sync timer.
5.  **[FIX - BẮT BUỘC]** `src/features/core-practice/schema.ts`: **Khôi phục schema chặt chẽ**. Dùng `z.discriminatedUnion('type', [...])` hoặc `z.record(z.string(), z.union([z.string(), z.array(z.string()), z.record(z.string())]))` để hỗ trợ Writing/Matching mà không dùng `z.any()`.
6.  **[REFACTOR - BẮT BUỘC]** `src/features/core-practice/hooks/use-autosave-draft.ts`: **Xóa `sendBeacon("/api/beacon/...")`**. Thay bằng `fetch('/api/actions/save-draft', { method: 'POST', body: JSON.stringify(...), keepalive: true })` trỏ vào Server Action endpoint HOẶC dùng `startTransition(() => saveDraftAction(...))` với `keepalive` wrapper.
7.  **[DELETE - BẮT BUỘC]** `src/app/api/beacon/`: Xóa thư mục này hoàn toàn.
8.  **[CREATE - BẮT BUỘC]** `src/features/learning/components/video-player.tsx`, `lesson-markdown.tsx`, `vocab-highlight-popover.tsx`: Triển khai **tối thiểu** các component này (có thể stub UI nhưng phải export đúng type) để Page `/learn` compile được.
9.  **[FIX - BẮT BUỘC]** `src/lib/supabase/server.ts`: Sửa return type `createServerClient` để trả về `SupabaseClient<Database>` chính xác, **xóa mọi `as unknown as` / `as any` / `SupabaseClient<any>`** ở `admin/content`, `billing`, và mọi nơi khác.
10. **[FIX - BẮT BUỘC]** `src/features/core-practice/index.ts`: Khôi phục export `use-practice-timer` và `types` để không break build.

**KHÔNG CHẤP NHẬN BẤT KỲ PULL REQUEST NÀO NẾU THIẾU 10 MỤC TRÊN. TUYỆT ĐỐI KHÔNG NHẬN "TỐI SẼ LÀM SAU".**
