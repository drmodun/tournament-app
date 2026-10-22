-- Settings rows without a user can never be read, and would block the primary key
DELETE FROM "user_notification_settings" WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "user_notification_settings" DROP CONSTRAINT "user_notification_settings_user_id_unique";--> statement-breakpoint
ALTER TABLE "user_notification_settings" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "tournament" ADD COLUMN "subcategory_id" integer;--> statement-breakpoint
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_subcategory_id_subcategory_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_to_notification_tokens" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
-- A token keeps only its latest owner
DELETE FROM "user_to_notification_tokens" t
  USING "user_to_notification_tokens" newer
  WHERE t."token" = newer."token" AND t."id" < newer."id";--> statement-breakpoint
ALTER TABLE "user_to_notification_tokens" ADD CONSTRAINT "user_to_notification_tokens_token_unique" UNIQUE("token");
--> statement-breakpoint
-- roster_round is now derived from matchup results (syncRosterRounds); fill it for results entered before
INSERT INTO "stage_round" ("stage_id", "round_number")
SELECT DISTINCT m."stage_id", m."round_number"
FROM "matchup" m
WHERE m."round_id" IS NULL
  AND m."round_number" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "stage_round" sr
    WHERE sr."stage_id" = m."stage_id" AND sr."round_number" = m."round_number"
  );--> statement-breakpoint
INSERT INTO "roster_round" ("roster_id", "round_id", "score", "is_winner")
SELECT roster_id, round_id, sum(points)::int, bool_and(is_winner)
FROM (
  SELECT
    rm."roster_id",
    COALESCE(
      m."round_id",
      (SELECT min(sr."id") FROM "stage_round" sr
       WHERE sr."stage_id" = m."stage_id" AND sr."round_number" = m."round_number")
    ) AS round_id,
    rm."is_winner",
    COALESCE(
      (SELECT sum(str."points") FROM "score" s
       JOIN "score_to_roster" str ON str."score_id" = s."id"
       WHERE s."matchup_id" = m."id" AND str."roster_id" = rm."roster_id"),
      0
    ) AS points
  FROM "matchup" m
  JOIN "roster_matchup" rm ON rm."matchup_id" = m."id"
  WHERE m."is_finished"
) played
WHERE round_id IS NOT NULL
GROUP BY roster_id, round_id
ON CONFLICT ("roster_id", "round_id")
DO UPDATE SET "score" = EXCLUDED."score", "is_winner" = EXCLUDED."is_winner";
