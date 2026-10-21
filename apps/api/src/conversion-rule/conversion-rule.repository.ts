import { Injectable } from '@nestjs/common';
import { groupRoleEnum } from '@tournament-app/types';
import {
  and,
  asc,
  desc,
  eq,
  exists,
  inArray,
  InferInsertModel,
  InferSelectModel,
  isNotNull,
  isNull,
  not,
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
import { ConversionEffects, ConversionOutcome, noEffects } from './conversion';
import { ConversionRuleQuery } from './dto/requests.dto';
import { isFedByRules } from './fedStages';

export type ConversionRule = InferSelectModel<typeof pointConversionRule>;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

@Injectable()
export class ConversionRuleDrizzleRepository {
  // Stages the rule enters rosters into lose the rosters solo players got by themselves, so that they hold
  // only who the rules enter
  async create(
    values: InferInsertModel<typeof pointConversionRule>,
    fedStageIds: number[] = [],
  ) {
    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(pointConversionRule)
        .values(values)
        .returning({ id: pointConversionRule.id });

      if (fedStageIds.length) {
        await tx
          .delete(roster)
          .where(
            and(
              inArray(roster.stageId, fedStageIds),
              inArray(
                roster.participationId,
                tx
                  .select({ id: participation.id })
                  .from(participation)
                  .where(isNotNull(participation.userId)),
              ),
            ),
          );
      }

      return created;
    });
  }

  // Gives solo players a roster in each upcoming stage that no rule enters rosters into any more
  async restoreSoloRosters(stageIds: number[]) {
    await db.transaction(async (tx) => {
      for (const stageId of stageIds) {
        const [target] = await tx
          .select({ tournamentId: stage.tournamentId })
          .from(stage)
          .where(
            and(
              eq(stage.id, stageId),
              eq(stage.stageStatus, 'upcoming'),
              not(isFedByRules(stage.id)),
            ),
          );

        if (!target) {
          continue;
        }

        const players = await tx
          .select({ id: participation.id, userId: participation.userId })
          .from(participation)
          .where(
            and(
              eq(participation.tournamentId, target.tournamentId),
              isNotNull(participation.userId),
              not(
                exists(
                  tx
                    .select({ id: roster.id })
                    .from(roster)
                    .where(
                      and(
                        eq(roster.participationId, participation.id),
                        eq(roster.stageId, stageId),
                      ),
                    ),
                ),
              ),
            ),
          );

        for (const player of players) {
          const [created] = await tx
            .insert(roster)
            .values({ participationId: player.id, stageId } as InferInsertModel<
              typeof roster
            >)
            .returning({ id: roster.id });

          await tx.insert(userToRoster).values({
            userId: player.userId,
            rosterId: created.id,
            isSubstitute: false,
          });
        }
      }
    });
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

  // Source rosters (outcome ids) into destination stages: qualifiers get a roster with the same
  // players, points are added, seeds set, and eliminated entries removed. Records what changed.
  async applyToStages(
    ruleId: number,
    targets: { stageId: number; outcomes: ConversionOutcome[] }[],
  ) {
    await db.transaction(async (tx) => {
      const effects = noEffects();

      for (const { stageId, outcomes } of targets) {
        for (const outcome of outcomes) {
          await this.applyOutcomeToStage(tx, stageId, outcome, effects);
        }
      }

      await this.markApplied(ruleId, effects, tx);
    });
  }

  private async applyOutcomeToStage(
    tx: Transaction,
    destinationStageId: number,
    outcome: ConversionOutcome,
    effects: ConversionEffects,
  ) {
    const [source] = await tx
      .select({ participationId: roster.participationId })
      .from(roster)
      .where(eq(roster.id, outcome.id));

    if (!source) {
      return;
    }

    const [existing] = await tx
      .select({ id: roster.id, points: roster.points, seed: roster.seed })
      .from(roster)
      .where(
        and(
          eq(roster.participationId, source.participationId),
          eq(roster.stageId, destinationStageId),
        ),
      );

    if (outcome.isRemoved) {
      if (existing) {
        effects.removedRosters.push({
          stageId: destinationStageId,
          participationId: source.participationId,
          points: existing.points,
          seed: existing.seed,
          players: await this.playersOf(tx, existing.id),
        });
        await tx.delete(roster).where(eq(roster.id, existing.id));
      }
      return;
    }

    if (existing) {
      await tx
        .update(roster)
        .set({
          points: sql`coalesce(${roster.points}, 0) + ${outcome.points}`,
          ...(outcome.seed != null ? { seed: outcome.seed } : {}),
        })
        .where(eq(roster.id, existing.id));

      if (outcome.points) {
        effects.rosterPoints.push({
          rosterId: existing.id,
          points: outcome.points,
        });
      }
      if (outcome.seed != null) {
        effects.seeds.push({ rosterId: existing.id, previous: existing.seed });
      }
      return;
    }

    if (!outcome.qualifies) {
      return;
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

    effects.createdRosters.push(created.id);

    const players = await this.playersOf(tx, outcome.id);

    if (players.length) {
      await tx
        .insert(userToRoster)
        .values(players.map((player) => ({ ...player, rosterId: created.id })));
    }
  }

  private playersOf(tx: Transaction, rosterId: number) {
    return tx
      .select({
        userId: userToRoster.userId,
        isSubstitute: userToRoster.isSubstitute,
      })
      .from(userToRoster)
      .where(eq(userToRoster.rosterId, rosterId));
  }

  // Source participations (outcome ids) into the destination tournament: the same group or player
  // gets its points added. Returns the qualifiers that have no entry there yet, and the points added.
  async applyToTournament(
    destinationTournamentId: number,
    outcomes: ConversionOutcome[],
  ) {
    const missing: { groupId?: number; userId?: number; points: number }[] = [];
    const participationPoints: ConversionEffects['participationPoints'] = [];

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
          if (outcome.points) {
            participationPoints.push({
              participationId: existing.id,
              points: outcome.points,
            });
          }
        } else if (outcome.qualifies) {
          missing.push(
            source.groupId
              ? { groupId: source.groupId, points: outcome.points }
              : { userId: source.userId, points: outcome.points },
          );
        }
      }
    });

    return { missing, participationPoints };
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

  async markApplied(
    ruleId: number,
    effects: ConversionEffects,
    tx: Transaction | typeof db = db,
  ) {
    await tx
      .update(pointConversionRule)
      .set({ appliedAt: new Date(), effects } as Partial<
        InferInsertModel<typeof pointConversionRule>
      >)
      .where(eq(pointConversionRule.id, ruleId));
  }

  // Applied rules whose source is one of these stages, or one of these tournaments
  async findApplied(stageIds: number[], tournamentIds: number[]) {
    return db
      .select()
      .from(pointConversionRule)
      .where(
        and(
          isNotNull(pointConversionRule.appliedAt),
          or(
            and(
              inArray(pointConversionRule.type, [
                'stage_to_stage',
                'stage_to_tournament',
              ]),
              inArray(
                pointConversionRule.source,
                stageIds.length ? stageIds : [-1],
              ),
            ),
            and(
              eq(pointConversionRule.type, 'tournament_to_tournament'),
              inArray(
                pointConversionRule.source,
                tournamentIds.length ? tournamentIds : [-1],
              ),
            ),
          ),
        ),
      )
      .orderBy(desc(pointConversionRule.id));
  }

  // Whether any stage of the tournament has started
  async hasTournamentStarted(tournamentId: number) {
    const [result] = await db
      .select({
        started: sql<number>`count(*) filter (where ${stage.stageStatus} in ('ongoing', 'finished'))::int`,
      })
      .from(stage)
      .where(eq(stage.tournamentId, tournamentId));

    return result.started > 0;
  }

  // Undoes the rules (newest first) and puts the stage back in play, all or nothing
  async reopenStage(stageId: number, rules: ConversionRule[]) {
    await db.transaction(async (tx) => {
      for (const rule of rules) {
        await this.undo(tx, rule.effects ?? noEffects());
        await tx
          .update(pointConversionRule)
          .set({ appliedAt: null, effects: null } as Partial<
            InferInsertModel<typeof pointConversionRule>
          >)
          .where(eq(pointConversionRule.id, rule.id));
      }

      await tx
        .update(stage)
        .set({ stageStatus: 'ongoing' } as Partial<
          InferInsertModel<typeof stage>
        >)
        .where(eq(stage.id, stageId));
    });
  }

  private async undo(tx: Transaction, effects: ConversionEffects) {
    if (effects.createdRosters.length) {
      await tx.delete(roster).where(inArray(roster.id, effects.createdRosters));
    }

    for (const { rosterId, points } of effects.rosterPoints) {
      await tx
        .update(roster)
        .set({ points: sql`coalesce(${roster.points}, 0) - ${points}` })
        .where(eq(roster.id, rosterId));
    }

    for (const { rosterId, previous } of effects.seeds) {
      await tx
        .update(roster)
        .set({ seed: previous })
        .where(eq(roster.id, rosterId));
    }

    for (const removed of effects.removedRosters) {
      const [restored] = await tx
        .insert(roster)
        .values({
          participationId: removed.participationId,
          stageId: removed.stageId,
          points: removed.points,
          seed: removed.seed,
        } as InferInsertModel<typeof roster>)
        .returning({ id: roster.id });

      if (removed.players.length) {
        await tx.insert(userToRoster).values(
          removed.players.map((player) => ({
            ...player,
            rosterId: restored.id,
          })),
        );
      }
    }

    if (effects.createdParticipations.length) {
      await tx
        .delete(participation)
        .where(inArray(participation.id, effects.createdParticipations));
    }

    for (const { participationId, points } of effects.participationPoints) {
      await this.addParticipationPoints(participationId, -points, tx);
    }
  }
}
