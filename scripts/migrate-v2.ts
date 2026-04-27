import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running migration v2...");

  // Add roundId to payments table
  await sql`
    ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS round_id integer REFERENCES rounds(id) ON DELETE SET NULL
  `;
  console.log("✓ payments.round_id added");

  // Create notifications table
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id serial PRIMARY KEY,
      subject text NOT NULL,
      body text NOT NULL,
      recipient_filter text NOT NULL DEFAULT 'all',
      cycle_id integer REFERENCES cycles(id) ON DELETE SET NULL,
      sent_by_user_id text REFERENCES "user"(id) ON DELETE SET NULL,
      recipient_count integer NOT NULL DEFAULT 0,
      sent_at timestamp NOT NULL DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ notifications table created");

  console.log("\nMigration v2 complete!");
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
