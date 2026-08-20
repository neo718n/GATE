CREATE TYPE "public"."event_badge_category" AS ENUM('PARTICIPANT', 'DELEGATION', 'GUEST', 'OFFICIAL');--> statement-breakpoint
CREATE TYPE "public"."event_badge_role" AS ENUM('CONTESTANT', 'TEAM_LEADER', 'PARENT', 'COUNTRY_REP', 'MEDIA', 'STAFF');--> statement-breakpoint
CREATE TABLE "event_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_no" text NOT NULL,
	"category" "event_badge_category" NOT NULL,
	"role_badge" "event_badge_role" NOT NULL,
	"full_name" text NOT NULL,
	"country" text NOT NULL,
	"gender" "gender",
	"date_of_birth" date,
	"source_note" text,
	"badge_color_hex" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_badges_card_no_unique" UNIQUE("card_no")
);
--> statement-breakpoint
CREATE INDEX "event_badges_card_no_idx" ON "event_badges" USING btree ("card_no");