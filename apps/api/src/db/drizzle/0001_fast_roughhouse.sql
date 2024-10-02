ALTER TABLE "user_roster" ADD COLUMN "point_difference" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "category_career" DROP COLUMN IF EXISTS "points";