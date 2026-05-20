CREATE TYPE "public"."integration_partner_signing_alg" AS ENUM('HS256', 'RS256');--> statement-breakpoint
CREATE TYPE "public"."integration_partner_status" AS ENUM('active', 'disabled', 'sandbox');--> statement-breakpoint
CREATE TYPE "public"."partner_webhook_status" AS ENUM('pending', 'delivered', 'failed');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'exam_partner';--> statement-breakpoint
CREATE TABLE "integration_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client_id" text NOT NULL,
	"signing_alg" "integration_partner_signing_alg" DEFAULT 'HS256' NOT NULL,
	"shared_secret_enc" text,
	"jwt_public_key" text,
	"api_key_hash" text,
	"webhook_url" text,
	"webhook_secret_enc" text,
	"allowed_return_origins" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" "integration_partner_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "integration_partners_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "partner_launch_nonces" (
	"jti" text PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"external_user_id" text NOT NULL,
	"participant_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"partner_managed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_participants_partner_id_external_user_id_unique" UNIQUE("partner_id","external_user_id")
);
--> statement-breakpoint
CREATE TABLE "partner_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"partner_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_staff_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "partner_webhook_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"event" text NOT NULL,
	"payload" jsonb NOT NULL,
	"delivery_id" text NOT NULL,
	"status" "partner_webhook_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_webhook_deliveries_delivery_id_unique" UNIQUE("delivery_id")
);
--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "partner_id" integer;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "external_assignment_id" text;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "partner_return_url" text;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "copy_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "fullscreen_exits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "focus_loss_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "dev_tools_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "offline_resume_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD COLUMN "last_activity_at" timestamp;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "created_by_partner_id" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "difficulty" text;--> statement-breakpoint
ALTER TABLE "partner_launch_nonces" ADD CONSTRAINT "partner_launch_nonces_partner_id_integration_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."integration_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_participants" ADD CONSTRAINT "partner_participants_partner_id_integration_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."integration_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_participants" ADD CONSTRAINT "partner_participants_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_participants" ADD CONSTRAINT "partner_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD CONSTRAINT "partner_staff_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_staff" ADD CONSTRAINT "partner_staff_partner_id_integration_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."integration_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_webhook_deliveries" ADD CONSTRAINT "partner_webhook_deliveries_partner_id_integration_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."integration_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "integration_partners_client_id_idx" ON "integration_partners" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "integration_partners_api_key_hash_idx" ON "integration_partners" USING btree ("api_key_hash");--> statement-breakpoint
CREATE INDEX "partner_launch_nonces_expires_at_idx" ON "partner_launch_nonces" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "partner_participants_participant_id_idx" ON "partner_participants" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "partner_staff_partner_id_idx" ON "partner_staff" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_webhook_deliveries_partner_id_idx" ON "partner_webhook_deliveries" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_webhook_deliveries_status_idx" ON "partner_webhook_deliveries" USING btree ("status");--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_partner_id_integration_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."integration_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_partner_id_integration_partners_id_fk" FOREIGN KEY ("created_by_partner_id") REFERENCES "public"."integration_partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exam_sessions_partner_id_idx" ON "exam_sessions" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "exams_created_by_partner_id_idx" ON "exams" USING btree ("created_by_partner_id");