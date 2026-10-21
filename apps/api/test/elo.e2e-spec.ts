import { INestApplication } from '@nestjs/common';
import { stageTypeEnum } from '@tournament-app/types';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { tournamentTeamTypeEnum } from '@tournament-app/types';
import request from 'supertest';
import { CareerDrizzleRepository } from '../src/career/career.repository';
import { db } from '../src/db/db';
import { categoryCareer, ratingChange } from '../src/db/schema';
import {
  createApp,
  Decision,
  loginAs,
  RunMatchup,
  TournamentRun,
  userPool,
} from './helpers/tournamentRun';

// A second, independent implementation of the rating rules in docs/features/careers.md
const expected = (player: number, opponent: number) =>
  1 / (1 + 10 ** ((opponent - player) / 400));
const kFactor = (matches: number) =>
  matches < 10 ? 50 : matches < 20 ? 32 : 20;
const rate = (
  player: number,
  opponent: number,
  score: number,
  matches: number,
) =>
  Math.max(
    0,
    Math.round(
      player + kFactor(matches) * (score - expected(player, opponent)),
    ),
  );

// The first player of the team a result belongs to: team A is group 1, team B anything else
const userIdOfTeam = (
  matchup: RunMatchup,
  index: number,
  teams: [number[], number[]],
) =>
  matchup.results[index].roster?.participation?.group?.id === 1
    ? teams[0][0]
    : teams[1][0];

const userIdOf = (matchup: RunMatchup, index: number) =>
  matchup.results[index].roster!.participation!.user!.id;

// Ratings and match counts of a model, updated one finished 1v1 match at a time
class RatingModel {
  elo = new Map<number, number>();
  matches = new Map<number, number>();

  rating(user: number) {
    return this.elo.get(user) ?? 1000;
  }

  /** `winner` is a user id, or null for a draw. */
  play(a: number, b: number, winner: number | null) {
    const [ra, rb] = [this.rating(a), this.rating(b)];
    const score = (user: number) =>
      winner === null ? 0.5 : winner === user ? 1 : 0;

    this.elo.set(a, rate(ra, rb, score(a), this.matches.get(a) ?? 0));
    this.elo.set(b, rate(rb, ra, score(b), this.matches.get(b) ?? 0));
    this.matches.set(a, (this.matches.get(a) ?? 0) + 1);
    this.matches.set(b, (this.matches.get(b) ?? 0) + 1);
  }
}

