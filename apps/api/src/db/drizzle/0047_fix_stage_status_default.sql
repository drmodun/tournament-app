-- Migration 0016 changed stage_status's type and dropped its default, so stages created since then
-- had no status. Earlier renames also left stage_type as text instead of its enum.
UPDATE "stage" SET "stage_status" = CASE
  WHEN EXISTS (SELECT 1 FROM "matchup" WHERE "matchup"."stage_id" = "stage"."id") THEN 'ongoing'::"stage_status"
  ELSE 'upcoming'::"stage_status"
END
WHERE "stage_status" IS NULL;--> statement-breakpoint
ALTER TABLE "stage" ALTER COLUMN "stage_status" SET DEFAULT 'upcoming';--> statement-breakpoint
ALTER TABLE "stage" ALTER COLUMN "stage_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "stage" ALTER COLUMN "stage_type" SET DATA TYPE "stage_type" USING "stage_type"::"stage_type";--> statement-breakpoint
ALTER TABLE "stage" ALTER COLUMN "stage_type" SET DEFAULT 'group';
