ALTER TABLE "score_to_roster" DROP CONSTRAINT "score_to_roster_roster_id_roster_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "score_to_roster" ADD CONSTRAINT "score_to_roster_roster_id_roster_id_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
