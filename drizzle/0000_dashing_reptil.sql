CREATE TYPE "public"."award" AS ENUM('gold', 'silver', 'bronze', 'honorable_mention', 'participation');--> statement-breakpoint
CREATE TYPE "public"."career_status" AS ENUM('submitted', 'reviewing', 'shortlisted', 'rejected', 'hired');--> statement-breakpoint
CREATE TYPE "public"."cycle_status" AS ENUM('planning', 'registration_open', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('identity', 'photo', 'certificate', 'invoice', 'cv', 'other');--> statement-breakpoint
CREATE TYPE "public"."exam_session_status" AS ENUM('active', 'submitted', 'timed_out');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('practice', 'exam');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('university', 'school', 'academic_institution', 'organization');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'paid', 'waived');--> statement-breakpoint
CREATE TYPE "public"."position_type" AS ENUM('full_time', 'part_time', 'contract', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('mcq', 'numeric', 'open');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('draft', 'submitted', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin', 'coordinator', 'participant', 'partner_contact', 'career_applicant');--> statement-breakpoint
CREATE TYPE "public"."round_format" AS ENUM('online', 'onsite', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."round_registration_status" AS ENUM('closed', 'soon', 'open');--> statement-breakpoint
CREATE TYPE "public"."stripe_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"position_id" integer,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text,
	"cv_url" text,
	"motivation_text" text,
	"status" "career_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycle_subjects" (
	"cycle_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	CONSTRAINT "cycle_subjects_cycle_id_subject_id_pk" PRIMARY KEY("cycle_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "cycle_status" DEFAULT 'planning' NOT NULL,
	"stripe_fee_percent" integer DEFAULT 290 NOT NULL,
	"stripe_fee_fixed_cents" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"participant_id" integer,
	"type" "document_type" DEFAULT 'other' NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"size" integer,
	"mime_type" text,
	"archived_at" timestamp,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "exam_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"answer" text,
	"is_correct" boolean,
	"points_awarded" numeric,
	"flagged" boolean DEFAULT false NOT NULL,
	"answered_at" timestamp,
	"graded_at" timestamp,
	"graded_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exam_answers_session_id_question_id_unique" UNIQUE("session_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "exam_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"question_order" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"deadline_at" timestamp,
	"submitted_at" timestamp,
	"status" "exam_session_status" DEFAULT 'active' NOT NULL,
	"score" numeric,
	"tab_switch_count" integer DEFAULT 0 NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" integer,
	"subject_id" integer,
	"title" text NOT NULL,
	"type" "exam_type" DEFAULT 'exam' NOT NULL,
	"instructions" text,
	"duration_minutes" integer,
	"window_start" timestamp,
	"window_end" timestamp,
	"shuffle_questions" boolean DEFAULT true NOT NULL,
	"questions_per_session" integer,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"recipient_filter" text DEFAULT 'all' NOT NULL,
	"cycle_id" integer,
	"sent_by_user_id" text,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant_subjects" (
	"participant_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	CONSTRAINT "participant_subjects_participant_id_subject_id_pk" PRIMARY KEY("participant_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"cycle_id" integer,
	"round_id" integer,
	"full_name" text NOT NULL,
	"date_of_birth" date,
	"country" text NOT NULL,
	"city" text,
	"school" text,
	"grade" text,
	"phone" text,
	"gender" "gender",
	"registration_status" "registration_status" DEFAULT 'draft' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "participants_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"organization_name" text NOT NULL,
	"type" "partner_type" NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"website" text,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"cooperation_type" text,
	"message" text,
	"status" "partner_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"participant_id" integer,
	"cycle_id" integer,
	"round_id" integer,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"card_last4" text,
	"card_brand" text,
	"amount_cents" integer NOT NULL,
	"service_fee_cents" integer DEFAULT 0,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_payment_status" "stripe_payment_status" DEFAULT 'pending' NOT NULL,
	"receipt_url" text,
	"invoice_pdf_key" text,
	"receipt_pdf_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"location" text,
	"type" "position_type" NOT NULL,
	"description" text,
	"requirements" text,
	"active" boolean DEFAULT true NOT NULL,
	"posted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_id" integer NOT NULL,
	"type" "question_type" DEFAULT 'mcq' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"content" text NOT NULL,
	"options" jsonb,
	"correct_answer" text,
	"tolerance" numeric,
	"points" integer DEFAULT 1 NOT NULL,
	"explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"cycle_id" integer NOT NULL,
	"round_id" integer,
	"score" numeric,
	"max_score" numeric,
	"rank" integer,
	"award" "award",
	"certificate_url" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" integer NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"format" "round_format" DEFAULT 'online' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"venue" text,
	"fee_usd" integer DEFAULT 0 NOT NULL,
	"registration_status" "round_registration_status" DEFAULT 'closed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"role" "role" DEFAULT 'participant' NOT NULL,
	"firstName" text,
	"lastName" text,
	"country" text,
	"phone" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_applications" ADD CONSTRAINT "career_applications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_applications" ADD CONSTRAINT "career_applications_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_subjects" ADD CONSTRAINT "cycle_subjects_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_subjects" ADD CONSTRAINT "cycle_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_session_id_exam_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_graded_by_user_id_user_id_fk" FOREIGN KEY ("graded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sent_by_user_id_user_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_subjects" ADD CONSTRAINT "participant_subjects_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_subjects" ADD CONSTRAINT "participant_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;