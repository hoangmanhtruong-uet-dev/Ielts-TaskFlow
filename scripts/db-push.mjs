import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { execSync } from "node:child_process";

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl || rawUrl.includes("[YOUR-PASSWORD]")) {
  console.error("DATABASE_URL is missing or still contains placeholder.");
  process.exit(1);
}

// Extract password and construct pooler URL
const urlObj = new URL(rawUrl);
const password = urlObj.password;
const projectRef = "tpqlqwvzqhjrtqpitslk";

const poolerUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;
console.log(
  "Applying all unapplied migrations to remote Supabase Cloud database...",
);

try {
  const result = execSync(
    `npx supabase db push --include-all --db-url "${poolerUrl}"`,
    {
      encoding: "utf8",
      stdio: "pipe",
    },
  );
  console.log("Migration push SUCCESSFUL!\n", result);
} catch (err) {
  console.log("Migration push output / error:");
  if (err.stdout) console.log("STDOUT:\n", err.stdout);
  if (err.stderr) console.error("STDERR:\n", err.stderr);
  if (err.message) console.error("MSG:\n", err.message);
  process.exit(1);
}
