ALTER TABLE "matchup" ADD COLUMN "challonge_matchup_id" text;--> statement-breakpoint
ALTER TABLE "roster" ADD COLUMN "challonge_participant_id" text;--> statement-breakpoint
ALTER TABLE "stage" ADD COLUMN "challonge_tournament_id" text;--> statement-breakpoint
ALTER TABLE "stage_round" ADD COLUMN "challonge_round_id" text;