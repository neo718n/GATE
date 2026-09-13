ALTER TABLE "waitlist_signups" ADD COLUMN "ip_hash" text;--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD COLUMN "user_agent_class" text;--> statement-breakpoint
CREATE INDEX "waitlist_signups_created_at_idx" ON "waitlist_signups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "waitlist_signups_status_idx" ON "waitlist_signups" USING btree ("status");--> statement-breakpoint
ALTER TABLE "waitlist_signups" ADD CONSTRAINT "waitlist_signups_email_unique" UNIQUE("email");