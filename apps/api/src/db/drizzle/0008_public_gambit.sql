ALTER TABLE "looking_for_players" RENAME COLUMN "user_id" TO "group_id";--> statement-breakpoint
ALTER TABLE "looking_for_players" DROP CONSTRAINT "looking_for_players_user_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "looking_for_players" ADD CONSTRAINT "looking_for_players_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
