import { db } from '../db';
import * as tables from '../schema';
import { InferInsertModel, eq, and } from 'drizzle-orm';
import { BracketGenerator } from '../../matches/bracket.generator';
import { RosterDrizzleRepository } from '../../roster/roster.repository';

export async function createMatches() {
  const stages = await db.select().from(tables.stage);

  for (const stage of stages) {
    const bracketGenerator = new BracketGenerator(
      new RosterDrizzleRepository(),
    );
    await bracketGenerator.generateInitialRosters(stage.id);
  }
}

export async function createInitialMatchScores() {
  // Get all first round matchups
  const firstRoundMatchups = await db
    .select({
      matchup: tables.matchup,
      round: tables.stageRound,
      rosterMatchups: tables.rosterToMatchup,
    })
    .from(tables.matchup)
    .innerJoin(
      tables.stageRound,
      eq(tables.matchup.roundId, tables.stageRound.id),
    )
    .leftJoin(
      tables.rosterToMatchup,
      eq(tables.rosterToMatchup.matchupId, tables.matchup.id),
    )
    .where(eq(tables.stageRound.roundNumber, 1));

  // Group matchups by their ID to get both rosters for each matchup
  const matchupGroups = firstRoundMatchups.reduce(
    (acc, curr) => {
      if (!acc[curr.matchup.id]) {
        acc[curr.matchup.id] = {
          matchup: curr.matchup,
          rosters: [],
        };
      }
      if (curr.rosterMatchups) {
        acc[curr.matchup.id].rosters.push(curr.rosterMatchups);
      }
      return acc;
    },
    {} as Record<
      number,
      {
        matchup: typeof tables.matchup.$inferSelect;
        rosters: (typeof tables.rosterToMatchup.$inferSelect)[];
      }
    >,
  );

  // Create scores for ~40% of first round matches
  const matchupEntries = Object.entries(matchupGroups);
  const matchupsToScore = matchupEntries.slice(
    0,
    Math.floor(matchupEntries.length * 0.4),
  );

  for (const [, { matchup, rosters }] of matchupsToScore) {
    if (rosters.length !== 2) continue; // Skip if we don't have exactly 2 rosters

    await scoreMatchup(matchup, rosters);
  }
}

// Plays out a best-of-three for one matchup and advances the winner
async function scoreMatchup(
  currentMatchup: typeof tables.matchup.$inferSelect,
  rosters: (typeof tables.rosterToMatchup.$inferSelect)[],
) {
  // Randomly decide if it's a 2-0 or 2-1 victory
  const isSweep = Math.random() > 0.3;
  const rounds = isSweep ? 2 : 3;
  const winningRosterIndex = Math.floor(Math.random() * 2);
  const winningRoster = rosters[winningRosterIndex];
  const losingRoster = rosters[1 - winningRosterIndex];

  // Create scores for each round
  for (let i = 0; i < rounds; i++) {
    const [score1, score2] =
      i === rounds - 1 || isSweep
        ? [13, Math.floor(Math.random() * 8)] // Winning round
        : winningRosterIndex === 0
          ? [Math.floor(Math.random() * 8), 13] // Losing round for roster 1
          : [13, Math.floor(Math.random() * 8)]; // Losing round for roster 2

    const scoreEntry = await db
      .insert(tables.score)
      .values({
        matchupId: currentMatchup.id,
        roundNumber: i + 1,
      })
      .returning();

    // Create score details for each roster
    await db.insert(tables.scoreToRoster).values([
      {
        scoreId: scoreEntry[0].id,
        rosterId: winningRoster.rosterId,
        points: winningRosterIndex === 0 ? score1 : score2,
        isWinner:
          score1 > score2 ? winningRosterIndex === 0 : winningRosterIndex === 1,
      },
      {
        scoreId: scoreEntry[0].id,
        rosterId: losingRoster.rosterId,
        points: winningRosterIndex === 0 ? score2 : score1,
        isWinner:
          score1 > score2 ? winningRosterIndex === 1 : winningRosterIndex === 0,
      },
    ]);
  }

  // Update matchup status and winner
  await db
    .update(tables.matchup)
    .set({
      isFinished: true,
      endDate: new Date(),
    })
    .where(eq(tables.matchup.id, currentMatchup.id));

  // Update roster-to-matchup to set winner
  await db
    .update(tables.rosterToMatchup)
    .set({
      isWinner: true,
    } as Partial<InferInsertModel<typeof tables.rosterToMatchup>>)
    .where(
      and(
        eq(tables.rosterToMatchup.matchupId, currentMatchup.id),
        eq(tables.rosterToMatchup.rosterId, winningRoster.rosterId),
      ),
    );

  // If there's a parent matchup, advance the winner
  if (currentMatchup.parentMatchupId) {
    await db.insert(tables.rosterToMatchup).values({
      matchupId: currentMatchup.parentMatchupId,
      rosterId: winningRoster.rosterId,
      isWinner: false,
    } as InferInsertModel<typeof tables.rosterToMatchup>);
  }
}
