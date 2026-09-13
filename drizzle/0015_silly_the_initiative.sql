CREATE TYPE "public"."waitlist_status" AS ENUM('new', 'contacted', 'converted', 'archived');--> statement-breakpoint
CREATE TABLE "waitlist_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"phone_country_iso" text NOT NULL,
	"country_name" text NOT NULL,
	"country_iso" text NOT NULL,
	"detected_country_iso" text,
	"source" text DEFAULT 'homepage_hero' NOT NULL,
	"status" "waitlist_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
