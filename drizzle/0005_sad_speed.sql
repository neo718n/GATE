ALTER TABLE "exams" ADD COLUMN "target_grades" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "grades" text[] DEFAULT ARRAY[]::text[] NOT NULL;