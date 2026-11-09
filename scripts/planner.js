// scripts/planner.js
const fs = require("fs");
const path = require("path");

// 1. Tự động đọc API Key từ file .env.local nếu có, tránh hardcode
function getApiKey() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/ROUTER_API_KEY=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return "DÁN_KEY_TỪ_9ROUTER_VÀO_ĐÂY";
}

const userTask = process.argv.slice(2).join(" ");

if (!userTask) {
  console.error("❌ Lỗi: Bạn chưa cung cấp mô tả task.");
  console.error(
    'Ví dụ chạy: node scripts/planner.js "Làm tính năng luyện nghe chép chính tả"',
  );
  process.exit(1);
}

const SYSTEM_PROMPT = `Bạn là Senior Software Architect & Lead Engineer cho dự án Web học tiếng Anh (Stack: Next.js App Router, Supabase, Cloudflare R2 / Turnstile, Tailwind CSS).
Mục tiêu dự án: Chuẩn bị go-live chịu tải từ 1.000 đến 10.000 người dùng đồng thời.

Nhiệm vụ: Phân tích yêu cầu và xuất ra ĐÚNG 1 bản Markdown Implementation Plan chi tiết để AI Worker (Antigravity Agent) tiến hành code.

Bản kế hoạch PHẢI có cấu trúc chuẩn sau:
# TASK EXECUTION PLAN: [Tên Task]

## 1. Cân nhắc kiến trúc & Hiệu năng (1k - 10k Users)
- **Supabase / Database:** Tối ưu query, thêm Index cho các cột hay filter, cấu hình RLS bảo mật tuyệt đối.
- **Assets / Audio:** Nếu liên quan đến file nghe (.mp3), chỉ dẫn nạp từ CDN Cloudflare R2, có cache headers.
- **Client Performance:** Tối ưu render, memoization, tránh re-render audio player.

## 2. Danh sách file cần chỉnh sửa hoặc tạo mới (Target Files)
- Liệt kê chính xác đường dẫn từng file.

## 3. Các bước triển khai chi tiết (Step-by-step Execution)
- Bước 1: ...
- Bước 2: ...
- Bước 3: ...

## 4. Tiêu chuẩn kiểm thử (Acceptance Criteria & Test)
- Hướng dẫn lệnh build / test kiểm tra xem tính năng đã đạt yêu cầu chưa.

LƯU Ý: Không giải thích thêm ngoài lề, chỉ xuất ra nội dung Markdown của bản thiết kế.`;

// Hàm trích xuất nội dung từ phản hồi (hỗ trợ cả JSON chuẩn lẫn stream SSE 'data: ...')
function extractPlanContent(rawText) {
  const trimmed = rawText.trim();

  // Trường hợp 1: Phản hồi JSON chuẩn
  if (trimmed.startsWith("{")) {
    const data = JSON.parse(trimmed);
    if (data.error) {
      throw new Error(`9Router trả về lỗi: ${JSON.stringify(data.error)}`);
    }
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
  }

  // Trường hợp 2: Phản hồi stream SSE (từng dòng bắt đầu bằng 'data:')
  const lines = trimmed.split("\n");
  let accumulatedContent = "";

  for (const line of lines) {
    const lineContent = line.trim();
    if (!lineContent || lineContent === "data: [DONE]") continue;

    if (lineContent.startsWith("data:")) {
      const jsonStr = lineContent.replace(/^data:\s*/, "");
      try {
        const parsed = JSON.parse(jsonStr);
        const delta =
          parsed.choices?.[0]?.delta?.content ||
          parsed.choices?.[0]?.message?.content ||
          "";
        accumulatedContent += delta;
      } catch {
        // Bỏ qua các dòng keep-alive hoặc dữ liệu phân mảnh không hợp lệ
      }
    }
  }

  if (accumulatedContent.trim()) {
    return accumulatedContent;
  }

  throw new Error(
    `Không thể trích xuất nội dung từ phản hồi của server:\n${rawText.slice(0, 300)}`,
  );
}

async function main() {
  const apiKey = getApiKey();

  try {
    const res = await fetch("http://localhost:20128/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Mtruong-plan",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userTask },
        ],
        temperature: 0.2,
        stream: false, // Khai báo rõ không dùng streaming
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      console.error("Chi tiết phản hồi từ 9Router:", errorText);
      process.exit(1);
    }

    // Đọc raw text trước thay vì res.json() trực tiếp để tránh crash khi server gửi dạng stream SSE
    const rawText = await res.text();
    const planContent = extractPlanContent(rawText);

    const dir = path.join(process.cwd(), "specs");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, "ACTIVE_TASK.md"), planContent, "utf8");
    console.log("PLAN_READY");
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

main();
