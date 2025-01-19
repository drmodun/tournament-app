import { Injectable } from '@nestjs/common';
import { stage, tournament, roster } from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import { eq, gte, lte, SQL } from 'drizzle-orm';
import {
  IUpdateStageDto,
  stageStatusEnum,
  StageResponsesEnum,
  StageSortingEnum,
  stageTypeEnum,
  tournamentLocationEnum,
} from '@tournament-app/types';
import {
  AnyPgSelectQueryBuilder,
  PgSelectJoinFn,
  PgColumn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';

@Injectable()
export class StageDrizzleRepository extends PrimaryRepository<
  typeof stage,
  BaseQuery,
  IUpdateStageDto
> {
  constructor() {
    super(stage);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: StageResponsesEnum,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case StageResponsesEnum.WITH_TOURNAMENT:
      case StageResponsesEnum.WITH_EXTENDED_TOURNAMENT:
        return query.leftJoin(
          tournament,
          eq(stage.tournamentId, tournament.id),
        );
      default:
        return query;
    }
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses
      .map(([key, value]) => {
        switch (key) {
          case 'name':
            return eq(stage.name, value as string);
          case 'stageType':
            return eq(stage.stageType, value as stageTypeEnum);
          case 'stageStatus':
            return eq(stage.stageStatus, value as stageStatusEnum);
          case 'stageLocation':
            return eq(stage.stageLocation, value as tournamentLocationEnum);
          case 'startDate':
            return gte(stage.startDate, value as Date);
          case 'endDate':
            return lte(stage.endDate, value as Date);
          case 'tournamentId':
            return eq(stage.tournamentId, value as number);
          case 'minPlayersPerTeam':
            return gte(stage.minPlayersPerTeam, value as number);
          case 'maxPlayersPerTeam':
            return lte(stage.maxPlayersPerTeam, value as number);
          default:
            return undefined;
        }
      })
      .filter(Boolean);
  }

  getValidOrderBy(field: string): keyof typeof stage {
    switch (field) {
      case StageSortingEnum.NAME:
        return 'name';
      case StageSortingEnum.CREATED_AT:
        return 'createdAt';
      case StageSortingEnum.UPDATED_AT:
        return 'updatedAt';
      case StageSortingEnum.START_DATE:
        return 'startDate';
      case StageSortingEnum.END_DATE:
        return 'endDate';
      default:
        return 'createdAt';
    }
  }

  sortRecord: Record<StageSortingEnum, PgColumn | SQL<number>> = {
    [StageSortingEnum.NAME]: stage.name,
    [StageSortingEnum.CREATED_AT]: stage.createdAt,
    [StageSortingEnum.UPDATED_AT]: stage.updatedAt,
    [StageSortingEnum.START_DATE]: stage.startDate,
    [StageSortingEnum.END_DATE]: stage.endDate,
  };

  getMappingObject(responseEnum: StageResponsesEnum) {
    switch (responseEnum) {
      case StageResponsesEnum.MINI:
        return {
          id: stage.id,
          name: stage.name,
          tournamentId: stage.tournamentId,
          stageStatus: stage.stageStatus,
        };
      case StageResponsesEnum.BASE:
        return {
          ...this.getMappingObject(StageResponsesEnum.MINI),
          stageType: stage.stageType,
          description: stage.description,
          logo: stage.logo,
          startDate: stage.startDate,
          endDate: stage.endDate,
          rostersParticipating: db.$count(roster, eq(roster.stageId, stage.id)),
        };
      case StageResponsesEnum.WITH_TOURNAMENT:
        return {
          ...this.getMappingObject(StageResponsesEnum.BASE),
          tournament: {
            id: tournament.id,
            name: tournament.name,
            type: tournament.tournamentType,
            startDate: tournament.startDate,
            location: tournament.location,
            logo: tournament.logo,
            country: tournament.country,
          },
        };
      case StageResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(StageResponsesEnum.BASE),
          createdAt: stage.createdAt,
          updatedAt: stage.updatedAt,
        };
      case StageResponsesEnum.WITH_EXTENDED_TOURNAMENT:
        return {
          ...this.getMappingObject(StageResponsesEnum.EXTENDED),
          tournament: {
            id: tournament.id,
            name: tournament.name,
            type: tournament.tournamentType,
            startDate: tournament.startDate,
            location: tournament.location,
            logo: tournament.logo,
            country: tournament.country,
          },
        };
      default:
        return this.getMappingObject(StageResponsesEnum.BASE);
    }
  }
}
