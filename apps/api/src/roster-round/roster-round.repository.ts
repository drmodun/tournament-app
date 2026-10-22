import { Injectable } from '@nestjs/common';
import { eq, SQL } from 'drizzle-orm';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { RosterRoundSortingEnum } from '@tournament-app/types';
import { BaseDrizzleRepository } from '../base/repository/baseRepository';
import { rosterToRound, stageRound } from '../db/schema';
import { RosterRoundQuery } from './dto/requests.dto';

@Injectable()
export class RosterRoundDrizzleRepository extends BaseDrizzleRepository<
  typeof rosterToRound,
  RosterRoundQuery
> {
  constructor() {
    super(rosterToRound);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right', false>
    | TSelect {
    return query.innerJoin(
      stageRound,
      eq(rosterToRound.roundId, stageRound.id),
    );
  }

  getValidWhereClause(query: RosterRoundQuery): SQL[] {
    // isWinner=false is a filter too, so only missing values are skipped
    const clauses = Object.entries(query).filter(
      ([_, value]) => value !== undefined && value !== null,
    );

    return clauses
      .map(([key, value]) => {
        switch (key) {
          case 'stageId':
            return eq(stageRound.stageId, value as number);
          case 'rosterId':
            return eq(rosterToRound.rosterId, value as number);
          case 'roundNumber':
            return eq(stageRound.roundNumber, value as number);
          case 'isWinner':
            return eq(rosterToRound.isWinner, value as boolean);
          default:
            return;
        }
      })
      .filter(Boolean);
  }

  sortRecord: Record<RosterRoundSortingEnum, PgColumn | SQL<number>> = {
    [RosterRoundSortingEnum.ROUND_NUMBER]: stageRound.roundNumber,
    [RosterRoundSortingEnum.SCORE]: rosterToRound.score,
  };

  // One shape only: the row with its round
  getMappingObject(responseType: string) {
    switch (responseType) {
      case 'base':
        return {
          rosterId: rosterToRound.rosterId,
          roundId: rosterToRound.roundId,
          stageId: stageRound.stageId,
          roundNumber: stageRound.roundNumber,
          score: rosterToRound.score,
          isWinner: rosterToRound.isWinner,
          createdAt: rosterToRound.createdAt,
        };
      default:
        return this.getMappingObject('base');
    }
  }
}
