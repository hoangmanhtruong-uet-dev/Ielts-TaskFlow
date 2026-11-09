import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  const tables = [
    "learning_modules",
    "lessons",
    "lesson_versions",
    "lesson_sections",
    "exercise_sets",
    "exercise_questions",
    "vocabulary_entries",
    "grammar_topics",
    "dictation_exercises",
    "placement_tests",
    "placement_questions",
    "reading_passages",
    "speaking_sets",
    "writing_tasks",
    "mock_tests",
  ];

  console.log("=== REMOTE DATABASE ROW COUNTS ===");
  for (const table of tables) {
    try {
      const res = await client.query(
        `SELECT count(*)::int as count FROM public.${table};`,
      );
      console.log(` - ${table}: ${res.rows[0].count}`);
    } catch (e) {
      console.log(` - ${table}: ERROR (${e.message})`);
    }
  }

  await client.end();
}

main().catch(console.error);
