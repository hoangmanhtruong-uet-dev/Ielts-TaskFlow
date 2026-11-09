# PLAN GO-LIVE — IELTS Flow

Cập nhật: 2026-10-23 · Phạm vi: từ trạng thái hiện tại (Phase 1–13 code xong, content mỏng) → public launch.

## 0. Chẩn đoán hiện trạng

| Hạng mục                                                        | Trạng thái                                                                                               |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Engine (14 features, RLS, migrations, tests, runbooks)          | ✅ Gần như hoàn chỉnh                                                                                    |
| Content (lí thuyết + bài tập)                                   | ❌ Rất mỏng — seed migration chỉ vài lesson/pass/task mỗi loại                                           |
| Dev Supabase project (`copgpiplkccnqgupdwcr`)                   | ❌ Đã chết — DNS NXDOMAIN, login fail `AUTH_PROVIDER_ERROR`                                              |
| Production checklist (`docs/PRODUCTION_READINESS_CHECKLIST.md`) | ❌ NO-GO — toàn bộ gate là `BLOCKED_BY_EXTERNAL_CONFIGURATION` (Vercel, domain, SMTP, backup, scheduler) |
| Billing (Phase 11), AI writing/speaking                         | ⚠️ Code có sẵn nhưng chưa bật — quyết định: **defer, launch miễn phí trước**                             |

**Kết luận chiến lược:** phần kỹ thuật không còn là瓶颈. Nút thắt duy nhất là **content** và **cấu hình cloud**. Là project cá nhân thiếu chuyên môn IELTS, không tự viết tay toàn bộ nội dung — chuyển sang vai **editor vận hành pipeline**, dựa vào 3 trụ:

1. **AI-assisted authoring** (đã có sẵn hạ tầng: migration `20261006000000_ai_content_generation.sql` với workflow `PENDING_REVIEW → APPROVED/REJECTED`, và Phase 12 CMS taxonomy). LLM draft → script validate → người review → publish qua versioning.
2. **Nguồn hợp pháp, miễn phí**: không sao chép đề Cambridge (bản quyền). Dùng format IELTS (không bản quyền) + nội dung tự tạo/AI tạo dựa trên:
   - CEFR descriptors (Council of Europe — tải miễn phí, dùng làm chuẩn difficulty)
   - Academic Word List, Cambridge English Vocabulary Profile (public PDF)
   - Reading: nguồn public domain (Project Gutenberg, gov.uk, NASA, Wikipedia đơn giản) được viết lại
   - Listening: text tự sinh + TTS (đã có pipeline audio cho Speaking)
3. **Review thuê/cộng đồng + item statistics**: mời 1–2 gia sư IELTS review theo batch (trả bằng premium + tiền symbol, đăng trên group Facebook IELTS/Vietnamese tutor communities). Sau beta, dùng `learner_attempts` tính độ khó/discrimination từng câu → dữ liệu thay cho chuyên môn.

**Scope content MVP (chống tham lam — theo KI-010/011):** chỉ **Academic**, band mục tiêu **5.0–6.5**, đúng 1 roadmap:

| Loại                                   | Số lượng tối thiểu                         |
| -------------------------------------- | ------------------------------------------ |
| Module lí thuyết (Grammar + Vocab)     | 4 module × 5 lesson = 20 lesson            |
| Exercise questions                     | ~120 câu (multiple-choice, fill, matching) |
| Reading passages (có question set)     | 4                                          |
| Listening sets (audio TTS + questions) | 4                                          |
| Writing tasks (Task 1 + 2, rubric tay) | 6                                          |
| Speaking parts (cue cards)             | 8                                          |
| Mock test hoàn chỉnh                   | 1                                          |
| Placement test                         | đã có seed — rà lại                        |

Tổng ~160 items chất lượng đã review > 1000 items chưa kiểm chứng.

---

## G0 — Hồi sinh môi trường dev (0.5 ngày)

1. Tạo Supabase project mới (free tier) — đây cũng là bước khởi đầu của SB-01.
2. Cập nhật `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DATABASE_URL` trỏ ref mới.
3. `supabase db push` toàn bộ migrations + seed content hiện có.
4. Smoke: register → login → placement → 1 lesson → 1 exercise.
5. **Exit criteria:** `npm run dev` login 200, không còn `ENOTFOUND`.

## G1 — Content pipeline + nội dung MVP (2–4 tuần, part-time)

