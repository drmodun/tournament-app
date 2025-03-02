import * as schema from '../../db/schema';
import { eq, and, desc, sql, isNull, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { CronJob } from 'cron';
import { db } from 'src/db/db';

// Extracted reusable seeding function to remove duplication
async function sortTeamsByElo(rosters, isSeeded = false) {
  if (!isSeeded) return rosters;

  // Get all rosters with their average ELO scores
  const rostersWithElo = await Promise.all(
    rosters.map(async (roster) => {
      const players = await db
        .select()
        .from(schema.userToRoster)
        .where(eq(schema.userToRoster.rosterId, roster.id));

      const playerElos = await Promise.all(
        players.map(async (player) => {
          const participation = await db
            .select()
            .from(schema.participation)
            .where(eq(schema.participation.id, roster.participationId))
            .limit(1);

          if (!participation.length) return 1000; // Default ELO

          const tournament = await db
            .select()
            .from(schema.tournament)
            .where(eq(schema.tournament.id, participation[0].tournamentId))
            .limit(1);

          if (!tournament.length) return 1000;

          const career = await db
            .select()
            .from(schema.categoryCareer)
            .where(
              and(
                eq(schema.categoryCareer.userId, player.userId),
                eq(schema.categoryCareer.categoryId, tournament[0].categoryId),
              ),
            )
            .limit(1);

          return career.length ? career[0].elo : 1000;
        }),
      );

      const avgElo =
        playerElos.reduce((sum, elo) => sum + elo, 0) / playerElos.length;
      return { roster, avgElo };
    }),
  );

  // Sort by average ELO (highest to lowest)
  return rostersWithElo
    .sort((a, b) => b.avgElo - a.avgElo)
    .map((r) => r.roster);
}

// Improved group stage generation with proper scheduling and handling of uneven teams
async function generateGroupStageMatchups(
  stage,
  shuffle = false,
  isSeeded = false,
) {
  // Retrieve all rosters for this stage
  const rosters = await db
    .select()
    .from(schema.roster)
    .where(eq(schema.roster.stageId, stage.id));

  // Sort the teams by ELO if seeded is enabled
  const sortedRosters = await sortTeamsByElo(rosters, isSeeded);

  // Calculate optimal group size based on total participants
  const totalTeams = sortedRosters.length;
  const optimalGroupSize = calculateOptimalGroupSize(totalTeams);

  // Divide teams into groups - handling uneven distribution
  const groups = [];
  let remainingTeams = [...sortedRosters];

  // Distribute teams using snake seeding when seeded
  if (isSeeded) {
    // Create empty groups
    const numberOfGroups = Math.ceil(totalTeams / optimalGroupSize);
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push([]);
    }

    // Snake seeding: 1,2,3,4,4,3,2,1,...
    let groupIndex = 0;
    let direction = 1;

    while (remainingTeams.length > 0) {
      groups[groupIndex].push(remainingTeams.shift());

      groupIndex += direction;

      if (groupIndex >= groups.length - 1) {
        direction = -1;
      } else if (groupIndex <= 0) {
        direction = 1;
      }
    }
  } else {
    // Random distribution
    if (shuffle) {
      remainingTeams = shuffleArray(remainingTeams);
    }

    while (remainingTeams.length > 0) {
      const groupSize = Math.min(optimalGroupSize, remainingTeams.length);
      groups.push(remainingTeams.splice(0, groupSize));
    }
  }

  return db.transaction(async (tx) => {
    // For each group, generate round-robin matchups
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];

      // Create a round for this group
      const round = await tx
        .insert(schema.stageRound)
        .values({
          stageId: stage.id,
          roundNumber: groupIndex + 1,
        } as InferInsertModel<typeof schema.stageRound>)
        .returning()
        .then((rows) => rows[0]);

      // Add all rosters to this round
      const rosterRounds = group.map((roster) => ({
        rosterId: roster.id,
        roundId: round.id,
      }));

      await tx.insert(schema.rosterToRound).values(rosterRounds);

      // Generate matchups for this group using round-robin tournament
      const matchupBatch = [];
      const rosterMatchupBatch = [];
      const scoreBatch = [];

      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          // Calculate a staggered start time for each matchup
          const matchupOffset = (i * group.length + j) * 2; // 2 hours between matches
          const matchupStartDate = new Date(stage.startDate);
          matchupStartDate.setHours(
            matchupStartDate.getHours() + matchupOffset,
          );

          const matchup = await tx
            .insert(schema.matchup)
            .values({
              stageId: stage.id,
              startDate: matchupStartDate,
              endDate: null, // Will be set when the match is finished
              isFinished: false,
              matchupType: 'standard',
              roundId: round.id,
            } as InferInsertModel<typeof schema.matchup>)
            .returning()
            .then((rows) => rows[0]);

          // Add both rosters to the matchup
          rosterMatchupBatch.push(
            {
              rosterId: group[i].id,
              matchupId: matchup.id,
              isWinner: false,
            },
            {
              rosterId: group[j].id,
              matchupId: matchup.id,
              isWinner: false,
            },
          );

          // Create a score entry for the matchup
          scoreBatch.push({
            matchupId: matchup.id,
            roundNumber: 1,
          });
        }
      }

      // Batch insert all the derived records
      if (rosterMatchupBatch.length > 0) {
        await tx.insert(schema.rosterToMatchup).values(rosterMatchupBatch);
      }

      if (scoreBatch.length > 0) {
        await tx.insert(schema.score).values(scoreBatch);
      }
    }
  });
}

