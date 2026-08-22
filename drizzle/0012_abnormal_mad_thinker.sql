CREATE TYPE "public"."exam_subject" AS ENUM('math', 'english');--> statement-breakpoint
CREATE TABLE "event_badge_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_badge_id" integer NOT NULL,
	"subject" "exam_subject" NOT NULL,
	"category" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"correct_count" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"points_earned" integer NOT NULL,
	"points_max" integer NOT NULL,
	"award" "award" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_badge_results_event_badge_id_subject_unique" UNIQUE("event_badge_id","subject")
);
--> statement-breakpoint
ALTER TABLE "event_badge_results" ADD CONSTRAINT "event_badge_results_event_badge_id_event_badges_id_fk" FOREIGN KEY ("event_badge_id") REFERENCES "public"."event_badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_badge_results_badge_idx" ON "event_badge_results" USING btree ("event_badge_id");