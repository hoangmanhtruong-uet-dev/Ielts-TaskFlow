import process from "node:process";
import fs from "fs";
import { execSync } from "child_process";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// 1. Tự động nạp file .env.local
try {
  process.loadEnvFile(".env.local");
} catch (e) {
  console.warn(
    "⚠️ Không đọc được .env.local, đang dùng biến môi trường hệ thống.",
  );
}

// Bắt buộc lấy API_KEY từ file .env.local để tránh bị ghi đè bởi biến môi trường hệ thống
try {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  const openaiMatch = envContent.match(/^OPENAI_API_KEY=(.*)$/m);
  if (openaiMatch) {
    process.env.OPENAI_API_KEY = openaiMatch[1].trim();
  }
  const geminiKeys = [];
  for (const match of envContent.matchAll(/^GEMINI_API_KEY.*=(.*)$/gm)) {
    if (match[1].trim() && !match[1].startsWith("#"))
      geminiKeys.push(match[1].trim());
  }
  if (geminiKeys.length > 0) {
    process.env.GEMINI_API_KEYS = JSON.stringify(geminiKeys);
    process.env.GEMINI_API_KEY = geminiKeys[0];
  }
  const routerKeys = [];
  for (const match of envContent.matchAll(/^ROUTER_API_KEY.*=(.*)$/gm)) {
    if (
      match[1].trim() &&
      !match[1].includes("dummy") &&
      !match[1].startsWith("#")
    ) {
      routerKeys.push(match[1].trim());
    }
  }
  if (routerKeys.length > 0) {
    process.env.ROUTER_API_KEYS = JSON.stringify(routerKeys);
  }
} catch (e) {
  // Bỏ qua nếu có lỗi
}

// Xóa sạch biến proxy tồn đọng để kết nối trực tiếp
delete process.env.OPENAI_BASE_URL;
delete process.env.OPENAI_API_BASE;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.ALL_PROXY;
delete process.env.all_proxy;

const openaiKey = process.env.OPENAI_API_KEY;
const geminiKeysRaw = process.env.GEMINI_API_KEYS;
const geminiKeys = geminiKeysRaw
  ? JSON.parse(geminiKeysRaw)
  : process.env.GEMINI_API_KEY
    ? [process.env.GEMINI_API_KEY]
    : [];

if ((!openaiKey || openaiKey.includes("sk-...")) && geminiKeys.length === 0) {
  console.error(
    "❌ LỖI: Bạn chưa điền OPENAI_API_KEY hoặc GEMINI_API_KEY vào file .env.local!",
  );
  process.exit(1);
}

const openai =
  openaiKey && !openaiKey.includes("sk-...")
    ? new OpenAI({
        apiKey: openaiKey,
        baseURL: "https://api.openai.com/v1",
      })
    : null;

const routerKeysRaw = process.env.ROUTER_API_KEYS;
const routerKeysParsed = routerKeysRaw ? JSON.parse(routerKeysRaw) : [];
const routerClients = routerKeysParsed.map(
  (key) =>
    new OpenAI({
      apiKey: key,
      baseURL: "https://openrouter.ai/api/v1",
    }),
);
const useOpenRouter = routerClients.length > 0;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy_key",
});
const geminiClients = geminiKeys.map((key) => new GoogleGenAI({ apiKey: key }));

const useGemini = geminiClients.length > 0;
if (useGemini) {
  console.log(
    `🤖 Đang sử dụng GEMINI cho AI Engine với ${geminiClients.length} API keys...`,
  );
}
if (useOpenRouter) {
  console.log(
    `🌐 Đã bật OpenRouter với ${routerClients.length} API keys làm dự phòng!`,
  );
}

const action = process.argv[2]; // 'plan' hoặc 'audit'

const GEMINI_MODELS = [
  "gemini-3.1-pro",
  "gemini-3.8-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

const OPENROUTER_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "poolside/laguna-s-2.1:free",
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "dots-studio/dots-3-note-preview:free",
];

