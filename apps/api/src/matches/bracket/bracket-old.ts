import { eq, and, isNull, gte, inArray } from 'drizzle-orm'; // Import 'sql'
import { CronJob } from 'cron';
import { InferSelectModel } from 'drizzle-orm';
import * as schema from 'src/db/schema';
import { db } from 'src/db/db';

type Stage = InferSelectModel<typeof schema.stage>;
type Roster = InferSelectModel<typeof schema.roster>;
type Matchup = InferSelectModel<typeof schema.matchup>;
type StageRound = InferSelectModel<typeof schema.stageRound>;
type RosterToMatchup = InferSelectModel<typeof schema.rosterToMatchup>;
// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
async function generateGroupStageMatchups(stage: Stage, shuffle: boolean) {
  if (stage.stageType !== 'group') {
    throw new Error('This function is only for group stages.');
  }

  // 1. Get all rosters participating in this stage.
  let rosters = await db
    .select()
    .from(schema.roster)
    .where(eq(schema.roster.stageId, stage.id));

  // 2. Shuffle rosters if requested.
  if (shuffle) {
    rosters = shuffleArray(rosters);
  }

  const groups: Roster[][] = [];
  const groupSize = 4; // Example: 4 teams per group.  Adjust as necessary.

  for (let i = 0; i < rosters.length; i += groupSize) {
    groups.push(rosters.slice(i, i + groupSize));
  }

  // Create a single round for the group stage.
  const stageRound = await db
    .insert(schema.stageRound)
    .values({
      stageId: stage.id,
      roundNumber: 1,
    } as StageRound)
    .returning();

  //  Generate matchups for each group (round-robin).
  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const matchup = await db
          .insert(schema.matchup)
          .values({
            stageId: stage.id,
            matchupType: 'one_vs_one', // Or 'team_vs_team', etc.
            startDate: stage.startDate, // Or calculate a specific time.
            isFinished: false,
          } as Matchup)
          .returning();

        // Link rosters to the matchup.
        await db.insert(schema.rosterToMatchup).values([
          { rosterId: group[i].id, matchupId: matchup[0].id },
          { rosterId: group[j].id, matchupId: matchup[0].id },
        ]);

        //Create score entity
        await db.insert(schema.score).values([
          {
            matchupId: matchup[0].id,
            roundNumber: stageRound[0].roundNumber,
          },
        ]);
      }
    }
  }
  console.log(`Generated matchups for stage ${stage.id}`);
}

