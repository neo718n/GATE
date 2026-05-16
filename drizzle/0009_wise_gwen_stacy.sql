CREATE TYPE "public"."certificate_verification_status" AS ENUM('verified', 'not_found', 'revoked', 'rate_limited');--> statement-breakpoint
CREATE TABLE "certificate_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificate_id" integer,
	"attempted_code" text NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"ip_hash" text NOT NULL,
	"country_code" text,
	"user_agent_class" text NOT NULL,
	"result_status" "certificate_verification_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"result_id" integer NOT NULL,
	"verification_code" text NOT NULL,
	"code_hash" text NOT NULL,
	"participant_name" text NOT NULL,
	"subject_name" text NOT NULL,
	"subject_code" text NOT NULL,
	"award" "award" NOT NULL,
	"score_percentile" integer,
	"cycle_id" integer NOT NULL,
	"cycle_year" integer NOT NULL,
	"pdf_key" text,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"revoked_reason" text,
	CONSTRAINT "certificates_result_id_unique" UNIQUE("result_id"),
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
ALTER TABLE "certificate_verifications" ADD CONSTRAINT "certificate_verifications_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cert_verifications_certificate_id_idx" ON "certificate_verifications" USING btree ("certificate_id","verified_at");--> statement-breakpoint
CREATE INDEX "cert_verifications_verified_at_idx" ON "certificate_verifications" USING btree ("verified_at");--> statement-breakpoint
CREATE INDEX "certificates_code_hash_idx" ON "certificates" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "certificates_cycle_award_idx" ON "certificates" USING btree ("cycle_id","award");