// Helper to calculate optimal group size based on total participants
function calculateOptimalGroupSize(totalTeams) {
  if (totalTeams <= 6) return totalTeams; // Single group for small tournaments
  if (totalTeams <= 12) return Math.ceil(totalTeams / 2); // Two even groups
  if (totalTeams <= 24) return Math.ceil(totalTeams / 4); // Four groups
  return Math.ceil(totalTeams / 8); // Eight groups for very large tournaments
}

// Improved elimination bracket generation with proper seeding and scheduling
async function generateEliminationMatchups(
  stage,
  shuffle = false,
  isSeeded = false,
) {
  // Retrieve all rosters for this stage
  const rosters = await db
    .select()
    .from(schema.roster)
    .where(eq(schema.roster.stageId, stage.id));

  // Sort teams by ELO if seeded
  let teamList = await sortTeamsByElo(rosters, isSeeded);

  if (shuffle && !isSeeded) {
    teamList = shuffleArray(teamList);
  }

  // Calculate bracket size (next power of 2)
  const bracketSize = nextPowerOf2(teamList.length);
  const byeCount = bracketSize - teamList.length;

  // Create a bracket with optimal seeding (1 vs lowest seed, etc.)
  const bracket = createOptimalSeeding(teamList.length, bracketSize);

  return db.transaction(async (tx) => {
    // Create first round matchups
    const matchups = [];
    const rosterMatchups = [];
    const scoreEntries = [];
    const parentChildRelationships = [];

    // Track created matchups for parent-child relationships
    const roundMatchups = [];

    // Number of rounds in the bracket
    const roundCount = Math.log2(bracketSize);

    // Create matches for each round (bottom-up approach)
    for (let round = roundCount; round >= 1; round--) {
      const matchesInRound = Math.pow(2, round - 1);
      const roundMatchupList = [];

      for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
        // Calculate a staggered start time based on the round and match number
        const baseOffset = (roundCount - round) * 24; // Each round is 1 day apart
        const matchupOffset = matchIndex * 3; // 3 hours between matches in the same round
        const matchupStartDate = new Date(stage.startDate);
        matchupStartDate.setHours(
          matchupStartDate.getHours() + baseOffset + matchupOffset,
        );

        const matchup = {
          stageId: stage.id,
          startDate: matchupStartDate,
          endDate: null,
          isFinished: false,
          matchupType: 'standard',
          roundId: null, // Will create rounds if needed
        };

        const [createdMatchup] = await tx
          .insert(schema.matchup)
          .values(matchup)
          .returning();
        roundMatchupList.push(createdMatchup);

        // Create score entry
        scoreEntries.push({
          matchupId: createdMatchup.id,
          roundNumber: round,
        });

        // For the first round, assign teams or byes
        if (round === 1) {
          const firstTeamIndex = bracket[matchIndex * 2];
          const secondTeamIndex = bracket[matchIndex * 2 + 1];

          // First team (if not a bye)
          if (firstTeamIndex < teamList.length) {
            rosterMatchups.push({
              rosterId: teamList[firstTeamIndex].id,
              matchupId: createdMatchup.id,
              isWinner: false,
            });
          }

          // Second team (if not a bye)
          if (secondTeamIndex < teamList.length) {
            rosterMatchups.push({
              rosterId: teamList[secondTeamIndex].id,
              matchupId: createdMatchup.id,
              isWinner: false,
            });
          }

          // If there's a bye, mark the non-bye team as winner
          if (
            firstTeamIndex >= teamList.length ||
            secondTeamIndex >= teamList.length
          ) {
            const winnerIndex =
              firstTeamIndex < teamList.length
                ? firstTeamIndex
                : secondTeamIndex;
            if (winnerIndex < teamList.length) {
              // Update the winner flag
              rosterMatchups[rosterMatchups.length - 1].isWinner = true;

              // Set match as finished for byes
              await tx
                .update(schema.matchup)
                .set({ isFinished: true } as Partial<
                  InferInsertModel<typeof schema.matchup>
                >)
                .where(eq(schema.matchup.id, createdMatchup.id));
            }
          }
        }
      }

      roundMatchups.unshift(roundMatchupList); // Add to beginning for proper ordering
    }

    // Create parent-child relationships between rounds
    for (let round = 0; round < roundMatchups.length - 1; round++) {
      const currentRound = roundMatchups[round];
      const nextRound = roundMatchups[round + 1];

      for (let i = 0; i < currentRound.length; i += 2) {
        const parentIndex = Math.floor(i / 2);

        // Connect both current matchups to their parent in the next round
        parentChildRelationships.push({
          matchupId: currentRound[i].id,
          parentMatchupId: nextRound[parentIndex].id,
        });

        if (i + 1 < currentRound.length) {
          parentChildRelationships.push({
            matchupId: currentRound[i + 1].id,
            parentMatchupId: nextRound[parentIndex].id,
          });
        }
      }
    }

    // Batch insert all relationships
    if (rosterMatchups.length > 0) {
      await tx.insert(schema.rosterToMatchup).values(rosterMatchups);
    }

    if (scoreEntries.length > 0) {
      await tx.insert(schema.score).values(scoreEntries);
    }

    if (parentChildRelationships.length > 0) {
      await tx
        .insert(schema.matchupToParentMatchup)
        .values(parentChildRelationships);
    }

    // For double elimination, we need to create the losers' bracket as well
    if (stage.stageType === 'double_elimination') {
      // This is a complex feature that would need to be implemented in a future update
      console.log(
        'Double elimination bracket created - losers bracket implementation pending',
      );
    }
  });
}

