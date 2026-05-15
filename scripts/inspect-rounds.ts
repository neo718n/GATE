import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, cycle_id, slug, "order", name, fee_usd, registration_status FROM rounds ORDER BY cycle_id, "order"`;
  console.log("rounds:", JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
