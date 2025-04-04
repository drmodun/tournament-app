ALTER TYPE "public"."notification_type" ADD VALUE 'new-follower';--> statement-breakpoint
ALTER TABLE "matchup" ALTER COLUMN "round_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "score" ALTER COLUMN "round_number" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "matchup" ADD COLUMN "round" integer;