async function generateEliminationMatchups(
  stage: Stage,
  shuffle: boolean,
  seeded: boolean,
) {
  if (
    stage.stageType !== 'single_elimination' &&
    stage.stageType !== 'double_elimination'
  ) {
    throw new Error('This function is only for elimination stages.');
  }

  // 1. Get all rosters participating in this stage.
  let rosters = await db
    .select()
    .from(schema.roster)
    .where(eq(schema.roster.stageId, stage.id));

  //Get tournament to get its category ID
  const tournament = await db
    .select()
    .from(schema.tournament)
    .where(eq(schema.tournament.id, stage.tournamentId))
    .limit(1);

  if (!tournament[0]) {
    throw new Error('Tournament not found for this stage.');
  }

  const categoryId = tournament[0].categoryId;

  // 2. Handle seeding/shuffling.
  if (shuffle) {
    rosters = shuffleArray(rosters);
  } else if (seeded) {
    // Get all users in the rosters.
    const userRosters = await db
      .select()
      .from(schema.userToRoster)
      .where(
        inArray(
          schema.userToRoster.rosterId,
          rosters.map((r) => r.id),
        ),
      );

    // Fetch career data for those users, for the specific category.

    const userCareers = await db
      .select()
      .from(schema.categoryCareer)
      .where(
        and(
          inArray(
            schema.categoryCareer.userId,
            userRosters.map((ur) => ur.userId),
          ),
          eq(schema.categoryCareer.categoryId, categoryId), // Important: Filter by category!
        ),
      );

    // Create a map of userId to Elo.  Default to 1000 if no career found.
    const eloMap = new Map<number, number>();
    for (const userRoster of userRosters) {
      const career = userCareers.find((c) => c.userId === userRoster.userId);
      eloMap.set(userRoster.userId, career ? career.elo : 1000);
    }

    // Calculate average Elo for each roster.
    const rosterElos: { rosterId: number; averageElo: number }[] = [];
    for (const roster of rosters) {
      const userIds = userRosters
        .filter((ur) => ur.rosterId === roster.id)
        .map((ur) => ur.userId);
      let totalElo = 0;
      for (const userId of userIds) {
        totalElo += eloMap.get(userId) || 1000; // Default to 1000 if not found.
      }
      const averageElo = userIds.length > 0 ? totalElo / userIds.length : 1000; // Avoid division by zero
      rosterElos.push({ rosterId: roster.id, averageElo });
    }

    // Sort rosters by average Elo (descending - highest Elo first).
    rosterElos.sort((a, b) => b.averageElo - a.averageElo);

    // Update 'rosters' array to be in the seeded order.
    rosters = rosterElos
      .map((re) => rosters.find((r) => r.id === re.rosterId)!)
      .filter((roster) => !!roster); //The filter makes typescript not complain
  }

  // 3. Calculate the number of rounds and create stageRounds.
  let numTeams = rosters.length;
  let numRounds = Math.ceil(Math.log2(numTeams));
  // 4. Generate matchups round by round.
  // Create the stageRounds.  *This is now much simpler.*
  for (let i = 1; i <= numRounds; i++) {
    await db.insert(schema.stageRound).values({
      stageId: stage.id,
      roundNumber: i,
    } as StageRound);
  }

  // Get all created stage rounds for this stage
  const stageRounds = await db
    .select()
    .from(schema.stageRound)
    .where(eq(schema.stageRound.stageId, stage.id))
    .orderBy(schema.stageRound.roundNumber);

  let currentRound = 0;
  // Store matchups created in the *previous* round.  Key is round number, value is array of matchups.
  const previousRoundMatchups = new Map<number, Matchup[]>();
  let currentRosters: { rosterId: number; matchupId?: number }[] = rosters.map(
    (r) => ({ rosterId: r.id }),
  );

  while (currentRound < stageRounds.length) {
    const nextRoundRosters: { rosterId: number; matchupId?: number }[] = [];
    const roundStartDate = new Date(
      stage.startDate.getTime() + currentRound * 24 * 60 * 60 * 1000,
    );
    const currentRoundMatchups: Matchup[] = []; // Store matchups created in *this* round.

    // Handle byes (if the number of teams isn't a power of 2).
    const numByes = Math.pow(2, numRounds) - numTeams;
    if (currentRound === 0) {
      for (let i = 0; i < numByes; i++) {
        const matchup = await db
          .insert(schema.matchup)
          .values({
            stageId: stage.id,
            matchupType: 'one_vs_one',
            startDate: stage.startDate,
            isFinished: true,
          } as Matchup)
          .returning();
        // NO rosterToMatchup needed for the "bye" placeholder matchup itself.
        nextRoundRosters.push({ rosterId: 0, matchupId: matchup[0].id }); // Bye "roster"
        currentRoundMatchups.push(matchup[0]);
      }
    }

    for (let i = 0; i < currentRosters.length; i += 2) {
      if (i + 1 < currentRosters.length) {
        // Create a matchup.
        const matchup = await db
          .insert(schema.matchup)
          .values({
            stageId: stage.id,
            matchupType: 'one_vs_one',
            startDate: roundStartDate,
            isFinished: false,
          } as Matchup)
          .returning();

        // Link rosters to the matchup.
        await db.insert(schema.rosterToMatchup).values([
          { rosterId: currentRosters[i].rosterId, matchupId: matchup[0].id },
          {
            rosterId: currentRosters[i + 1].rosterId,
            matchupId: matchup[0].id,
          },
        ]);

        await db.insert(schema.score).values({
          matchupId: matchup[0].id,
          roundNumber: stageRounds[currentRound].roundNumber,
        });

        nextRoundRosters.push({
          rosterId: currentRosters[i].rosterId,
          matchupId: matchup[0].id,
        });
        nextRoundRosters.push({
          rosterId: currentRosters[i + 1].rosterId,
          matchupId: matchup[0].id,
        });
        currentRoundMatchups.push(matchup[0]); // Add to the current round's matchups.
      } else if (currentRosters.length % 2 !== 0) {
        // Handle the actual bye (advancing a team).
        const matchup = await db
          .insert(schema.matchup)
          .values({
            stageId: stage.id,
            matchupType: 'one_vs_one',
            startDate: roundStartDate,
            isFinished: true,
          } as Matchup)
          .returning();

        await db.insert(schema.rosterToMatchup).values({
          rosterId: currentRosters[i].rosterId,
          matchupId: matchup[0].id,
          isWinner: true, // Automatically advance the team.
        } as RosterToMatchup);

        await db.insert(schema.score).values({
          matchupId: matchup[0].id,
          roundNumber: stageRounds[currentRound].roundNumber,
        });
        nextRoundRosters.push({
          rosterId: currentRosters[i].rosterId,
          matchupId: matchup[0].id,
        });
        currentRoundMatchups.push(matchup[0]);
      }
    }

    // --- Parent Matchup Logic (Crucial!) ---
    if (previousRoundMatchups.has(currentRound)) {
      // Only if there's a previous round.

      const prevMatchups = previousRoundMatchups.get(currentRound)!;
      for (let i = 0; i < currentRoundMatchups.length; i++) {
        // Each new matchup gets *two* parent matchups (or one for byes).

        if (
          prevMatchups[i * 2].isFinished &&
          prevMatchups[i * 2 + 1].isFinished
        ) {
          //Check if normal matchup
          await db.insert(schema.matchupToParentMatchup).values([
            {
              matchupId: currentRoundMatchups[i].id,
              parentMatchupId: prevMatchups[i * 2].id,
            },
            {
              matchupId: currentRoundMatchups[i].id,
              parentMatchupId: prevMatchups[i * 2 + 1].id,
            },
          ]);
        } else {
          //It is a bye
          await db.insert(schema.matchupToParentMatchup).values([
            {
              matchupId: currentRoundMatchups[i].id,
              parentMatchupId: prevMatchups[i * 2].id,
            },
          ]);
        }
      }
    }

    previousRoundMatchups.set(currentRound + 1, currentRoundMatchups); // Store *this* round's matchups for the next iteration.

    //For seeded brackets, make byes go to strongest teams
    if (seeded && currentRound === 0) {
      //Sort next round rosters by elo, just like it was done for the initial rosters.
      //This is needed in case there are byes
      const userRosters = await db
        .select()
        .from(schema.userToRoster)
        .where(
          inArray(
            schema.userToRoster.rosterId,
            nextRoundRosters
              .filter((r) => r.rosterId !== 0)
              .map((r) => r.rosterId),
          ),
        );

      // Fetch career data for those users, for the specific category.
      const userCareers = await db
        .select()
        .from(schema.categoryCareer)
        .where(
          and(
            inArray(
              schema.categoryCareer.userId,
              userRosters.map((ur) => ur.userId),
            ),
            eq(schema.categoryCareer.categoryId, categoryId),
          ),
        );

      // Create a map of userId to Elo.
      const eloMap = new Map<number, number>();
      for (const userRoster of userRosters) {
        const career = userCareers.find((c) => c.userId === userRoster.userId);
        eloMap.set(userRoster.userId, career ? career.elo : 1000);
      }

      // Calculate average Elo for each roster.
      const rosterElos: { rosterId: number; averageElo: number }[] = [];
      for (const roster of nextRoundRosters) {
        if (roster.rosterId === 0) {
          rosterElos.push({ rosterId: roster.rosterId, averageElo: -Infinity }); //give byes -Infinity so they end up last
          continue;
        }
        const userIds = userRosters
          .filter((ur) => ur.rosterId === roster.rosterId)
          .map((ur) => ur.userId);
        let totalElo = 0;
        for (const userId of userIds) {
          totalElo += eloMap.get(userId) || 1000; //Could not find this error
        }

        const averageElo = userIds.length > 0 ? totalElo / userIds.length : 0;
        rosterElos.push({ rosterId: roster.rosterId, averageElo });
      }

      // Sort rosters by average Elo (descending).
      rosterElos.sort((a, b) => b.averageElo - a.averageElo);
      //Reassign
      currentRosters = rosterElos
        .map((re) => nextRoundRosters.find((r) => r.rosterId === re.rosterId)!)
        .filter((roster) => !!roster); //roster can't be null
    } else {
      currentRosters = nextRoundRosters;
    }
    numTeams = currentRosters.length;
    numRounds = Math.ceil(Math.log2(numTeams));
    currentRound++;
  }
}

