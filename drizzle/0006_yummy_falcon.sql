CREATE TYPE "public"."enrollment_payment_status" AS ENUM('unpaid', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('draft', 'pending_payment', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"subject_id" integer,
	"enrollment_status" "enrollment_status" DEFAULT 'draft' NOT NULL,
	"payment_status" "enrollment_payment_status" DEFAULT 'unpaid' NOT NULL,
	"payment_id" integer,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enrollments_participant_id_round_id_subject_id_unique" UNIQUE("participant_id","round_id","subject_id")
);
--> statement-breakpoint
ALTER TABLE "participant_subjects" ADD COLUMN "enrollment_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enrollments_participant_id_idx" ON "enrollments" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "enrollments_round_id_idx" ON "enrollments" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "enrollments_participant_status_idx" ON "enrollments" USING btree ("participant_id","enrollment_status");--> statement-breakpoint
CREATE INDEX "enrollments_round_status_idx" ON "enrollments" USING btree ("round_id","enrollment_status");--> statement-breakpoint
ALTER TABLE "participant_subjects" ADD CONSTRAINT "participant_subjects_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;