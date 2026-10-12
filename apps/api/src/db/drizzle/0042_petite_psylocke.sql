ALTER TABLE "quiz" DROP CONSTRAINT "quiz_matchup_id_matchup_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz" DROP CONSTRAINT "quiz_stage_id_stage_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz" ADD CONSTRAINT "quiz_matchup_id_matchup_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."matchup"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz" ADD CONSTRAINT "quiz_stage_id_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stage"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
