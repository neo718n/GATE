CREATE TYPE "public"."contact_method" AS ENUM('whatsapp', 'telegram', 'instagram', 'phone', 'email');--> statement-breakpoint
CREATE TYPE "public"."registration_source" AS ENUM('individual', 'representative');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending_payment', 'paid', 'submitted', 'cancelled');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"edition_slug" text NOT NULL,
	"source" "registration_source" NOT NULL,
	"representative_id" integer,
	"invite_link_id" integer,
	"status" "application_status" NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" "gender" NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"school" text NOT NULL,
	"grade" integer NOT NULL,
	"subject" text NOT NULL,
	"email" text NOT NULL,
	"contact_method" "contact_method" NOT NULL,
	"contact_value" text NOT NULL,
	"guardian_name" text NOT NULL,
	"guardian_phone" text NOT NULL,
	"confirmed_at" timestamp NOT NULL,
	"amount_cents" integer,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"paid_at" timestamp,
	"confirmation_email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference"),
	CONSTRAINT "applications_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
CREATE TABLE "rep_invite_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"representative_id" integer NOT NULL,
	"token" text NOT NULL,
	"label" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rep_invite_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "rep_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rep_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"representative_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rep_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "representatives" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"organization" text,
	"phone" text,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "representatives_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_representative_id_representatives_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."representatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_invite_link_id_rep_invite_links_id_fk" FOREIGN KEY ("invite_link_id") REFERENCES "public"."rep_invite_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rep_invite_links" ADD CONSTRAINT "rep_invite_links_representative_id_representatives_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."representatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rep_sessions" ADD CONSTRAINT "rep_sessions_representative_id_representatives_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."representatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_rep_idx" ON "applications" USING btree ("representative_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_edition_idx" ON "applications" USING btree ("edition_slug");--> statement-breakpoint
CREATE INDEX "rep_invite_links_rep_idx" ON "rep_invite_links" USING btree ("representative_id");--> statement-breakpoint
CREATE INDEX "rep_otps_email_idx" ON "rep_otps" USING btree ("email");