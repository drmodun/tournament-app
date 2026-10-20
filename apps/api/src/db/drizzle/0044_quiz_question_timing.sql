ALTER TABLE "quiz_attempt" ADD COLUMN "question_order" integer[];--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD COLUMN "question_started_at" timestamp with time zone;