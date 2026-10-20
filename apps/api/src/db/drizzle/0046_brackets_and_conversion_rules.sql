CREATE TYPE "public"."matchup_bracket" AS ENUM('winners', 'losers', 'grand_final');--> statement-breakpoint
ALTER TABLE "matchup" ADD COLUMN "bracket" "matchup_bracket";--> statement-breakpoint
ALTER TABLE "conversion_rule" ADD COLUMN "applied_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversion_rule" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "roster" ADD COLUMN "seed" integer;--> statement-breakpoint
ALTER TABLE "conversion_rule" ADD CONSTRAINT "conversion_rule_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;