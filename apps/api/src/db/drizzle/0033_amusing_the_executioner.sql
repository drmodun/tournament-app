ALTER TYPE "public"."quiz_question_type" ADD VALUE 'order';--> statement-breakpoint
ALTER TYPE "public"."quiz_question_type" ADD VALUE 'hotspot';--> statement-breakpoint
ALTER TYPE "public"."quiz_question_type" ADD VALUE 'programming';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempt" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"current_question" integer DEFAULT 0,
	"end_time" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_option" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_question_id" integer NOT NULL,
	"option" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "time_limit_total" integer;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "stage_id" integer;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "is_anonymous_allowed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "is_retakeable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "quiz_answer" ADD COLUMN "quiz_attempt_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_answer" ADD COLUMN "selected_option_id" integer;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD COLUMN "question_image" text;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD COLUMN "time_limit" integer;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD COLUMN "is_immediate_feedback" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_option" ADD CONSTRAINT "quiz_option_quiz_question_id_quiz_question_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "public"."quiz_question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz" ADD CONSTRAINT "quiz_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz" ADD CONSTRAINT "quiz_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answer" ADD CONSTRAINT "quiz_answer_quiz_attempt_id_quiz_attempt_id_fk" FOREIGN KEY ("quiz_attempt_id") REFERENCES "public"."quiz_attempt"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answer" ADD CONSTRAINT "quiz_answer_selected_option_id_quiz_option_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."quiz_option"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
