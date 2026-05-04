ALTER TYPE "public"."role" ADD VALUE 'question_provider';--> statement-breakpoint
CREATE INDEX "exam_answers_session_id_idx" ON "exam_answers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "exam_answers_question_id_idx" ON "exam_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "exam_sessions_exam_id_idx" ON "exam_sessions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "exam_sessions_participant_id_idx" ON "exam_sessions" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "exam_sessions_exam_participant_idx" ON "exam_sessions" USING btree ("exam_id","participant_id");--> statement-breakpoint
CREATE INDEX "exam_sessions_status_idx" ON "exam_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exams_round_id_idx" ON "exams" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "exams_subject_id_idx" ON "exams" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "exams_published_idx" ON "exams" USING btree ("published");--> statement-breakpoint
CREATE INDEX "participants_cycle_id_idx" ON "participants" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "participants_round_id_idx" ON "participants" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "participants_registration_status_idx" ON "participants" USING btree ("registration_status");--> statement-breakpoint
CREATE INDEX "participants_payment_status_idx" ON "participants" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_participant_id_idx" ON "payments" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("stripe_payment_status");--> statement-breakpoint
CREATE INDEX "questions_exam_id_order_idx" ON "questions" USING btree ("exam_id","order");--> statement-breakpoint
CREATE INDEX "results_participant_id_idx" ON "results" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "results_cycle_id_idx" ON "results" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "results_subject_id_idx" ON "results" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "rounds_cycle_id_idx" ON "rounds" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");