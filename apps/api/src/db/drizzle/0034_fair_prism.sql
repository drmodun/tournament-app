CREATE TABLE IF NOT EXISTS "quiz_tags" (
	"quiz_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quiz_question" RENAME COLUMN "correct_answer" TO "correct_answers";--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "is_randomized_questions" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "passing_score" integer;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD COLUMN "order" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_tags" ADD CONSTRAINT "quiz_tags_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_tags" ADD CONSTRAINT "quiz_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_name_index" ON "tags" USING btree ("name");