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
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(
    "Existing tables in public schema (" + tables.rows.length + " tables):",
  );
  console.log(tables.rows.map((r) => r.table_name));

  const schemas = await client.query(`
    SELECT schema_name FROM information_schema.schemata;
  `);
  console.log(
    "Schemas:",
    schemas.rows.map((r) => r.schema_name),
  );

  await client.end();
}

main().catch(console.error);
