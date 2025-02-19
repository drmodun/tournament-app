ALTER TYPE "public"."group_type" ADD VALUE 'fake';--> statement-breakpoint
ALTER TABLE "group" DROP CONSTRAINT "group_chat_room_id_chat_room_id_fk";
--> statement-breakpoint
ALTER TABLE "group" DROP COLUMN IF EXISTS "chat_room_id";--> statement-breakpoint
ALTER TABLE "participation" DROP COLUMN IF EXISTS "temporary_group_name";--> statement-breakpoint
ALTER TABLE "participation" DROP COLUMN IF EXISTS "temporary_group_profile_picture";