async function generateMatchupsForStage(
  stage: Stage,
  options: { shuffle?: boolean; seeded?: boolean } = {},
) {
  //Make it only run once
  const nextMatchups = await db
    .select()
    .from(schema.matchup)
    .where(eq(schema.matchup.stageId, stage.id));
  if (nextMatchups.length > 0) {
    console.log('matchups already generated');
    return;
  }

  if (stage.stageType === 'group') {
    await generateGroupStageMatchups(stage, !!options.shuffle); // Use !! to ensure boolean.
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
}

function scheduleStageMatchupGeneration() {
  const job = new CronJob(
    '*/5 * * * * *',
    async () => {
      // Check every 5 seconds
      console.log('Checking for stages to generate matchups...');

      //Find stages that have finished, so it can generate matches for their tournament next stages.
      const finishedStages = await db
        .select()
        .from(schema.stage)
        .where(and(eq(schema.stage.stageStatus, 'finished')));
      if (finishedStages.length > 0) {
        for (const finishedStage of finishedStages) {
          const nextStages = await db
            .select()
            .from(schema.stage)
            .where(
              and(
                eq(schema.stage.tournamentId, finishedStage.tournamentId),
                gte(schema.stage.startDate, finishedStage.startDate), //Find stages that are equal or after
                eq(schema.stage.stageStatus, 'upcoming'),
              ),
            )
            .orderBy(schema.stage.startDate);

          if (nextStages.length > 0) {
            // Example options (you'd get these from the stage or tournament settings)
            const options = {
              shuffle: false, // Example: Don't shuffle in this case.
              seeded: false, // Example: Don't use seeding.
            };
            await generateMatchupsForStage(nextStages[0], options); //Generate matchups for the next one
          } else {
            console.log('No next stage for this tournament');
          }
        }
      }
    },
    null,
    true,
  );

  const job2 = new CronJob(
    '*/5 * * * * *',
    async () => {
      // Check every 5 seconds
      console.log('Checking for stages to generate matchups...');

      const stagesToGenerate = await db
        .select()
        .from(schema.stage)
        .where(
          and(
            gte(schema.stage.startDate, new Date()),
            eq(schema.stage.stageStatus, 'upcoming'), //check only upcoming stages
            isNull(schema.stage.conversionRuleId), //And stages that have no conversion rules, meaning that they are initial stages
          ),
        );

      if (stagesToGenerate.length > 0) {
        for (const stage of stagesToGenerate) {
          // Example options (you'd get these from the stage or tournament settings)
          const options = {
            shuffle: true, // Example: Shuffle matchups in this stage.
            seeded: false, // Example: But don't use seeding.
          };
          await generateMatchupsForStage(stage, options);
        }
      }
    },
    null,
    true,
  );
  console.log('Matchup generation scheduler started.');
}

// Start the scheduler when your application starts.
scheduleStageMatchupGeneration();

//No changes for updateMatchupStatus and updateStageStatus functions
