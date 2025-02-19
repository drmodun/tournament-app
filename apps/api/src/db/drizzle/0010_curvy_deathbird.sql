ALTER TABLE "participation" RENAME COLUMN "participation_id" TO "id";--> statement-breakpoint
ALTER TABLE "roster" DROP CONSTRAINT "roster_group_id_group_id_fk";
--> statement-breakpoint
ALTER TABLE "participation" ADD COLUMN "is_fake" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "participation" ADD COLUMN "temporary_group_name" text;--> statement-breakpoint
ALTER TABLE "participation" ADD COLUMN "temporary_group_profile_picture" text;--> statement-breakpoint
ALTER TABLE "roster" ADD COLUMN "participation_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "is_multiple_teams_per_group_allowed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "is_fake_players_allowed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "is_ranked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_roster" ADD COLUMN "is_temporary" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_roster" ADD COLUMN "temporary_user_profile_picture" text;--> statement-breakpoint
ALTER TABLE "user_roster" ADD COLUMN "temporary_username" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roster" ADD CONSTRAINT "roster_participation_id_participation_id_fk" FOREIGN KEY ("participation_id") REFERENCES "public"."participation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "roster" DROP COLUMN IF EXISTS "group_id";