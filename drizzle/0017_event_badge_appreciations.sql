CREATE TABLE "event_badge_appreciations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_badge_id" integer NOT NULL,
	"role_label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_badge_appreciations_event_badge_id_unique" UNIQUE("event_badge_id")
);
--> statement-breakpoint
ALTER TABLE "event_badge_appreciations" ADD CONSTRAINT "event_badge_appreciations_event_badge_id_event_badges_id_fk" FOREIGN KEY ("event_badge_id") REFERENCES "public"."event_badges"("id") ON DELETE cascade ON UPDATE no action;