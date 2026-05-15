import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("step 1: add column");
  await sql`ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "slug" text`;

  console.log("step 2: backfill online-program");
  await sql`UPDATE "rounds" SET "slug" = 'online-program' WHERE "slug" IS NULL AND ("order" = 1 OR "name" ILIKE '%preliminary%' OR "name" ILIKE '%online%')`;

  console.log("step 3: backfill china-camp");
  await sql`UPDATE "rounds" SET "slug" = 'china-camp' WHERE "slug" IS NULL AND ("order" = 2 OR "name" ILIKE '%final%' OR "name" ILIKE '%camp%' OR "name" ILIKE '%china%')`;

  console.log("step 4: fallback auto-slugify any remaining");
  await sql`UPDATE "rounds" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-)|(-$)', '', 'g')) WHERE "slug" IS NULL`;

  console.log("step 5: set NOT NULL");
  await sql`ALTER TABLE "rounds" ALTER COLUMN "slug" SET NOT NULL`;

  console.log("step 6: add UNIQUE constraint (idempotent via try)");
  try {
    await sql`ALTER TABLE "rounds" ADD CONSTRAINT "rounds_slug_unique" UNIQUE("slug")`;
  } catch (e: any) {
    if (String(e.message).includes("already exists")) {
      console.log("  unique constraint already present, skipping");
    } else {
      throw e;
    }
  }

  console.log("step 7: record migration in drizzle journal");
  const tag = "0008_wealthy_firebrand";
  const existing = await sql`SELECT 1 FROM "drizzle"."__drizzle_migrations" WHERE hash = ${tag}`;
  if (existing.length === 0) {
    await sql`INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES (${tag}, ${Date.now()})`;
    console.log("  inserted migration marker");
  } else {
    console.log("  migration marker already exists");
  }

  console.log("\nfinal state:");
  const rows = await sql`SELECT id, slug, "order", name FROM "rounds" ORDER BY "order"`;
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
