-- Phase 1: add rounds.slug as a stable program identifier.
-- Strategy: add nullable, backfill, then add NOT NULL + UNIQUE so existing rows survive.

ALTER TABLE "rounds" ADD COLUMN "slug" text;--> statement-breakpoint

-- Known program slugs (match the landing-page convention agreed on in plan).
UPDATE "rounds" SET "slug" = 'online-program'
  WHERE "slug" IS NULL
    AND ("order" = 1 OR "name" ILIKE '%preliminary%' OR "name" ILIKE '%online%');--> statement-breakpoint

UPDATE "rounds" SET "slug" = 'china-camp'
  WHERE "slug" IS NULL
    AND ("order" = 2 OR "name" ILIKE '%final%' OR "name" ILIKE '%camp%' OR "name" ILIKE '%china%');--> statement-breakpoint

-- Fallback: auto-slugify any remaining rows from name. Production must verify these.
UPDATE "rounds"
  SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-)|(-$)', '', 'g'))
  WHERE "slug" IS NULL;--> statement-breakpoint

ALTER TABLE "rounds" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_slug_unique" UNIQUE("slug");
