ALTER TABLE "payments" ADD COLUMN "enrollment_id" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_enrollment_id_idx" ON "payments" USING btree ("enrollment_id");