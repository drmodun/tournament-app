import { sql } from 'drizzle-orm';
import { db } from '../db/db';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Rebuilds roster_round for a stage from its finished matchups, so it always agrees with them: one row
// per roster and round it played, with the points it scored there and whether it won everything it
// played (a bye is a win). Run inside the transaction that changed the results.
export async function syncRosterRounds(
  tx: Transaction | typeof db,
  stageId: number,
) {
  // Brackets run by the API and imported from Challonge number their rounds on the matchup;
  // only seeded brackets point at stage_round, so the missing rounds are created here
  await tx.execute(sql`
    INSERT INTO stage_round (stage_id, round_number)
    SELECT DISTINCT m.stage_id, m.round_number
    FROM matchup m
    WHERE m.stage_id = ${stageId}
      AND m.round_id IS NULL
      AND m.round_number IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM stage_round sr
        WHERE sr.stage_id = m.stage_id AND sr.round_number = m.round_number
      )
  `);

  await tx.execute(sql`
    WITH played AS (
      SELECT
        rm.roster_id,
        COALESCE(
          m.round_id,
          (SELECT min(sr.id) FROM stage_round sr
           WHERE sr.stage_id = m.stage_id AND sr.round_number = m.round_number)
        ) AS round_id,
        rm.is_winner,
        COALESCE(
          (SELECT sum(str.points) FROM score s
           JOIN score_to_roster str ON str.score_id = s.id
           WHERE s.matchup_id = m.id AND str.roster_id = rm.roster_id),
          0
        ) AS points
      FROM matchup m
      JOIN roster_matchup rm ON rm.matchup_id = m.id
      WHERE m.stage_id = ${stageId} AND m.is_finished
    ),
    per_round AS (
      SELECT roster_id, round_id, sum(points)::int AS score, bool_and(is_winner) AS is_winner
      FROM played
      WHERE round_id IS NOT NULL
      GROUP BY roster_id, round_id
    ),
    removed AS (
      DELETE FROM roster_round rr
      USING stage_round sr
      WHERE rr.round_id = sr.id
        AND sr.stage_id = ${stageId}
        AND NOT EXISTS (
          SELECT 1 FROM per_round p
          WHERE p.roster_id = rr.roster_id AND p.round_id = rr.round_id
        )
    )
    INSERT INTO roster_round (roster_id, round_id, score, is_winner)
    SELECT roster_id, round_id, score, is_winner FROM per_round
    ON CONFLICT (roster_id, round_id)
    DO UPDATE SET score = EXCLUDED.score, is_winner = EXCLUDED.is_winner
  `);
}
