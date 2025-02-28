CREATE TABLE IF NOT EXISTS "matchup_parent_matchup" (
	"matchup_id" integer NOT NULL,
	"parent_matchup_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "matchup_parent_matchup_matchup_id_parent_matchup_id_pk" PRIMARY KEY("matchup_id","parent_matchup_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roster_round" (
	"roster_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"score" integer DEFAULT 0,
	"is_winner" boolean DEFAULT false,
	CONSTRAINT "roster_round_roster_id_round_id_pk" PRIMARY KEY("roster_id","round_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "round" (
	"id" serial PRIMARY KEY NOT NULL,
	"matchup_id" integer,
	"round_number" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "organizer" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "organizer" CASCADE;--> statement-breakpoint
ALTER TABLE "tournament" ALTER COLUMN "minimum_level" SET DEFAULT -1;--> statement-breakpoint
ALTER TABLE "tournament" ALTER COLUMN "maximum_mmr" SET DEFAULT 999999;--> statement-breakpoint
ALTER TABLE "matchup" ADD COLUMN "is_finished" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "roster_matchup" ADD COLUMN "is_winner" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "stage" ADD COLUMN "max_changes" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matchup_parent_matchup" ADD CONSTRAINT "matchup_parent_matchup_matchup_id_matchup_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."matchup"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matchup_parent_matchup" ADD CONSTRAINT "matchup_parent_matchup_parent_matchup_id_matchup_id_fk" FOREIGN KEY ("parent_matchup_id") REFERENCES "public"."matchup"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roster_round" ADD CONSTRAINT "roster_round_roster_id_roster_id_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roster_round" ADD CONSTRAINT "roster_round_round_id_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "roster_matchup" DROP COLUMN IF EXISTS "points";--> statement-breakpoint
ALTER TABLE "user_roster" DROP COLUMN IF EXISTS "is_temporary";--> statement-breakpoint
ALTER TABLE "user_roster" DROP COLUMN IF EXISTS "temporary_user_profile_picture";--> statement-breakpoint
ALTER TABLE "user_roster" DROP COLUMN IF EXISTS "temporary_username";--> statement-breakpoint
ALTER TABLE "user_roster" DROP COLUMN IF EXISTS "point_difference";