// Helper to execute API requests with model fallback and key cycling
async function executeWithFallbacks(promptContent, systemMessage) {
  let resultText = "";

  if (useGemini) {
    let keyIndex = 0;
    let modelIndex = 0;
    let retries = geminiClients.length * GEMINI_MODELS.length;

    while (retries > 0) {
      try {
        const gemini = geminiClients[keyIndex];
        const modelName = GEMINI_MODELS[modelIndex];
        console.log(
          `⏳ Đang thử Gemini Key [${keyIndex + 1}] với model [${modelName}]...`,
        );

        const res = await gemini.models.generateContent({
          model: modelName,
          contents: systemMessage
            ? `${systemMessage}\n\n${promptContent}`
            : promptContent,
        });

        return res.text;
      } catch (error) {
        // If model not found (404/400) or rate limited (429, 503), cycle models/keys
        modelIndex++;
        if (modelIndex >= GEMINI_MODELS.length) {
          modelIndex = 0;
          keyIndex = (keyIndex + 1) % geminiClients.length;
        }
        console.warn(
          `⚠️ Gemini lỗi (${error.status || error.message}). Chuyển sang thử nghiệm tiếp theo... (Còn ${retries - 1} lần thử)`,
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        retries--;
      }
    }
    console.warn(
      `⚠️ Gemini thất bại toàn bộ! Đang chuyển qua fallback OpenRouter...`,
    );
  }

  if (useOpenRouter) {
    let keyIndex = 0;
    let modelIndex = 0;
    let retries = routerClients.length * OPENROUTER_MODELS.length;

    while (retries > 0) {
      try {
        const client = routerClients[keyIndex];
        const modelName = OPENROUTER_MODELS[modelIndex];
        console.log(
          `🌐 Đang thử OpenRouter Key [${keyIndex + 1}] với model [${modelName}]...`,
        );

        const messages = [];
        if (systemMessage)
          messages.push({ role: "system", content: systemMessage });
        messages.push({ role: "user", content: promptContent });

        const res = await client.chat.completions.create({
          model: modelName,
          messages: messages,
        });

        return res.choices[0].message.content;
      } catch (error) {
        modelIndex++;
        if (modelIndex >= OPENROUTER_MODELS.length) {
          modelIndex = 0;
          keyIndex = (keyIndex + 1) % routerClients.length;
        }
        console.warn(
          `⚠️ OpenRouter lỗi (${error.status || error.message}). Chuyển sang thử nghiệm tiếp theo... (Còn ${retries - 1} lần thử)`,
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        retries--;
      }
    }
  }

  throw new Error(
    "❌ Tất cả các Models và API Keys (Gemini & OpenRouter) đều thất bại!",
  );
}

if (action === "plan") {
  const auditPath = fs.existsSync("specs/AUDIT_PROJECT.md")
    ? "specs/AUDIT_PROJECT.md"
    : "specs/AUDITT_PROJECT.md";
  const auditContent = fs.readFileSync(auditPath, "utf-8");
  console.log("🧠 [NÃO] Đang phân tích Audit và lập PLAN_PROJECT.md...");

  try {
    const planText = await executeWithFallbacks(
      `Dựa trên bản audit này:\n${auditContent}\nHãy lập kế hoạch chi tiết từng task (P0, P1, P2) cho dự án và xuất ra chuẩn markdown cho file specs/PLAN_PROJECT.md.`,
      `Bạn là Principal Architect.`,
    );
    fs.writeFileSync("specs/PLAN_PROJECT.md", planText);
    console.log("✅ [NÃO] Đã xuất specs/PLAN_PROJECT.md thành công!");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

if (action === "audit") {
  console.log("🔍 [KIỂM THỬ] Đang bới lông tìm vết rà soát code...");

  let gitDiff = "";
  try {
    gitDiff = execSync("git diff HEAD~1", { encoding: "utf-8" });
  } catch {
    gitDiff = execSync("git diff", { encoding: "utf-8" });
  }

  const planPath = fs.existsSync("specs/PLAN_PROJECT.md")
    ? "specs/PLAN_PROJECT.md"
    : "specs/AUDIT_PROJECT.md";
  const planContent = fs.readFileSync(planPath, "utf-8");

  try {
    const reviewText = await executeWithFallbacks(
      `KẾ HOẠCH ĐẶT RA:\n${planContent}\n\nTHỰC TẾ GIT DIFF VỪA CODE:\n${gitDiff.slice(0, 60000)}`,
      `Bạn là Lead QA Auditor cực kỳ khắt khe và bảo thủ. 
Nhiệm vụ: Đối chiếu Git Diff với Kế hoạch. 
Quy tắc:
- Soi xét ranh giới Server vs Client ('use client' bừa bãi).
- Tìm kiếm hardcoded logic, rò rỉ bảo mật RLS, race condition timer.
- Nếu code làm ẩu, thiếu sót hoặc không tuân thủ kế hoạch: BẮT BUỘC trả về [STATUS: FAILED] kèm chỉ trích chi tiết từng dòng.
- Chỉ khi code thực sự hoàn hảo, sạch sẽ và an toàn mới trả về [STATUS: PASSED].`,
    );

    fs.writeFileSync("specs/REVIEW_LOG.md", reviewText);
    console.log("\n📝 BÁO CÁO KIỂM THỬ TỪ AUDITOR:\n", reviewText);

    if (reviewText.includes("[STATUS: FAILED]")) {
      console.error(
        "\n❌ [KIỂM THỬ KHÔNG ĐẠT]: Antigravity Agent cần đọc file specs/REVIEW_LOG.md và sửa lại!",
      );
      process.exit(1);
    } else {
      console.log("\n🎉 [KIỂM THỬ ĐÃ THÔNG QUA]: Code đạt chuẩn bàn giao!");
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
