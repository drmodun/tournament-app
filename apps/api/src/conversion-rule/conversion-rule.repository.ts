import { Injectable } from '@nestjs/common';
import { groupRoleEnum } from '@tournament-app/types';
import {
  and,
  asc,
  eq,
  exists,
  inArray,
  InferInsertModel,
  InferSelectModel,
  isNull,
  or,
  sql,
} from 'drizzle-orm';
import { db } from 'src/db/db';
import {
  groupToUser,
  participation,
  pointConversionRule,
  roster,
  stage,
  tournament,
  userToRoster,
} from 'src/db/schema';
import { ConversionOutcome } from './conversion';
import { ConversionRuleQuery } from './dto/requests.dto';

export type ConversionRule = InferSelectModel<typeof pointConversionRule>;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

@Injectable()
export class ConversionRuleDrizzleRepository {
  async create(values: InferInsertModel<typeof pointConversionRule>) {
    const [created] = await db
      .insert(pointConversionRule)
      .values(values)
      .returning({ id: pointConversionRule.id });

    return created;
  }

  async findMany(query: ConversionRuleQuery): Promise<ConversionRule[]> {
    return db
      .select()
      .from(pointConversionRule)
      .where(
        and(
          query.source != null
            ? eq(pointConversionRule.source, query.source)
            : undefined,
          query.destination != null
            ? eq(pointConversionRule.destination, query.destination)
            : undefined,
          query.type ? eq(pointConversionRule.type, query.type) : undefined,
        ),
      )
      .orderBy(asc(pointConversionRule.id));
  }

  async findOne(id: number): Promise<ConversionRule | undefined> {
    const [rule] = await db
      .select()
      .from(pointConversionRule)
      .where(eq(pointConversionRule.id, id));

    return rule;
  }

  async delete(id: number) {
    const [deleted] = await db
      .delete(pointConversionRule)
      .where(eq(pointConversionRule.id, id))
      .returning({ id: pointConversionRule.id });

    return deleted;
  }

  async findPending(types: string[], source: number) {
    return db
      .select()
      .from(pointConversionRule)
      .where(
        and(
          inArray(pointConversionRule.type, types as never[]),
          eq(pointConversionRule.source, source),
          isNull(pointConversionRule.appliedAt),
        ),
      )
      .orderBy(asc(pointConversionRule.id));
  }

  async getStage(stageId: number) {
    const [result] = await db
      .select({
        id: stage.id,
        tournamentId: stage.tournamentId,
        stageStatus: stage.stageStatus,
      })
      .from(stage)
      .where(eq(stage.id, stageId));

    return result;
  }

  async getTournament(tournamentId: number) {
    const [result] = await db
      .select({ id: tournament.id })
      .from(tournament)
      .where(eq(tournament.id, tournamentId));

    return result;
  }

  // A tournament is over once it has stages and all of them are finished
  async isTournamentFinished(tournamentId: number) {
    const [result] = await db
      .select({
        stages: sql<number>`count(*)::int`,
        unfinished: sql<number>`count(*) filter (where ${stage.stageStatus} <> 'finished')::int`,
      })
      .from(stage)
      .where(eq(stage.tournamentId, tournamentId));

    return result.stages > 0 && result.unfinished === 0;
  }