describe('Ratings (e2e)', () => {
  let app: INestApplication;
  let run: TournamentRun;
  let outsiderToken: string;

  beforeAll(async () => {
    app = await createApp();
    run = new TournamentRun(app, await loginAs(app, 1));
    outsiderToken = await loginAs(app, 20);
  });

  afterAll(async () => {
    await app.close();
  });

  // A category nobody has a rating in, so every test starts from 1000
  async function newCategory() {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${run.token}`)
      .send({
        name: `Ratings ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: 'Created by the ratings e2e suite',
        logo: 'https://example.com/logo.png',
        type: 'other',
      })
      .expect(201);

    return created.body.id as number;
  }

  async function elo(userId: number, categoryId: number) {
    const [row] = await db
      .select({ elo: categoryCareer.elo })
      .from(categoryCareer)
      .where(
        and(
          eq(categoryCareer.userId, userId),
          eq(categoryCareer.categoryId, categoryId),
        ),
      );

    return row?.elo;
  }

  const changesOf = (matchupId: number) =>
    db
      .select({ userId: ratingChange.userId, delta: ratingChange.delta })
      .from(ratingChange)
      .where(eq(ratingChange.matchupId, matchupId))
      .orderBy(asc(ratingChange.userId));

  async function startStage(
    users: number[],
    categoryId: number,
    options: { isRanked?: boolean; stageType?: stageTypeEnum } = {},
  ) {
    const tournamentId = await run.createTournament(users, 'Rated run', {
      categoryId,
      isRanked: options.isRanked ?? true,
    });
    const stageId = await run.createStage(
      tournamentId,
      options.stageType ?? stageTypeEnum.KNOCKOUT,
    );
    await run.startStage(stageId).expect(200);

    return { tournamentId, stageId };
  }

  /** Decides by user: the user in `order` that comes first wins. */
  const prefer = (order: number[]) => (matchup: RunMatchup) => {
    const users = matchup.results.map((_, i) => userIdOf(matchup, i));
    const winner = [...order].find((user) => users.includes(user))!;

    return matchup.results[users.indexOf(winner)].id as Decision;
  };

  describe('a ranked match between new players', () => {
    it('gives them careers: +25 and -25 with the first-match K-factor of 50', async () => {
      const category = await newCategory();
      const [a, b] = userPool(2);
      const { stageId } = await startStage([a, b], category);

      expect(await elo(a, category)).toBeUndefined();

      const [matchup] = await run.matchups(stageId);
      await run.play(stageId, prefer([a, b]));

      expect(await elo(a, category)).toBe(1025);
      expect(await elo(b, category)).toBe(975);
      expect(await changesOf(matchup.id)).toEqual(
        [
          { userId: a, delta: 25 },
          { userId: b, delta: -25 },
        ].sort((x, y) => x.userId - y.userId),
      );
    });

    it('leaves equal players unchanged in a draw, and moves unequal players toward each other', async () => {
      const category = await newCategory();
      const [a, b, c] = userPool(3);

      // a beats b, so a is 1025 and b 975
      const first = await startStage([a, b], category);
      await run.play(first.stageId, prefer([a, b]));

      // c is new (1000) and draws with a (1025): a drops a little, c gains a little
      const second = await startStage([a, c], category);
      await run.play(second.stageId, () => 'draw');

      const model = new RatingModel();
      model.play(a, b, a);
      model.play(a, c, null);

      expect(await elo(a, category)).toBe(model.rating(a));
      expect(await elo(c, category)).toBe(model.rating(c));
      expect(model.rating(a)).toBeLessThan(1025);
      expect(model.rating(c)).toBeGreaterThan(1000);

      // Two new players drawing do not move at all
      const d = userPool(2, 5);
      const equal = await startStage(d, category);
      await run.play(equal.stageId, () => 'draw');

      expect(await elo(d[0], category)).toBe(1000);
      expect(await elo(d[1], category)).toBe(1000);
    });

    it('rewards an upset more than an expected win', async () => {
      const category = await newCategory();
      const [strong, weak, other] = userPool(3, 8);

      // strong beats weak twice: strong rises well above weak
      for (let i = 0; i < 2; i++) {
        const { stageId } = await startStage([strong, weak], category);
        await run.play(stageId, prefer([strong, weak]));
      }

      const before = {
        strong: (await elo(strong, category))!,
        weak: (await elo(weak, category))!,
      };

      expect(before.strong - before.weak).toBeGreaterThan(50);

      // Weak now beats strong
      const upset = await startStage([strong, weak], category);
      const [matchup] = await run.matchups(upset.stageId);
      await run.play(upset.stageId, prefer([weak, strong]));

      const changes = await changesOf(matchup.id);
      const gain = changes.find((c) => c.userId === weak)!.delta;

      // An even match at K=50 is worth 25; beating a higher-rated player is worth more
      expect(gain).toBeGreaterThan(25);
      expect(changes.find((c) => c.userId === strong)!.delta).toBe(-gain);

      // Neither of them gets another player's rating
      expect(await elo(other, category)).toBeUndefined();
    });
  });

  describe('unranked tournaments', () => {
    it('never create careers or rating changes', async () => {
      const category = await newCategory();
      const [a, b] = userPool(2, 12);
      const { stageId } = await startStage([a, b], category, {
        isRanked: false,
      });
      const [matchup] = await run.matchups(stageId);

      await run.play(stageId, prefer([a, b]));

      expect(await elo(a, category)).toBeUndefined();
      expect(await elo(b, category)).toBeUndefined();
      expect(await changesOf(matchup.id)).toEqual([]);
    });
  });

  describe('a ranked knockout', () => {
    it('rates every match in order, byes aside, the way the formula says', async () => {
      const category = await newCategory();
      const users = userPool(8, 3);
      const { stageId } = await startStage(users, category);
      const model = new RatingModel();

      // Play match by match, mirroring each one in the model
      let all = await run.matchups(stageId);

      for (let guard = 0; guard < 20; guard++) {
        const open = all
          .filter((m) => !m.isFinished && m.results.length === 2)
          .sort((x, y) => x.id - y.id);

        if (!open.length) break;

        for (const matchup of open) {
          const [a, b] = [userIdOf(matchup, 0), userIdOf(matchup, 1)];
          const winner = users.indexOf(a) < users.indexOf(b) ? a : b;

          await run
            .score(matchup, matchup.results[winner === a ? 0 : 1].id)
            .expect(201);
          model.play(a, b, winner);
        }

        all = await run.matchups(stageId);
      }

      for (const user of users) {
        expect(await elo(user, category)).toBe(model.rating(user));
      }

      // Seven matches, each recording a change per player that sums to zero within rounding
      const matchIds = all
        .filter((m) => m.results.length === 2)
        .map((m) => m.id);
      const rows = await db
        .select({
          matchupId: ratingChange.matchupId,
          delta: ratingChange.delta,
        })
        .from(ratingChange)
        .where(inArray(ratingChange.matchupId, matchIds));

      expect(matchIds).toHaveLength(7);
      expect(rows).toHaveLength(14);
      expect(new Set(rows.map((r) => r.matchupId)).size).toBe(7);
    });

    it('does not rate byes', async () => {
      const category = await newCategory();
      const users = userPool(5, 3);
      const { stageId } = await startStage(users, category);
      const drawn = await run.matchups(stageId);
      const byes = drawn.filter((m) => m.results.length === 1);

      expect(byes.length).toBeGreaterThan(0);

      for (const bye of byes) {
        expect(await changesOf(bye.id)).toEqual([]);
        expect(await elo(userIdOf(bye, 0), category)).toBeUndefined();
      }
    });

    it('counts only matches against an opponent toward the K-factor', async () => {
      const category = await newCategory();
      const users = userPool(3, 3);
      const { stageId } = await startStage(users, category);

      await run.play(stageId, prefer(users));

      // 3 players: the top seed gets a bye in round 1 and plays only the final
      const matchups = await run.matchups(stageId);
      const careerRepository = app.get(CareerDrizzleRepository);
      const counts = new Map(
        (await careerRepository.getFinishedMatchCounts(users, category)).map(
          (c) => [c.userId, Number(c.matches)],
        ),
      );
      const real = (user: number) =>
        matchups.filter(
          (m) =>
            m.results.length === 2 &&
            m.isFinished &&
            m.results.some((_, i) => userIdOf(m, i) === user),
        ).length;

      for (const user of users) {
        expect(counts.get(user)).toBe(real(user));
      }
    });
  });

  describe('K-factor', () => {
    it('drops from 50 to 32 after 10 matches and to 20 after 20', async () => {
      const category = await newCategory();
      const [a, b] = userPool(2, 18);
      const model = new RatingModel();

      for (let match = 0; match < 22; match++) {
        // a wins most matches, b every fifth, so ratings keep moving
        const winner = match % 5 === 4 ? b : a;
        const { stageId } = await startStage([a, b], category);

        await run.play(stageId, prefer([winner, winner === a ? b : a]));
        model.play(a, b, winner);

        expect(await elo(a, category)).toBe(model.rating(a));
        expect(await elo(b, category)).toBe(model.rating(b));
      }

      expect(kFactor(9)).toBe(50);
      expect(kFactor(10)).toBe(32);
      expect(kFactor(20)).toBe(20);
    });
  });

  describe('corrections', () => {
    // A 4-player knockout: the first match can change until the second round is drawn
    async function firstMatch(category: number) {
      const { stageId } = await startStage(userPool(4, 6), category);
      const matchup = (await run.matchups(stageId)).sort(
        (x, y) => x.id - y.id,
      )[0];

      return {
        matchup,
        a: userIdOf(matchup, 0),
        b: userIdOf(matchup, 1),
      };
    }

    it('re-rates a corrected result as if it had been entered that way', async () => {
      const category = await newCategory();
      const { matchup, a, b } = await firstMatch(category);

      await run.score(matchup, matchup.results[0].id).expect(201);
      expect(await elo(a, category)).toBe(1025);
      expect(await elo(b, category)).toBe(975);

      // The other player actually won
      await run.updateScore(matchup, matchup.results[1].id).expect(200);

      expect(await elo(a, category)).toBe(975);
      expect(await elo(b, category)).toBe(1025);
      // Exactly one set of changes is kept
      expect(await changesOf(matchup.id)).toHaveLength(2);
    });

    it('turns a corrected win into a draw', async () => {
      const category = await newCategory();
      const { matchup, a, b } = await firstMatch(category);

      await run.score(matchup, matchup.results[0].id).expect(201);
      await run.updateScore(matchup, 'draw').expect(200);

      expect(await elo(a, category)).toBe(1000);
      expect(await elo(b, category)).toBe(1000);
    });

    it('undoes the ratings when a result is deleted', async () => {
      const category = await newCategory();
      const { matchup, a, b } = await firstMatch(category);

      await run.score(matchup, matchup.results[0].id).expect(201);
      expect(await changesOf(matchup.id)).toHaveLength(2);

      await run.deleteScore(matchup).expect(200);

      expect(await elo(a, category)).toBe(1000);
      expect(await elo(b, category)).toBe(1000);
      expect(await changesOf(matchup.id)).toEqual([]);

      // And entering it again rates it once
      await run.score(matchup, matchup.results[1].id).expect(201);
      expect(await changesOf(matchup.id)).toHaveLength(2);
    });

    it('keeps a round robin result correctable without double counting', async () => {
      const category = await newCategory();
      const users = userPool(3, 6);
      const { stageId } = await startStage(users, category, {
        stageType: stageTypeEnum.ROUND_ROBIN,
      });
      const drawn = await run.matchups(stageId);
      const first = drawn[0];
      const [a, b] = [userIdOf(first, 0), userIdOf(first, 1)];

      await run.score(first, first.results[0].id).expect(201);
      await run.updateScore(first, first.results[1].id).expect(200);
      await run.updateScore(first, first.results[0].id).expect(200);

      const model = new RatingModel();
      model.play(a, b, a);

      expect(await elo(a, category)).toBe(model.rating(a));
      expect(await elo(b, category)).toBe(model.rating(b));
      expect(await changesOf(first.id)).toHaveLength(2);
    });

    it('refuses corrections that would change ratings of a finished stage', async () => {
      const category = await newCategory();
      const [a, b] = userPool(2, 6);
      const { stageId } = await startStage([a, b], category);
      const [matchup] = await run.matchups(stageId);

      await run.score(matchup, matchup.results[0].id).expect(201);
      const before = await elo(a, category);

      await run.updateScore(matchup, matchup.results[1].id).expect(400);
      await run.deleteScore(matchup).expect(400);

      expect(await elo(a, category)).toBe(before);
    });
  });

  describe('categories and seeding', () => {
    it('keeps ratings separate per category', async () => {
      const first = await newCategory();
      const second = await newCategory();
      const [a, b] = userPool(2, 14);

      const inFirst = await startStage([a, b], first);
      await run.play(inFirst.stageId, prefer([a, b]));

      expect(await elo(a, first)).toBe(1025);
      expect(await elo(a, second)).toBeUndefined();

      // In the other category they start from 1000 again
      const inSecond = await startStage([a, b], second);
      await run.play(inSecond.stageId, prefer([b, a]));

      expect(await elo(a, second)).toBe(975);
      expect(await elo(a, first)).toBe(1025);
    });

    it('seeds the next tournament in the category by rating', async () => {
      const category = await newCategory();
      const users = userPool(4, 10);
      const [top, second, third, bottom] = users;

      // Results over a few tournaments order the ratings: top > second > third > bottom
      for (const pair of [
        [top, bottom],
        [second, bottom],
        [third, bottom],
        [top, third],
        [second, third],
        [top, second],
      ]) {
        const { stageId } = await startStage(pair, category);
        await run.play(stageId, prefer(users));
      }

      const ratings = await Promise.all(users.map((u) => elo(u, category)));

      expect(ratings[0]!).toBeGreaterThan(ratings[1]!);
      expect(ratings[1]!).toBeGreaterThan(ratings[2]!);
      expect(ratings[2]!).toBeGreaterThan(ratings[3]!);

      // Entered in reverse order of strength: the draw still pairs the best with the weakest
      const { stageId } = await startStage([...users].reverse(), category);
      const round1 = await run.matchups(stageId);
      const pairs = round1.map((m) =>
        [userIdOf(m, 0), userIdOf(m, 1)].sort((x, y) => x - y),
      );

      expect(pairs).toContainEqual([top, bottom].sort((x, y) => x - y));
      expect(pairs).toContainEqual([second, third].sort((x, y) => x - y));
    });

    it('lets only organisers enter results that change ratings', async () => {
      const category = await newCategory();
      const [a, b] = userPool(2, 6);
      const { stageId } = await startStage([a, b], category);
      const [matchup] = await run.matchups(stageId);

      await run
        .score(matchup, matchup.results[0].id, outsiderToken)
        .expect(403);

      expect(await elo(a, category)).toBeUndefined();
      expect(await changesOf(matchup.id)).toEqual([]);
    });
  });

  // A fake player, the way organisers make them; their ids differ between databases
  async function createFakePlayer() {
    const created = await request(app.getHttpServer())
      .post('/users/fake')
      .set('Authorization', `Bearer ${run.token}`)
      .send({
        name: 'Fake Player',
        username: `fake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        password: 'Password123!',
        country: 'US',
      })
      .expect(201);

    return created.body.id as number;
  }

  // Sets a rating directly, to start a test from a known state
  async function setElo(userId: number, categoryId: number, value: number) {
    await db
      .insert(categoryCareer)
      .values({ userId, categoryId, elo: value })
      .onConflictDoUpdate({
        target: [categoryCareer.categoryId, categoryCareer.userId],
        set: { elo: value },
      });
  }

  describe('team matchups', () => {
    // Two teams from seeded groups, each with its own line-up, in a team tournament
    async function startTeamStage(
      lineups: { groupId: number; players: number[] }[],
      category: number,
      isRanked = true,
    ) {
      const tournamentId = await run.createTournament([], 'Team run', {
        categoryId: category,
        isRanked,
        tournamentTeamType: tournamentTeamTypeEnum.TEAM,
      });
      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
      );

      for (const { groupId } of lineups) {
        await run.enterGroup(tournamentId, groupId).expect(201);
      }

      const participations = (await run.participations(tournamentId))
        .results as {
        id: number;
        groupId: number;
      }[];

      for (const { groupId, players } of lineups) {
        const participation = participations.find(
          (p) => p.groupId === groupId,
        )!;

        await run.createRoster(participation.id, stageId, players).expect(201);
      }

      await run.startStage(stageId).expect(200);

      return { tournamentId, stageId };
    }

    // Everybody's rating after a match, per the model: each player against the other team's average
    function teamMatch(
      model: Map<number, number>,
      teams: [number[], number[]],
      winner: 0 | 1 | null,
    ) {
      const average = (team: number[]) =>
        team.reduce((sum, user) => sum + (model.get(user) ?? 1000), 0) /
        team.length;
      const updated = new Map(model);

      teams.forEach((team, index) => {
        const score = winner === null ? 0.5 : winner === index ? 1 : 0;

        for (const user of team) {
          updated.set(
            user,
            rate(model.get(user) ?? 1000, average(teams[1 - index]), score, 0),
          );
        }
      });

      return updated;
    }

    it('rates each player against the average of the opposing team', async () => {
      const category = await newCategory();
      const teams: [number[], number[]] = [
        [7, 12],
        [8, 9],
      ];

      // Team A averages 1100, team B 1000
      await setElo(7, category, 1200);
      await setElo(12, category, 1000);
      await setElo(8, category, 1000);
      await setElo(9, category, 1000);

      const { stageId } = await startTeamStage(
        [
          { groupId: 1, players: teams[0] },
          { groupId: 2, players: teams[1] },
        ],
        category,
      );
      const [matchup] = await run.matchups(stageId);

      expect(matchup.results).toHaveLength(2);

      const teamOf = (user: number) => (teams[0].includes(user) ? 0 : 1);
      // Team B (the underdog) wins
      const underdog = matchup.results.find(
        (_, i) => teamOf(userIdOfTeam(matchup, i, teams)) === 1,
      )!;

      await run.score(matchup, underdog.id).expect(201);

      const model = teamMatch(
        new Map([
          [7, 1200],
          [12, 1000],
          [8, 1000],
          [9, 1000],
        ]),
        teams,
        1,
      );

      for (const user of [7, 12, 8, 9]) {
        expect(await elo(user, category)).toBe(model.get(user));
      }

      // Teammates with different ratings move by different amounts, even in the same result
      expect(model.get(7)).not.toBe(model.get(12)! + 200);
      expect(await changesOf(matchup.id)).toHaveLength(4);
    });

    it('moves every player of a team by the same rule in a draw', async () => {
      const category = await newCategory();
      const teams: [number[], number[]] = [
        [7, 12],
        [8, 9],
      ];

      await setElo(7, category, 1300);
      await setElo(12, category, 1100);

      const { stageId } = await startTeamStage(
        [
          { groupId: 1, players: teams[0] },
          { groupId: 2, players: teams[1] },
        ],
        category,
      );
      const [matchup] = await run.matchups(stageId);

      await run.score(matchup, 'draw').expect(201);

      const model = teamMatch(
        new Map([
          [7, 1300],
          [12, 1100],
        ]),
        teams,
        null,
      );

      for (const user of [7, 12, 8, 9]) {
        expect(await elo(user, category)).toBe(model.get(user));
      }

      // The stronger team loses rating and the weaker one gains it
      expect(model.get(7)!).toBeLessThan(1300);
      expect(model.get(8)!).toBeGreaterThan(1000);
    });

    it('leaves a fake player out and rates the real ones against the real average', async () => {
      const category = await newCategory();
      const fakePlayer = await createFakePlayer();
      const teams: [number[], number[]] = [
        [7, fakePlayer],
        [8, 9],
      ];

      await setElo(7, category, 1100);

      const tournamentId = await run.createTournament([], 'Fake player run', {
        categoryId: category,
        isRanked: true,
        tournamentTeamType: tournamentTeamTypeEnum.TEAM,
      });
      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
      );
      await run.enterGroup(tournamentId, 1).expect(201);
      await run.enterGroup(tournamentId, 2).expect(201);

      const participations = (await run.participations(tournamentId))
        .results as {
        id: number;
        groupId: number;
      }[];
      await run
        .createRoster(
          participations.find((p) => p.groupId === 1)!.id,
          stageId,
          teams[0],
        )
        .expect(201);
      await run
        .createRoster(
          participations.find((p) => p.groupId === 2)!.id,
          stageId,
          teams[1],
        )
        .expect(201);
      await run.startStage(stageId).expect(200);

      const [matchup] = await run.matchups(stageId);
      const realWinner = matchup.results.find((_, i) =>
        teams[1].includes(userIdOfTeam(matchup, i, teams) as number),
      )!;

      await run.score(matchup, realWinner.id).expect(201);

      expect(await elo(fakePlayer, category)).toBeUndefined();

      // Team A's average is only player 7's rating, 1100
      expect(await elo(7, category)).toBe(rate(1100, 1000, 0, 0));
      expect(await elo(8, category)).toBe(rate(1000, 1100, 1, 0));
      expect(await elo(9, category)).toBe(rate(1000, 1100, 1, 0));
    });

    it('does not let fake players into a ranked tournament', async () => {
      const category = await newCategory();
      const tournamentId = await run.createTournament([], 'Ranked, no fakes', {
        categoryId: category,
        isRanked: true,
        isFakePlayersAllowed: true,
      });

      await run.enter(tournamentId, await createFakePlayer()).expect(403);
    });

    it('lets fake players into an unranked tournament that allows them, without rating anyone', async () => {
      const category = await newCategory();
      const tournamentId = await run.createTournament(
        [],
        'Unranked with fakes',
        {
          categoryId: category,
          isRanked: false,
          isFakePlayersAllowed: true,
        },
      );
      const fakePlayer = await createFakePlayer();
      await run.enter(tournamentId, fakePlayer).expect(201);
      await run.enter(tournamentId, 10).expect(201);

      const stageId = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
      );
      await run.startStage(stageId).expect(200);
      await run.play(stageId, (m) => m.results[0].id);

      expect(await elo(fakePlayer, category)).toBeUndefined();
      expect(await elo(10, category)).toBeUndefined();
    });
  });

  describe('the rating floor', () => {
    async function firstMatch(category: number, players: number[]) {
      const { stageId } = await startStage(players, category);
      const matchup = (await run.matchups(stageId)).sort(
        (x, y) => x.id - y.id,
      )[0];

      return {
        matchup,
        a: userIdOf(matchup, 0),
        b: userIdOf(matchup, 1),
      };
    }

    it('never takes a rating below 0', async () => {
      const category = await newCategory();
      const players = userPool(4, 3);
      const { stageId } = await startStage(players, category);
      const matchup = (await run.matchups(stageId)).sort(
        (x, y) => x.id - y.id,
      )[0];
      const [winner, loser] = [userIdOf(matchup, 0), userIdOf(matchup, 1)];

      await setElo(winner, category, 10);
      await setElo(loser, category, 10);

      await run.score(matchup, matchup.results[0].id).expect(201);

      // An even match at K=50 would take 25 points off 10
      expect(await elo(loser, category)).toBe(0);
      expect(await elo(winner, category)).toBe(35);

      const changes = await changesOf(matchup.id);

      // The change recorded is what actually happened: -10, not -k
      expect(changes.find((c) => c.userId === loser)!.delta).toBe(-10);
    });

    it('gives back exactly what was taken when the result is deleted', async () => {
      const category = await newCategory();
      const { matchup, a, b } = await firstMatch(category, userPool(4, 3));

      await setElo(a, category, 10);
      await setElo(b, category, 10);

      await run.score(matchup, matchup.results[0].id).expect(201);
      expect(await elo(b, category)).toBe(0);

      await run.deleteScore(matchup).expect(200);

      expect(await elo(b, category)).toBe(10);
      expect(await elo(a, category)).toBe(10);
    });

    it('keeps a player at 0 at 0 when they lose again, and lets them climb back', async () => {
      const category = await newCategory();
      const [a, b] = userPool(2, 3);

      await setElo(a, category, 1000);
      await setElo(b, category, 0);

      const lost = await startStage([a, b], category);
      await run.play(lost.stageId, prefer([a, b]));

      expect(await elo(b, category)).toBe(0);

      const won = await startStage([a, b], category);
      await run.play(won.stageId, prefer([b, a]));

      expect(await elo(b, category)).toBeGreaterThan(0);
    });
  });
});
