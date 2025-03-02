CREATE TABLE IF NOT EXISTS "stage_round" (
	"id" serial PRIMARY KEY NOT NULL,
	"stage_id" integer NOT NULL,
	"round_number" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "round" RENAME TO "score";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_code_unique";--> statement-breakpoint
ALTER TABLE "roster_round" DROP CONSTRAINT "roster_round_round_id_round_id_fk";
--> statement-breakpoint
ALTER TABLE "matchup" ADD COLUMN "round_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_reset_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_confirmation_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_confirmation_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "sse_token" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stage_round" ADD CONSTRAINT "stage_round_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matchup" ADD CONSTRAINT "matchup_round_id_stage_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."stage_round"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roster_round" ADD CONSTRAINT "roster_round_round_id_stage_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."stage_round"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_name_index" ON "category" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_name_index" ON "group" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tournament_name_index" ON "tournament" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_index" ON "user" USING btree ("username");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "code";