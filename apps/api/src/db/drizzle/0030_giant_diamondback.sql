CREATE TABLE IF NOT EXISTS "score_to_roster" (
	"id" serial PRIMARY KEY NOT NULL,
	"score_id" integer,
	"roster_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"points" integer DEFAULT 0,
	"is_winner" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "matchup_parent_matchup" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "matchup_parent_matchup" CASCADE;--> statement-breakpoint
ALTER TABLE "matchup" ADD COLUMN "parent_matchup_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "score_to_roster" ADD CONSTRAINT "score_to_roster_score_id_score_id_fk" FOREIGN KEY ("score_id") REFERENCES "public"."score"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "score_to_roster" ADD CONSTRAINT "score_to_roster_roster_id_roster_id_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matchup" ADD CONSTRAINT "matchup_parent_matchup_id_matchup_id_fk" FOREIGN KEY ("parent_matchup_id") REFERENCES "public"."matchup"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
