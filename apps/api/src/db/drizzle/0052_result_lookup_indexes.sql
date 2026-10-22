CREATE INDEX "matchup_stage_id_index" ON "matchup" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "roster_matchup_matchup_id_index" ON "roster_matchup" USING btree ("matchup_id");--> statement-breakpoint
CREATE INDEX "score_matchup_id_index" ON "score" USING btree ("matchup_id");--> statement-breakpoint
CREATE INDEX "score_to_roster_score_id_index" ON "score_to_roster" USING btree ("score_id");--> statement-breakpoint
CREATE INDEX "stage_round_stage_id_round_number_index" ON "stage_round" USING btree ("stage_id","round_number");