// Helper function to calculate optimal seedings for a bracket
function createOptimalSeeding(teamCount, bracketSize) {
  const seeds = [];
  for (let i = 0; i < bracketSize; i++) {
    seeds.push(i);
  }

  // Reorder seeds to create optimal matchups (1 vs 16, 8 vs 9, etc.)
  const optimizedSeeds = [];

  function assignSeeds(start, end, seedsLeft) {
    if (seedsLeft === 0) return;
    if (seedsLeft === 1) {
      optimizedSeeds.push(start);
      return;
    }

    const mid = Math.floor(seedsLeft / 2);
    optimizedSeeds.push(start);
    optimizedSeeds.push(end);

    assignSeeds(start + 1, end - 1, seedsLeft - 2);
  }

  assignSeeds(0, bracketSize - 1, bracketSize);
  return optimizedSeeds;
}

// Helper function to find the next power of 2
function nextPowerOf2(n) {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

// Helper function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Improved main generation function with error handling
async function generateMatchupsForStage(
  stage: InferSelectModel<typeof schema.stage>,
  options: { shuffle?: boolean; seeded?: boolean } = {},
) {
  try {
    // Make it only run once
    const nextMatchups = await db
      .select()
      .from(schema.matchup)
      .where(eq(schema.matchup.stageId, stage.id));

    if (nextMatchups.length > 0) {
      console.log('Matchups already generated for stage', stage.id);
      return;
    }

    console.log(
      `Generating matchups for stage ${stage.id} of type ${stage.stageType}`,
    );

    if (stage.stageType === 'group') {
      await generateGroupStageMatchups(
        stage,
        !!options.shuffle,
        !!options.seeded,
      );
    } else if (
      stage.stageType === 'single_elimination' ||
      stage.stageType === 'double_elimination'
    ) {
      await generateEliminationMatchups(
        stage,
        !!options.shuffle,
        !!options.seeded,
      );
    } else {
      console.warn(`Unsupported stage type: ${stage.stageType}`);
    }

    console.log(`Successfully generated matchups for stage ${stage.id}`);
  } catch (error) {
    console.error(`Error generating matchups for stage ${stage.id}:`, error);
    // Depending on your error handling strategy, you might want to rethrow or handle differently
    throw error;
  }
}

// Optimized cron job implementation - consolidated into a single job with better timing
const scheduledJobs = new Map();

function scheduleMatchupGeneration() {
  // If we already have a job running, don't start another one
  if (scheduledJobs.has('matchupGeneration')) {
    return;
  }

  // Run once every minute instead of every 5 seconds
  const job = new CronJob('0 * * * * *', async () => {
    try {
      // Process upcoming stages that need matchups generated
      const currentDate = new Date();

      // Find stages with imminent start dates and no matchups yet
      const upcomingStages = await db
        .select()
        .from(schema.stage)
        .where(
          and(
            sql`${schema.stage.startDate} <= (NOW() + INTERVAL '1 day')`,
            sql`NOT EXISTS (
              SELECT 1 FROM ${schema.matchup}
              WHERE ${schema.matchup.stageId} = ${schema.stage.id}
            )`,
          ),
        )
        .orderBy(schema.stage.startDate);

      // Process any stages needing matchups
      for (const stage of upcomingStages) {
        await generateMatchupsForStage(stage, {
          shuffle: true,
          seeded: true, // Default to seeded brackets for fair competition
        });
      }

      // Also check for next stages that need to be populated when previous stages complete
      const completedStages = await db
        .select()
        .from(schema.stage)
        .where(
          and(
            eq(schema.stage.stageStatus, 'completed'),
            sql`EXISTS (
              SELECT 1 FROM ${schema.stage} nextStage
              WHERE nextStage.tournament_id = ${schema.stage.tournamentId}
              AND nextStage.start_date > ${schema.stage.endDate}
              AND NOT EXISTS (
                SELECT 1 FROM ${schema.matchup}
                WHERE ${schema.matchup.stageId} = nextStage.id
              )
            )`,
          ),
        );

      for (const completedStage of completedStages) {
        // Find the next stage in the tournament
        const nextStages = await db
          .select()
          .from(schema.stage)
          .where(
            and(
              eq(schema.stage.tournamentId, completedStage.tournamentId),
              sql`${schema.stage.startDate} > ${completedStage.endDate}`,
            ),
          )
          .orderBy(schema.stage.startDate)
          .limit(1);

        if (nextStages.length > 0) {
          await generateMatchupsForStage(nextStages[0], {
            shuffle: false, // Don't shuffle for progression stages
            seeded: true, // Use seeding for fair matchups
          });
        }
      }
    } catch (error) {
      console.error('Error in matchup generation cron job:', error);
    }
  });

  job.start();
  scheduledJobs.set('matchupGeneration', job);
  console.log('Scheduled matchup generation job');
}

// Exports
export { generateMatchupsForStage, scheduleMatchupGeneration };
