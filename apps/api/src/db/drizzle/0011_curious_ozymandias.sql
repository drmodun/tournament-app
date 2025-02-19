ALTER TABLE "tournament" DROP CONSTRAINT "tournament_subcategory_id_subcategory_id_fk";
--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "creator_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "affiliated_group_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament" ADD CONSTRAINT "tournament_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament" ADD CONSTRAINT "tournament_affiliated_group_id_group_id_fk" FOREIGN KEY ("affiliated_group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tournament" DROP COLUMN IF EXISTS "subcategory_id";