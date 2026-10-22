import { Injectable } from '@nestjs/common';
import { and, asc, count, eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import {
  group,
  participation,
  roster,
  user,
  userToRoster,
  vansyAttemptResult,
  vansyStageQuiz,
  vansyStageStanding,
  vansyWebhookEvent,
} from 'src/db/schema';

@Injectable()
export class VansyRepository {
  async linkOf(stageId: number) {
    const [row] = await db
      .select()
      .from(vansyStageQuiz)
      .where(eq(vansyStageQuiz.stageId, stageId));
    return row ?? null;
  }

  async link(stageId: number, vansyQuizId: string, linkedById: number) {
    await db
      .insert(vansyStageQuiz)
      .values({ stageId, vansyQuizId, linkedById })
      .onConflictDoUpdate({
        target: vansyStageQuiz.stageId,
        set: { vansyQuizId, linkedById },
      });
  }

  async unlink(stageId: number) {
    await db.delete(vansyStageQuiz).where(eq(vansyStageQuiz.stageId, stageId));
  }

  /** The roster the user plays in on a stage, with its name and how many people take part */
  async rosterOf(stageId: number, userId: number) {
    const [row] = await db
      .select({
        rosterId: roster.id,
        groupName: group.name,
        username: user.username,
      })
      .from(userToRoster)
      .innerJoin(roster, eq(roster.id, userToRoster.rosterId))
      .innerJoin(participation, eq(participation.id, roster.participationId))
      .leftJoin(group, eq(group.id, participation.groupId))
      .leftJoin(user, eq(user.id, participation.userId))
      .where(and(eq(roster.stageId, stageId), eq(userToRoster.userId, userId)));

    if (!row) {
      return null;
    }

    const [members] = await db
      .select({ n: count() })
      .from(userToRoster)
      .where(
        and(
          eq(userToRoster.rosterId, row.rosterId),
          eq(userToRoster.isSubstitute, false),
        ),
      );

    return {
      rosterId: row.rosterId,
      name: row.groupName ?? row.username ?? `Roster ${row.rosterId}`,
      memberCount: Math.max(1, members.n),
    };
  }

  /** Records an event id; false when it was handled before (Vansy delivers at least once) */
  async claimEvent(eventId: string, type: string) {
    const inserted = await db
      .insert(vansyWebhookEvent)
      .values({ eventId, type })
      .onConflictDoNothing()
      .returning({ eventId: vansyWebhookEvent.eventId });
    return inserted.length > 0;
  }

  async rosterExists(rosterId: number, stageId: number) {
    const [row] = await db
      .select({ id: roster.id })
      .from(roster)
      .where(and(eq(roster.id, rosterId), eq(roster.stageId, stageId)));
    return !!row;
  }

  async displayName(userId: number) {
    const [row] = await db
      .select({ username: user.username, name: user.name })
      .from(user)
      .where(eq(user.id, userId));
    return row?.username || row?.name || `User ${userId}`;
  }

  async userExists(userId: number) {
    const [row] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId));
    return !!row;
  }

  async saveResult(values: typeof vansyAttemptResult.$inferInsert) {
    // attempt.reviewed updates the row attempt.completed created
    const set = { ...values };
    delete set.attemptId;
    await db
      .insert(vansyAttemptResult)
      .values(values)
      .onConflictDoUpdate({ target: vansyAttemptResult.attemptId, set });
  }

  async replaceStandings(
    stageId: number,
    rows: Omit<typeof vansyStageStanding.$inferInsert, 'stageId'>[],
  ) {
    await db.transaction(async (tx) => {
      await tx
        .delete(vansyStageStanding)
        .where(eq(vansyStageStanding.stageId, stageId));
      if (rows.length) {
        await tx
          .insert(vansyStageStanding)
          .values(rows.map((r) => ({ ...r, stageId })));
      }
    });
  }

  standingsOf(stageId: number) {
    return db
      .select()
      .from(vansyStageStanding)
      .where(eq(vansyStageStanding.stageId, stageId))
      .orderBy(asc(vansyStageStanding.rank));
  }

  resultsOf(stageId: number) {
    return db
      .select()
      .from(vansyAttemptResult)
      .where(eq(vansyAttemptResult.stageId, stageId));
  }
}
