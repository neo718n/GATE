import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Starting migration...");

  // 1. Drop stage from results (if exists)
  await sql`ALTER TABLE results DROP COLUMN IF EXISTS stage`;
  console.log("✓ Dropped results.stage");

  // 2. Drop old stage enum (if exists)
  await sql`DROP TYPE IF EXISTS stage CASCADE`;
  console.log("✓ Dropped stage enum");

  // 3. Add round_format enum (if not exists)
  const rfExists = await sql`SELECT 1 FROM pg_type WHERE typname = 'round_format'`;
  if (rfExists.length === 0) {
    await sql`CREATE TYPE round_format AS ENUM ('online', 'onsite', 'hybrid')`;
    console.log("✓ Created round_format enum");
  } else {
    console.log("- round_format enum already exists");
  }

  // 4. Handle cycle_status enum changes
  // PostgreSQL can't remove enum values directly; rename old type, create new, migrate, drop old
  const csValues = await sql`
    SELECT enumlabel FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'cycle_status'
    ORDER BY enumsortorder
  `;
  const existing = csValues.map((r) => (r as { enumlabel: string }).enumlabel);
  console.log("Current cycle_status values:", existing);

  if (!existing.includes("active")) {
    await sql`ALTER TYPE cycle_status ADD VALUE IF NOT EXISTS 'active'`;
    console.log("✓ Added 'active' to cycle_status");
  }
  // Note: PostgreSQL cannot remove enum values without recreating the type.
  // 'preliminary' and 'onsite' values will remain in the type but won't be used.

  // 5. Alter cycles table
  await sql`ALTER TABLE cycles DROP COLUMN IF EXISTS prelim_start`;
  await sql`ALTER TABLE cycles DROP COLUMN IF EXISTS prelim_end`;
  await sql`ALTER TABLE cycles DROP COLUMN IF EXISTS onsite_start`;
  await sql`ALTER TABLE cycles DROP COLUMN IF EXISTS onsite_end`;
  await sql`ALTER TABLE cycles DROP COLUMN IF EXISTS onsite_venue`;
  await sql`ALTER TABLE cycles ADD COLUMN IF NOT EXISTS description text`;
  // Remove unique constraint on year (if any)
  await sql`
    DO $$
    DECLARE
      cname text;
    BEGIN
      SELECT conname INTO cname
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'cycles' AND c.contype = 'u'
        AND c.conname LIKE '%year%';
      IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE cycles DROP CONSTRAINT ' || quote_ident(cname);
      END IF;
    END $$
  `;
  console.log("✓ Updated cycles table");

  // 6. Create rounds table
  await sql`
    CREATE TABLE IF NOT EXISTS rounds (
      id serial PRIMARY KEY,
      cycle_id integer NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
      name text NOT NULL,
      "order" integer NOT NULL DEFAULT 1,
      format round_format NOT NULL DEFAULT 'online',
      start_date timestamp,
      end_date timestamp,
      venue text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ Created rounds table");

  // 7. Create cycle_subjects table
  await sql`
    CREATE TABLE IF NOT EXISTS cycle_subjects (
      cycle_id integer NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
      subject_id integer NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      PRIMARY KEY (cycle_id, subject_id)
    )
  `;
  console.log("✓ Created cycle_subjects table");

  // 8. Add round_id to results
  await sql`ALTER TABLE results ADD COLUMN IF NOT EXISTS round_id integer REFERENCES rounds(id) ON DELETE SET NULL`;
  console.log("✓ Added results.round_id");

  console.log("\nMigration complete.");
}

migrate().catch((err) => { console.error(err); process.exit(1); });


