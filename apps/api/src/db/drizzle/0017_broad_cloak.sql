ALTER TABLE "category_career" RENAME COLUMN "matchmaking_points" TO "elo";--> statement-breakpoint
ALTER TABLE "category_career" DROP COLUMN IF EXISTS "level";