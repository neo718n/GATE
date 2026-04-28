import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Running migration v3: documents table...");

  await sql`
    DO $$ BEGIN
      CREATE TYPE document_type AS ENUM ('identity','photo','certificate','invoice','cv','other');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id          SERIAL PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      participant_id INTEGER REFERENCES participants(id) ON DELETE SET NULL,
      type        document_type NOT NULL DEFAULT 'other',
      name        TEXT NOT NULL,
      key         TEXT NOT NULL UNIQUE,
      size        INTEGER,
      mime_type   TEXT,
      archived_at TIMESTAMP,
      uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Migration v3 complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
