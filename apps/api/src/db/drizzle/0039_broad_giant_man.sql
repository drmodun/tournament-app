ALTER TABLE "quiz_answer" ADD COLUMN "is_final" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "quiz_answer" ADD COLUMN "is_correct" boolean DEFAULT false;