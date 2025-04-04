ALTER TABLE "quiz_attempt" ADD COLUMN "score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quiz_question" DROP COLUMN IF EXISTS "order";