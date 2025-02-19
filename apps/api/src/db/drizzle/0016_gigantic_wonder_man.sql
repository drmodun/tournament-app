ALTER TABLE "public"."stage" ALTER COLUMN "stage_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."stage_status";--> statement-breakpoint
CREATE TYPE "public"."stage_status" AS ENUM('upcoming', 'ongoing', 'finished', 'cancelled');--> statement-breakpoint
ALTER TABLE "public"."stage" ALTER COLUMN "stage_status" SET DATA TYPE "public"."stage_status" USING "stage_status"::"public"."stage_status";