  // Its creator and the admins and owner of its affiliated group
  async managesTournament(userId: number, tournamentId: number) {
    const result = await db
      .select({ id: tournament.id })
      .from(tournament)
      .where(
        and(
          eq(tournament.id, tournamentId),
          or(
            eq(tournament.creatorId, userId),
            exists(
              db
                .select({ groupId: groupToUser.groupId })
                .from(groupToUser)
                .where(
                  and(
                    eq(groupToUser.groupId, tournament.affiliatedGroupId),
                    eq(groupToUser.userId, userId),
                    inArray(groupToUser.role, [
                      groupRoleEnum.ADMIN,
                      groupRoleEnum.OWNER,
                    ]),
                  ),
                ),
            ),
          ),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async getRosterParticipations(rosterIds: number[]) {
    if (!rosterIds.length) {
      return new Map<number, number>();
    }

    const rows = await db
      .select({ id: roster.id, participationId: roster.participationId })
      .from(roster)
      .where(inArray(roster.id, rosterIds));

    return new Map(rows.map((row) => [row.id, row.participationId]));
  }

  async getTournamentParticipations(tournamentId: number) {
    return db
      .select({ id: participation.id, points: participation.points })
      .from(participation)
      .where(eq(participation.tournamentId, tournamentId));
  }

  // Source rosters (outcome ids) into the destination stage: qualifiers get a roster with the same
  // players, points are added, seeds set, and eliminated entries removed
  async applyToStage(
    ruleId: number,
    destinationStageId: number,
    outcomes: ConversionOutcome[],
  ) {
    await db.transaction(async (tx) => {
      for (const outcome of outcomes) {
        const [source] = await tx
          .select({ participationId: roster.participationId })
          .from(roster)
          .where(eq(roster.id, outcome.id));

        if (!source) {
          continue;
        }

        const [existing] = await tx
          .select({ id: roster.id })
          .from(roster)
          .where(
            and(
              eq(roster.participationId, source.participationId),
              eq(roster.stageId, destinationStageId),
            ),
          );

        if (outcome.isRemoved) {
          if (existing) {
            await tx.delete(roster).where(eq(roster.id, existing.id));
          }
          continue;
        }

        if (existing) {
          await tx
            .update(roster)
            .set({
              points: sql`coalesce(${roster.points}, 0) + ${outcome.points}`,
              ...(outcome.seed != null ? { seed: outcome.seed } : {}),
            })
            .where(eq(roster.id, existing.id));
          continue;
        }

        if (!outcome.qualifies) {
          continue;
        }

        const [created] = await tx
          .insert(roster)
          .values({
            participationId: source.participationId,
            stageId: destinationStageId,
            points: outcome.points,
            seed: outcome.seed,
          } as InferInsertModel<typeof roster>)
          .returning({ id: roster.id });

        const players = await tx
          .select({
            userId: userToRoster.userId,
            isSubstitute: userToRoster.isSubstitute,
          })
          .from(userToRoster)
          .where(eq(userToRoster.rosterId, outcome.id));

        if (players.length) {
          await tx
            .insert(userToRoster)
            .values(
              players.map((player) => ({ ...player, rosterId: created.id })),
            );
        }
      }

      await this.markApplied(ruleId, tx);
    });
  }

  // Source participations (outcome ids) into the destination tournament: the same group or player
  // gets its points added. Returns the qualifiers that have no entry there yet.
  async applyToTournament(
    destinationTournamentId: number,
    outcomes: ConversionOutcome[],
  ) {
    const missing: { groupId?: number; userId?: number; points: number }[] = [];

    await db.transaction(async (tx) => {
      for (const outcome of outcomes) {
        const [source] = await tx
          .select({
            groupId: participation.groupId,
            userId: participation.userId,
          })
          .from(participation)
          .where(eq(participation.id, outcome.id));

        if (!source) {
          continue;
        }

        const [existing] = await tx
          .select({ id: participation.id })
          .from(participation)
          .where(
            and(
              eq(participation.tournamentId, destinationTournamentId),
              source.groupId
                ? eq(participation.groupId, source.groupId)
                : and(
                    isNull(participation.groupId),
                    eq(participation.userId, source.userId),
                  ),
            ),
          )
          .orderBy(asc(participation.id))
          .limit(1);

        if (existing) {
          await this.addParticipationPoints(existing.id, outcome.points, tx);
        } else if (outcome.qualifies) {
          missing.push(
            source.groupId
              ? { groupId: source.groupId, points: outcome.points }
              : { userId: source.userId, points: outcome.points },
          );
        }
      }
    });

    return missing;
  }

  async addParticipationPoints(
    participationId: number,
    points: number,
    tx: Transaction | typeof db = db,
  ) {
    if (!points) {
      return;
    }

    await tx
      .update(participation)
      .set({
        points: sql`coalesce(${participation.points}, 0) + ${points}`,
      })
      .where(eq(participation.id, participationId));
  }

  async markApplied(ruleId: number, tx: Transaction | typeof db = db) {
    await tx
      .update(pointConversionRule)
      .set({ appliedAt: new Date() } as Partial<
        InferInsertModel<typeof pointConversionRule>
      >)
      .where(eq(pointConversionRule.id, ruleId));
  }
}
