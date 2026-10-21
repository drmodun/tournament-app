import { INestApplication } from '@nestjs/common';
import {
  pointConversionStrategyEnum,
  pointConversionTypeEnum,
  stageTypeEnum,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';
import { sql } from 'drizzle-orm';
import request from 'supertest';
import { db } from '../src/db/db';
import {
  createApp,
  loginAs,
  lowestIdWins,
  TournamentRun,
} from './helpers/tournamentRun';

interface Team {
  groupId: number;
  ownerId: number;
  // Members of only this group (not its owner, no site admins), so rosters of the two teams never clash
  members: number[];
  // Users who are not in the group
  outsiders: number[];
  // Members of both groups, who can only be in one of the rosters
  shared: number[];
}

const DAY = 86400000;

describe('Roster creation and updates (e2e)', () => {
  let app: INestApplication;
  let run: TournamentRun;
  let teams: Team[];

  // Two seeded groups with an owner who is not a site admin, that overlap in some members. The
  // seed is random, so look for a pair that fits instead of naming ids.
  async function findTeams(): Promise<Team[]> {
    const candidates = (await db.execute(sql`
      select gu.group_id as "groupId", gu.user_id as "ownerId"
      from group_user gu
      join "user" u on u.id = gu.user_id
      where gu.role = 'owner' and u.role = 'user'
        and (select count(*) from group_user x where x.group_id = gu.group_id) >= 14
      order by gu.group_id
      limit 10
    `)) as unknown as { groupId: number; ownerId: number }[];

    const membersOf = async (groupId: number) =>
      (
        (await db.execute(sql`
          select gu.user_id as id
          from group_user gu join "user" u on u.id = gu.user_id
          where gu.group_id = ${groupId} and u.role = 'user' and not u.is_fake
          order by gu.user_id
        `)) as unknown as { id: number }[]
      ).map((r) => r.id);

    const withMembers = await Promise.all(
      candidates.map(async (c) => ({ ...c, all: await membersOf(c.groupId) })),
    );

    for (const [i, one] of withMembers.entries()) {
      for (const two of withMembers.slice(i + 1)) {
        const shared = one.all.filter(
          (id) =>
            two.all.includes(id) && id !== one.ownerId && id !== two.ownerId,
        );
        const exclusive = (own: typeof one, other: typeof one) =>
          own.all.filter((id) => id !== own.ownerId && !other.all.includes(id));
        const [membersOne, membersTwo] = [
          exclusive(one, two),
          exclusive(two, one),
        ];

        if (
          !shared.length ||
          membersOne.length < 6 ||
          membersTwo.length < 6 ||
          two.all.includes(one.ownerId) ||
          one.all.includes(two.ownerId)
        ) {
          continue;
        }

        const outsiders = async (own: typeof one) =>
          (
            (await db.execute(sql`
              select u.id from "user" u
              where u.role = 'user' and not u.is_fake
                and u.id not in (select user_id from group_user where group_id = ${own.groupId})
                and u.id not in (${sql.join([one.ownerId, two.ownerId], sql`, `)})
              order by u.id limit 5
            `)) as unknown as { id: number }[]
          ).map((r) => r.id);

        return [
          {
            groupId: one.groupId,
            ownerId: one.ownerId,
            members: membersOne,
            outsiders: await outsiders(one),
            shared,
          },
          {
            groupId: two.groupId,
            ownerId: two.ownerId,
            members: membersTwo,
            outsiders: await outsiders(two),
            shared,
          },
        ];
      }
    }

    return [];
  }

  beforeAll(async () => {
    app = await createApp();
    run = new TournamentRun(app, await loginAs(app, 1));
    teams = await findTeams();
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  // A team tournament with one stage that has not started, and both groups entered
  async function setup(stageOverrides: Record<string, unknown> = {}) {
    const tournamentId = await run.createTournament([], 'Roster run', {
      tournamentTeamType: tournamentTeamTypeEnum.TEAM,
    });
    const stageId = await run.createStage(
      tournamentId,
      stageTypeEnum.KNOCKOUT,
      'Roster stage',
      {
        startDate: new Date(Date.now() + DAY),
        endDate: new Date(Date.now() + 2 * DAY),
        minPlayersPerTeam: 2,
        maxPlayersPerTeam: 4,
        maxSubstitutes: 1,
        ...stageOverrides,
      },
    );

    for (const team of teams) {
      await run.enterGroup(tournamentId, team.groupId).expect(201);
    }

    const participations = (await run.participations(tournamentId)).results as {
      id: number;
      groupId: number;
    }[];
    const participationOf = (groupId: number) =>
      participations.find((p) => p.groupId === groupId)!.id;

    return { tournamentId, stageId, participationOf };
  }

  const members = (userIds: number[], substitutes: number[] = []) => ({
    members: [
      ...userIds.map((userId) => ({ userId, isSubstitute: false })),
      ...substitutes.map((userId) => ({ userId, isSubstitute: true })),
    ],
  });

  const create = (
    token: string,
    participationId: number,
    stageId: number,
    body: object,
  ) =>
    http()
      .post(`/roster/${participationId}/${stageId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  // The shape the web app sends: only the members
  const update = (token: string, rosterId: number, body: object) =>
    http()
      .patch(`/roster/${rosterId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  async function playersOf(rosterId: number): Promise<number[]> {
    const response = await http().get(`/roster/${rosterId}`).expect(200);

    return (response.body.players as { user: { id: number } }[])
      .map((p) => p.user.id)
      .sort((a, b) => a - b);
  }

  // The first team's roster, created by its owner
  async function ownedRoster() {
    const context = await setup();
    const [team] = teams;
    const ownerToken = await loginAs(app, team.ownerId);
    const created = await create(
      ownerToken,
      context.participationOf(team.groupId),
      context.stageId,
      members([team.ownerId, team.members[0]]),
    ).expect(201);

    return {
      ...context,
      team,
      ownerToken,
      rosterId: created.body.id as number,
    };
  }

  it('found two groups to test with', () => {
    expect(teams).toHaveLength(2);
    expect(teams[0].shared.length).toBeGreaterThan(0);
    expect(teams[0].members.length).toBeGreaterThanOrEqual(6);
    expect(teams[0].outsiders.length).toBeGreaterThan(0);
  });

  describe('creating a roster', () => {
    it('lets the owner of the group create it', async () => {
      const { rosterId, team } = await ownedRoster();

      expect(await playersOf(rosterId)).toEqual(
        [team.ownerId, team.members[0]].sort((a, b) => a - b),
      );
    });

    it('refuses people who do not run the group', async () => {
      const context = await setup();
      const [team] = teams;
      const outsiderToken = await loginAs(app, team.outsiders[0]);
      const memberToken = await loginAs(app, team.members[0]);
      const body = members([team.ownerId, team.members[0]]);

      for (const token of [outsiderToken, memberToken]) {
        await create(
          token,
          context.participationOf(team.groupId),
          context.stageId,
          body,
        ).expect(403);
      }
      await http()
        .post(
          `/roster/${context.participationOf(team.groupId)}/${context.stageId}`,
        )
        .send(body)
        .expect(401);
    });

    it('refuses players who are not in the group', async () => {
      const context = await setup();
      const [team] = teams;
      const ownerToken = await loginAs(app, team.ownerId);

      await create(
        ownerToken,
        context.participationOf(team.groupId),
        context.stageId,
        members([team.ownerId, team.outsiders[0]]),
      ).expect(403);
    });

    it("refuses a roster outside the stage's size limits", async () => {
      const context = await setup();
      const [team] = teams;
      const ownerToken = await loginAs(app, team.ownerId);
      const send = (body: object) =>
        create(
          ownerToken,
          context.participationOf(team.groupId),
          context.stageId,
          body,
        );

      await send(members([team.ownerId])).expect(403); // below the minimum of 2
      await send(members([team.ownerId, ...team.members.slice(0, 4)])).expect(
        403,
      ); // above 4
      await send(
        members([team.ownerId, team.members[0]], team.members.slice(1, 3)),
      ).expect(403); // two substitutes, one allowed
    });

    it('refuses a second roster for the same participation', async () => {
      const { team, ownerToken, participationOf, stageId } =
        await ownedRoster();

      await create(
        ownerToken,
        participationOf(team.groupId),
        stageId,
        members([team.members[1], team.members[2]]),
      ).expect(403);
    });

    it('refuses a stage that has already started', async () => {
      const context = await setup({ startDate: new Date(Date.now() - 1000) });
      const [team] = teams;
      const ownerToken = await loginAs(app, team.ownerId);

      await create(
        ownerToken,
        context.participationOf(team.groupId),
        context.stageId,
        members([team.ownerId, team.members[0]]),
      ).expect(403);
    });

    it('lets a site admin create a roster without the checks', async () => {
      const context = await setup();
      const [team] = teams;

      await create(
        run.token,
        context.participationOf(team.groupId),
        context.stageId,
        members([team.outsiders[0], team.outsiders[1]]),
      ).expect(201);
    });
  });

  describe('updating a roster', () => {
    it('lets the owner replace the members, sending only the members like the web app', async () => {
      const { rosterId, ownerToken, team } = await ownedRoster();
      const next = [team.ownerId, team.members[1], team.members[2]];

      const response = await update(ownerToken, rosterId, members(next)).expect(
        200,
      );

      expect(await playersOf(rosterId)).toEqual(
        [...next].sort((a, b) => a - b),
      );
      // And the response says which roster it was
      expect(response.body).toMatchObject({ id: rosterId });
    });

    it('keeps substitutes marked as substitutes', async () => {
      const { rosterId, ownerToken, team } = await ownedRoster();

      await update(
        ownerToken,
        rosterId,
        members([team.ownerId, team.members[1]], [team.members[2]]),
      ).expect(200);

      const response = await http().get(`/roster/${rosterId}`).expect(200);
      const substitutes = (
        response.body.players as {
          isSubstitute: boolean;
          user: { id: number };
        }[]
      )
        .filter((p) => p.isSubstitute)
        .map((p) => p.user.id);

      expect(substitutes).toEqual([team.members[2]]);
    });

    it('refuses people who do not run the group', async () => {
      const { rosterId, team } = await ownedRoster();
      const outsiderToken = await loginAs(app, team.outsiders[0]);
      const memberToken = await loginAs(app, team.members[3]);
      const body = members([team.ownerId, team.members[1]]);

      await update(outsiderToken, rosterId, body).expect(403);
      await update(memberToken, rosterId, body).expect(403);
      await http().patch(`/roster/${rosterId}`).send(body).expect(401);
    });

    it("refuses the other group's owner", async () => {
      const { rosterId, team } = await ownedRoster();
      const otherToken = await loginAs(app, teams[1].ownerId);

      await update(
        otherToken,
        rosterId,
        members([team.ownerId, team.members[1]]),
      ).expect(403);
    });

    it('refuses players who are not in the group', async () => {
      const { rosterId, ownerToken, team } = await ownedRoster();

      await update(
        ownerToken,
        rosterId,
        members([team.ownerId, team.outsiders[0]]),
      ).expect(403);
      expect(await playersOf(rosterId)).toContain(team.members[0]);
    });

    it("refuses a roster outside the stage's size limits and leaves the old one alone", async () => {
      const { rosterId, ownerToken, team } = await ownedRoster();
      const before = await playersOf(rosterId);

      await update(ownerToken, rosterId, members([team.ownerId])).expect(403);
      await update(
        ownerToken,
        rosterId,
        members([team.ownerId, ...team.members.slice(0, 4)]),
      ).expect(403);
      await update(
        ownerToken,
        rosterId,
        members([team.ownerId, team.members[0]], team.members.slice(1, 3)),
      ).expect(403);

      expect(await playersOf(rosterId)).toEqual(before);
    });

    it('refuses a player who is in another roster of the stage', async () => {
      const context = await setup();
      const [first, second] = teams;
      const [shared] = first.shared;
      const firstToken = await loginAs(app, first.ownerId);
      const secondToken = await loginAs(app, second.ownerId);

      const firstRoster = await create(
        firstToken,
        context.participationOf(first.groupId),
        context.stageId,
        members([first.ownerId, first.members[0]]),
      ).expect(201);

      // The shared player plays for group two
      await create(
        secondToken,
        context.participationOf(second.groupId),
        context.stageId,
        members([second.ownerId, shared]),
      ).expect(201);

      // Group one cannot also have them
      await update(
        firstToken,
        firstRoster.body.id,
        members([first.ownerId, shared]),
      ).expect(403);

      expect(await playersOf(firstRoster.body.id)).toContain(first.members[0]);
    });

    it('refuses duplicate members', async () => {
      const { rosterId, ownerToken, team } = await ownedRoster();
      const before = await playersOf(rosterId);

      await update(
        ownerToken,
        rosterId,
        members([team.ownerId, team.members[1], team.members[1]]),
      ).expect(400);

      expect(await playersOf(rosterId)).toEqual(before);
    });

    it('refuses an empty or missing member list', async () => {
      const { rosterId, ownerToken } = await ownedRoster();

      await update(ownerToken, rosterId, { members: [] }).expect(400);
      await update(ownerToken, rosterId, {}).expect(400);
    });

    it('refuses a roster that does not exist', async () => {
      const { ownerToken, team } = await ownedRoster();

      await update(
        ownerToken,
        99999999,
        members([team.ownerId, team.members[1]]),
      ).expect(404);
    });

    it('refuses a stage that has already started', async () => {
      const context = await setup({ startDate: new Date(Date.now() - 1000) });
      const [team] = teams;
      const created = await create(
        run.token,
        context.participationOf(team.groupId),
        context.stageId,
        members([team.ownerId, team.members[0]]),
      ).expect(201);
      const ownerToken = await loginAs(app, team.ownerId);

      await update(
        ownerToken,
        created.body.id,
        members([team.ownerId, team.members[1]]),
      ).expect(403);
    });

    it('lets a site admin update any roster', async () => {
      const { rosterId, team } = await ownedRoster();
      const next = [team.outsiders[0], team.outsiders[1]];

      await update(run.token, rosterId, members(next)).expect(200);

      expect(await playersOf(rosterId)).toEqual(
        [...next].sort((a, b) => a - b),
      );
    });
  });

  describe('rosters in later stages', () => {
    // Stage one is played; a rule carries the top two rosters into stage two
    async function laterStage(maxChanges: number) {
      const tournamentId = await run.createTournament([], 'Later stage run', {
        tournamentTeamType: tournamentTeamTypeEnum.TEAM,
      });
      const first = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
        'One',
        {
          startDate: new Date(Date.now() + DAY),
          endDate: new Date(Date.now() + 2 * DAY),
          minPlayersPerTeam: 2,
          maxPlayersPerTeam: 4,
        },
      );
      const second = await run.createStage(
        tournamentId,
        stageTypeEnum.KNOCKOUT,
        'Two',
        {
          startDate: new Date(Date.now() + 3 * DAY),
          endDate: new Date(Date.now() + 4 * DAY),
          minPlayersPerTeam: 2,
          maxPlayersPerTeam: 4,
          maxChanges,
        },
      );

      for (const team of teams) {
        await run.enterGroup(tournamentId, team.groupId).expect(201);
      }

      const participations = (await run.participations(tournamentId))
        .results as {
        id: number;
        groupId: number;
      }[];

      for (const team of teams) {
        await run
          .createRoster(
            participations.find((p) => p.groupId === team.groupId)!.id,
            first,
            [team.ownerId, team.members[0]],
          )
          .expect(201);
      }

      await run
        .createRule({
          type: pointConversionTypeEnum.STAGE_TO_STAGE,
          strategy: pointConversionStrategyEnum.QUALIFICATION,
          source: first,
          destination: second,
        })
        .expect(201);

      await run.startStage(first).expect(200);
      await run.play(first, lowestIdWins);

      const rosters = (await http().get(`/roster/stage/${second}`).expect(200))
        .body;
      const list = (rosters.results ?? rosters) as {
        id: number;
        participation?: { group?: { id: number } };
      }[];
      const rosterOf = (groupId: number) =>
        list.find((r) => r.participation?.group?.id === groupId)!.id;

      return { second, rosterOf };
    }

    it('allows changes up to the stage limit and refuses more', async () => {
      const { rosterOf } = await laterStage(2);
      const [team] = teams;
      const ownerToken = await loginAs(app, team.ownerId);
      const rosterId = rosterOf(team.groupId);

      // [owner, member0] -> [owner, member1] is one removed and one added: two changes
      await update(
        ownerToken,
        rosterId,
        members([team.ownerId, team.members[1]]),
      ).expect(200);

      // Three more players on top is more than two changes
      await update(
        ownerToken,
        rosterId,
        members([
          team.ownerId,
          team.members[1],
          team.members[2],
          team.members[3],
        ]),
      ).expect(403);
    });

    it('refuses every change when the stage allows none', async () => {
      const { rosterOf } = await laterStage(0);
      const [team] = teams;
      const ownerToken = await loginAs(app, team.ownerId);

      await update(
        ownerToken,
        rosterOf(team.groupId),
        members([team.ownerId, team.members[1]]),
      ).expect(403);
    });

    it('lets a site admin ignore the change limit', async () => {
      const { rosterOf } = await laterStage(0);
      const [team] = teams;

      await update(
        run.token,
        rosterOf(team.groupId),
        members([team.members[1], team.members[2]]),
      ).expect(200);
    });
  });
});
