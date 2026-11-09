# Production remediation TODO

| Status                            | Item                                                                           | Exit evidence                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| PASS                              | Repository structured logging, redaction and request correlation               | Unit tests plus local JSON event lookup                                                  |
| PASS                              | Auth/PostgREST/Storage readiness implementation                                | Readiness regression tests                                                               |
| PASS                              | Password recovery code flow                                                    | Schema/action/component/build tests                                                      |
| BLOCKED_BY_EXTERNAL_CONFIGURATION | Password recovery production delivery                                          | Supabase Auth redirect + SMTP inbox evidence on real domain                              |
| PASS                              | Practice dirty/pending/retry remediation                                       | Component/action tests                                                                   |
| PASS                              | Authenticated E2E required-mode preflight                                      | Required command fails with exact missing variable names                                 |
| BLOCKED_BY_EXTERNAL_CONFIGURATION | Full authenticated E2E                                                         | Dedicated users A/B, expected production project ref and zero unintended skips           |
| NOT_VERIFIED                      | CSP nonce/hash hardening                                                       | Reviewed nonce implementation and browser matrix; current CSP still uses `unsafe-inline` |
| BLOCKED_BY_EXTERNAL_CONFIGURATION | HSTS preload                                                                   | Real domain and every relevant subdomain verified HTTPS before enabling                  |
| BLOCKED_BY_EXTERNAL_CONFIGURATION | Vercel/Supabase/SMTP/DNS/scheduler/monitoring/backup/restore/rollback evidence | Dashboard screenshots, run IDs and final go/no-go review                                 |

# Production Remediation TODO (Target: 1k - 10k Active Users)

| Status          | Item                                                             | Agent Skill Mapping                                    | Exit Evidence                                                                                                    |
| :-------------- | :--------------------------------------------------------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **PASS**        | Repository structured logging, redaction and request correlation | `systematic-debugging`                                 | Unit tests plus local JSON event lookup PASS.                                                                    |
| **PASS**        | Auth/PostgREST/Storage readiness implementation                  | `supabase-postgres-best-practices`                     | Readiness regression tests PASS.                                                                                 |
| **PASS**        | Password recovery code flow                                      | `supabase-postgres-best-practices`                     | Schema/action/component/build tests PASS.                                                                        |
| **BLOCKED_EXT** | Password recovery production delivery                            | `systematic-debugging`                                 | Supabase Auth redirect + SMTP inbox evidence on real domain.                                                     |
| **PASS**        | Practice dirty/pending/retry pipeline                            | `vercel-react-best-practices`                          | Component testing + state persistence PASS.                                                                      |
| **TODO**        | Fix UI transition conflicting property warning                   | `vercel-react-best-practices`, `design-taste-frontend` | Browser console sạch hoàn toàn, không còn warning shorthand `transition` / `transitionDelay`.                    |
| **TODO**        | Fix 176 Problems (TypeScript & ESLint Diagnostics)               | `verification-before-completion`                       | Tab Problems = 0, lệnh `npm run lint` và `npm run build` pass clean.                                             |
| **TODO**        | Fix floating audio player overlap with viewport                  | `design-taste-frontend`, `web-design-guidelines`       | Container trang nghe có đủ padding đáy, audio player không che navigation và action buttons.                     |
| **TODO**        | Sync metadata giữa Lesson Card & Floating Player                 | `vercel-react-best-practices`                          | Khớp chính xác thời lượng audio (10m 30s vs 02:45) và track name tương ứng.                                      |
| **TODO**        | Supabase Connection Pooler & Query Indexing                      | `supabase-postgres-best-practices`                     | Chuyển kết nối sang Supavisor Transaction Pooler (cổng 6543); Index đầy đủ `user_id`, `lesson_id`, `created_at`. |
| **TODO**        | Cloudflare R2 Audio Streaming CDN Caching                        | `web-design-guidelines`                                | File MP3 phục vụ từ R2 Custom Domain kèm header `Cache-Control: public, max-age=31536000, immutable`.            |
| **TODO**        | E2E Testing luồng làm bài nghe và submit kết quả                 | `webapp-testing`                                       | Bộ test Playwright/Cypress pass luồng: Load audio -> Trả lời -> Submit -> Update Streak DB.                      |
| **TODO**        | Pre-launch Verification Gate                                     | `verification-before-completion`                       | Đạt đầy đủ test checklist, không còn pending spec trước khi merge vào branch main.                               |

---

### Phân công trách nhiệm Agent Skills

- **`design-taste-frontend` & `web-design-guidelines`:** Xử lý toàn bộ padding, floating bar, visual waveform, bố cục responsive và đồng bộ UI/UX trang luyện nghe.
- **`supabase-postgres-best-practices`:** Quản lý schema Supabase, kích hoạt RLS toàn bộ bảng người dùng, tối ưu indexing và thiết lập transaction pooler[cite: 6].
- **`vercel-react-best-practices`:** Khử triệt để warning style/transition trên terminal dev server, tối ưu re-render và client state cho player[cite: 6].
- **`systematic-debugging`:** Dọn sạch 176 lỗi diagnostics đang báo trong VS Code/Antigravity[cite: 6].
- **`webapp-testing` & `verification-before-completion`:** Viết test tự động và làm chốt chặn cuối cùng trước khi đóng từng task[cite: 6].