1. **Tác giả hoá quy trình draft** (1 ngày): script `scripts/content/` nhận JSON theo schema (`src/features/learning/schemas.ts` + Phase 12 taxonomy) → validate (answer key khớp, position liên tục, difficulty tag, provenance/licence bắt buộc theo `docs/CONTENT_OPERATIONS.md`) → sinh seed migration draft.
2. **Sửa RLS placeholder** của `ai_generated_contents` (hiện policy là placeholder risk P0 — siết bằng admin role table thật, migration forward-only).
3. **Sprint soạn nội dung** theo bảng scope ở trên, mỗi tuần 1 batch: AI draft → validate script → self-review chéo với checklist publish trong `CONTENT_OPERATIONS.md` → migration `published`.
4. **Tuyển 1–2 reviewer tình nguyện/trả phí** duyệt grammar correctness + naturalness của batch vocab/grammar/writing rubric.
5. Audio listening: generate bằng TTS (edge-tts/11labs free tier), upload qua Storage, gắn checksum theo checklist.
6. **Exit criteria:** learner mới vào app đi hết 1 đường: placement → học 1 module → làm reading + listening → viết 1 task → nói 1 set → làm 1 mock test, không gặp screen trống.

## G2 — Quyết định phạm vi launch (1 ngày)

- **BẬT cho go-live:** auth email + password reset, placement, learning modules, practice (R/L/W/S không AI), dictation, error notebook, gamification (Phase 13), mock test, vocabulary vault.
- **TẮT/DEFER:** billing (Phase 11) — launch free, giữ code sau; AI writing/speaking feedback (đã tắt theo ENV-04/05 — giữ nguyên); IELTS General (KI-014 giữ ACCEPTED).
- Ghi quyết định vào `docs/PRD.md` scope section.

## G3 — Hạ tầng production (2–3 ngày, theo checklist có sẵn)

Chạy đúng các ID trong `docs/PRODUCTION_READINESS_CHECKLIST.md`, tạo project Supabase **dành riêng cho production** (ref mới thứ 2, tách khỏi dev ở G0):

| Gate             | Việc cần làm                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------- |
| RA-01/03         | Commit sạch → release PR → CI green trên exact SHA                                            |
| RA-04/ENV-01     | Vercel project + env vars + `NEXT_PUBLIC_SITE_URL` + domain + DNS/TLS                         |
| RA-05/SB-02/SMTP | Support mailbox thật + Supabase Auth SMTP + test confirm/reset mail (KI-088)                  |
| SB-03            | Bật leaked-password protection, rate limit, CAPTCHA signup                                    |
| SB-04/05/06/07   | Push migrations lên prod project, remote lint + owner verifier rollback-only, bucket policies |
| RET-01/02        | Scheduler gọi cleanup route hằng ngày + alert non-2xx                                         |
| KI-085           | Bật backup/PITR trên Supabase prod                                                            |
| RET-05           | Chạy DSR tabletop (export + delete) trên user test                                            |
| KI-089           | Config E2E accounts A/B, chạy authenticated suite 0 skip                                      |

## G4 — Private beta (1–2 tuần)

- Invite-only 20–50 người (bạn bè, group Facebook IELTS tự học, r/IELTS Vietnam).
- Đo: completion rate theo lesson, D7 retention, số report lỗi nội dung, item statistics từ `learner_attempts`.
- Vòng lặp: fix P0/P1 content + UX mỗi tuần bằng migration forward-only.
- **Entry gate công khai:** không còn P0/P1 open; ≥60% beta user hoàn thành ≥1 bài tập có feedback; mọi published item có provenance.

## G5 — Go-live công khai (1 ngày)

1. Bật signup public (tắt invite/CAPTCHA nới nếu cần), xác nhận quota Supabase free tier đủ (500MB DB, 5GB bandwidth — content text nhẹ, audio là rủi ro lớn nhất → cân nhắc nâng pro khi >200 DAU).
2. Smoke production: register → placement → lesson → mock test → DSR request.
3. Công bố: VnExpress Tech? không cần — bắt đầu bằng Facebook IELTS groups, Reddit r/IELTS, Product Hunt, 3–5 video TikTok demo.
4. Ghi tag release + freeze baseline, giữ `ROLLBACK_RUNBOOK.md` sẵn.

## Lịch ước lượng (part-time ~10–15h/tuần)

| Giai đoạn     | Thời gian         |
| ------------- | ----------------- |
| G0            | Tuần 0 (nửa ngày) |
| G1 content    | Tuần 1–4          |
| G2 + G3 infra | Tuần 5            |
| G4 beta       | Tuần 6–7          |
| G5 launch     | Tuần 8            |

## Rủi ro chính

| Rủi ro                     | Giảm thiểu                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Bản quyền đề Cambridge     | Chỉ dùng format + nội dung tự sinh, metadata licence bắt buộc, script validate chặn publish thiếu provenance             |
| AI sinh câu sai answer key | Bắt buộc 2 lớp: script kiểm tra cấu trúc + người spot-check ≥20% mỗi batch; item stats sau beta phát hiện câu bất thường |
| Thiếu chuyên môn sư phạm   | Neo vào CEFR descriptors làm thang độ khó; reviewer thuê duyệt rubric Writing/Speaking                                   |
| Scope phình (KI-010)       | Bảng scope cứng ở mục 0; mọi thứ ngoài bảng → backlog sau launch                                                         |
| Dev project chết lần nữa   | Document ref + backup PITR ngay từ G0; seed content nằm trong migration, không phụ thuộc data tay                        |
