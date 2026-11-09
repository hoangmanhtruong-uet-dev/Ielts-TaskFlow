import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MIGRATION_PATH = resolve(
  ROOT,
  "supabase/migrations/20261025000000_seed_mvp_learning_curriculum.sql",
);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Reading migration SQL:", MIGRATION_PATH);
  const sql = readFileSync(MIGRATION_PATH, "utf8");

  console.log("Connecting to Supabase PostgreSQL database...");
  await client.connect();

  console.log(
    "Executing 20261025000000_seed_mvp_learning_curriculum.sql on remote database...",
  );
  const startTime = Date.now();
  await client.query(sql);
  console.log(`Executed successfully in ${Date.now() - startTime}ms!`);

  // Record in supabase_migrations.schema_migrations if table exists
  try {
    await client.query(`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES ('20261025000000')
      ON CONFLICT DO NOTHING;
    `);
    console.log(
      "Recorded migration 20261025000000 in schema_migrations table.",
    );
  } catch (e) {
    console.log("schema_migrations table note:", e.message);
  }

  // Verify row counts after execution
  const modRes = await client.query(
    "SELECT count(*)::int as count FROM public.learning_modules;",
  );
  const lesRes = await client.query(
    "SELECT count(*)::int as count FROM public.lessons;",
  );
  const qRes = await client.query(
    "SELECT count(*)::int as count FROM public.exercise_questions;",
  );
  const gRes = await client.query(
    "SELECT count(*)::int as count FROM public.grammar_topics;",
  );

  console.log("=== UPDATED REMOTE DATABASE STATS ===");
  console.log(` - Learning Modules: ${modRes.rows[0].count}`);
  console.log(` - Lessons: ${lesRes.rows[0].count}`);
  console.log(` - Exercise Questions: ${qRes.rows[0].count}`);
  console.log(` - Grammar Topics: ${gRes.rows[0].count}`);

  await client.end();
  console.log("Database update completed!");
}

main().catch((err) => {
  console.error("Migration execution failed:", err);
  client.end();
  process.exit(1);
});
