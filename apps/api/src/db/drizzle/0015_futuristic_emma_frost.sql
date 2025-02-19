ALTER TYPE "public"."stage_type" ADD VALUE 'compass' BEFORE 'evaluated_competition';--> statement-breakpoint
ALTER TYPE "public"."stage_type" ADD VALUE 'triple_elimination' BEFORE 'evaluated_competition';--> statement-breakpoint
ALTER TABLE "stage" DROP CONSTRAINT "stage_chat_room_id_chat_room_id_fk";
--> statement-breakpoint
ALTER TABLE "participation" DROP COLUMN IF EXISTS "is_fake";--> statement-breakpoint
ALTER TABLE "stage" DROP COLUMN IF EXISTS "chat_room_id";