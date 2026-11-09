/**
 * Script validate nội dung IELTS trước khi sinh seed migration.
 *
 * Quy trình G1 (theo Plan Go-Live v1.0.2):
 *   AI draft → script validate này → tự review theo CONTENT_OPERATIONS.md
 *   → migration published (forward-only).
 *
 * Usage:
 *   node scripts/content/validate-content.js <path-to-json>
 *
 * JSON schema đầu vào (theo src/features/learning/schemas.ts + Phase 12 taxonomy):
 *   {
 *     module: { id, slug, title, order_index },
 *     lessons: [{ id, slug, title, content, difficulty, topic, order_index }],
 *     exercises: [{ id, slug, type, difficulty, question_set: [...], answer_key: {...} }],
 *     provenance: { source, license, checksum, ai_generated: boolean }
 *   }
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const VALID_DIFFICULTY = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VALID_QUESTION_TYPE = [
  "multiple_choice",
  "single_choice",
  "true_false_not_given",
  "yes_no_not_given",
  "matching_headings",
  "matching_features",
  "summary_completion",
  "fill_in_blanks",
  "matching",
  "short_text",
];
const VALID_SKILL = [
  "READING",
  "LISTENING",
  "WRITING",
  "SPEAKING",
  "GRAMMAR",
  "VOCABULARY",
];

let errors = [];
let warnings = [];

function error(msg) {
  errors.push(msg);
  console.error(`❌ ${msg}`);
}

function warn(msg) {
  warnings.push(msg);
  console.warn(`⚠️ ${msg}`);
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function validateProvenance(prov) {
  if (!prov) {
    error("Thiếu trường `provenance` (bắt buộc theo CONTENT_OPERATIONS.md).");
    return;
  }
  if (!prov.source) error("Provenance: thiếu `source` (nguồn nội dung).");
  if (!prov.license) error("Provenance: thiếu `license` (giấy phép sử dụng).");
  if (!prov.checksum)
    warn(
      "Provenance: thiếu `checksum` (khuyến khích để kiểm tra tính toàn vẹn).",
    );
  if (prov.ai_generated === undefined)
    warn("Provenance: thiếu `ai_generated` (đánh dấu nội dung AI draft).");
  if (prov.ai_generated)
    warn(
      "Nội dung được sinh bởi AI — bắt buộc người review duyệt trước khi publish.",
    );
}

function validateAnswerKey(exercise) {
  const { id, question_set, answer_key } = exercise;

  if (!question_set || !Array.isArray(question_set)) {
    error(`Exercise ${id}: thiếu question_set.`);
    return;
  }

  if (!answer_key || typeof answer_key !== "object") {
    error(`Exercise ${id}: thiếu answer_key.`);
    return;
  }

  // Kiểm tra positions liên tục
  const positions = question_set.map((q, i) => q.position ?? i + 1);
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) {
      error(
        `Exercise ${id}: vị trí câu hỏi không liên tục (gap tại ${i + 1}).`,
      );
      break;
    }
  }

  // Mỗi câu phải có đáp án trong answer_key
  for (const q of question_set) {
    const qId = String(q.id);
    if (!(qId in answer_key)) {
      error(`Exercise ${id}: câu hỏi ${qId} không có đáp án trong answer_key.`);
    }
  }

  ok(
    `Exercise ${id}: ${question_set.length} câu, answer_key có ${Object.keys(answer_key).length} đáp án.`,
  );
}

function validateDifficulty(difficulty, ctx) {
  if (!VALID_DIFFICULTY.includes(difficulty)) {
    error(
      `${ctx}: độ khó '${difficulty}' không hợp lệ. Phải là một trong: ${VALID_DIFFICULTY.join(", ")}.`,
    );
  }
}

function validateContent(input) {
  errors = [];
  warnings = [];

  console.log("🔍 Bắt đầu validate nội dung...\n");

  // 1. Provenance (bắt buộc)
  validateProvenance(input.provenance);

  // 2. Module
  if (!input.module?.slug) error("Thiếu module.slug.");
  if (!input.module?.title) error("Thiếu module.title.");

  // 3. Lessons
  const lessons = input.lessons || [];
  for (const lesson of lessons) {
    if (!lesson.slug) error(`Lesson ${lesson.id || "?"}: thiếu slug.`);
    if (!lesson.title) error(`Lesson ${lesson.id || "?"}: thiếu title.`);
    validateDifficulty(lesson.difficulty, `Lesson ${lesson.slug}`);
    if (!lesson.content || lesson.content.length < 50) {
      warn(`Lesson ${lesson.slug}: nội dung quá ngắn (< 50 ký tự).`);
    }
  }

  // 4. Exercises
  const exercises = input.exercises || [];
  for (const exercise of exercises) {
    if (!exercise.slug) error(`Exercise ${exercise.id || "?"}: thiếu slug.`);
    validateDifficulty(exercise.difficulty, `Exercise ${exercise.slug}`);
    if (!VALID_QUESTION_TYPE.includes(exercise.type)) {
      error(`Exercise ${exercise.slug}: type '${exercise.type}' không hợp lệ.`);
    }
    validateAnswerKey(exercise);
  }

  // 5. Content quality rules (từ CONTENT_OPERATIONS.md §7.4)
  if (exercises.length === 0)
    error("Không có exercise nào — không publish được.");
  if (lessons.length === 0) error("Không có lesson nào — không publish được.");

  // 6. AI-generated content warning
  if (input.provenance?.ai_generated) {
    warn("⚠️ Nội dung AI-generated — bắt buộc spot-check ≥20% item mỗi batch.");
  }

  console.log(
    `\n📊 Kết quả: ${errors.length} lỗi, ${warnings.length} cảnh báo.`,
  );

  if (errors.length > 0) {
    console.error(
      "\n🛡️ VALIDATE THẤT BẠI — Không được sinh migration publish.",
    );
    process.exit(1);
  }

  console.log(
    "\n🎉 VALIDATE THÀNH CÔNG — Có thể tiến hành sinh seed migration draft.",
  );
  return { errors, warnings };
}

// ---- CLI entry ----

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node scripts/content/validate-content.js <path-to-json>",
  );
  process.exit(1);
}

const filePath = args[0];
try {
  const raw = readFileSync(filePath, "utf-8");
  const input = JSON.parse(raw);
  validateContent(input);
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(`❌ Không tìm thấy file: ${filePath}`);
  } else if (err instanceof SyntaxError) {
    console.error(`❌ JSON không hợp lệ: ${err.message}`);
  } else {
    console.error(`❌ Lỗi: ${err.message}`);
  }
  process.exit(1);
}
