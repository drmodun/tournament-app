import { Injectable } from '@nestjs/common';
import {
  stage,
  tournament,
  roster,
  location,
  userToRoster,
} from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import {
  aliasedTable,
  and,
  asc,
  eq,
  gte,
  inArray,
  lte,
  notInArray,
  or,
  SQL,
} from 'drizzle-orm';
import {
  IUpdateStageDto,
  stageStatusEnum,
  StageResponsesEnum,
  StageSortingEnum,
  stageTypeEnum,
  tournamentLocationEnum,
  IStageResponse,
} from '@tournament-app/types';
import {
  AnyPgSelectQueryBuilder,
  PgSelectJoinFn,
  PgColumn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import { StagesWithDates } from './types';
import { StageQuery } from './dto/requests.dto';

@Injectable()
export class StageDrizzleRepository extends PrimaryRepository<
  typeof stage,
  StageQuery,
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
      case StageResponsesEnum.EXTENDED:
        return query.leftJoin(location, eq(stage.locationId, location.id));
      case StageResponsesEnum.BASE:
        return query.leftJoin(location, eq(stage.locationId, location.id));
      case StageResponsesEnum.WITH_TOURNAMENT:
        const tournamentLocation = aliasedTable(location, 'tournamentLocation');
        return query
          .leftJoin(location, eq(stage.locationId, location.id))
          .leftJoin(tournament, eq(stage.tournamentId, tournament.id))
          .leftJoin(
            tournamentLocation,
            eq(tournament.locationId, tournamentLocation.id),
          );
      case StageResponsesEnum.WITH_EXTENDED_TOURNAMENT:
        const tournamentLocationAlias = aliasedTable(
          location,
          'tournamentLocation',
        );
        return query
          .leftJoin(tournament, eq(stage.tournamentId, tournament.id))
          .leftJoin(location, eq(stage.locationId, location.id))
          .leftJoin(
            tournamentLocationAlias,
            eq(tournament.locationId, tournamentLocationAlias.id),
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
  async isAnyMemberInAnotherRoster(
    memberIds: number[],
    stageId: number,
    excludeRosterIds?: number[],
  ): Promise<boolean> {
    const isGivenExcludeRosterIds = excludeRosterIds?.length > 0;

    const check = await db
      .select()
      .from(stage)
      .rightJoin(roster, eq(roster.stageId, stage.id))
      .rightJoin(userToRoster, eq(userToRoster.rosterId, roster.id))
      .where(
        and(
          inArray(userToRoster.userId, memberIds),
          eq(stage.id, stageId),
          isGivenExcludeRosterIds
            ? notInArray(roster.id, excludeRosterIds)
            : undefined,
        ),
      );

    return check.length > 0;
  }

  async getAllTournamentStagesSortedByStartDate(
    tournamentId: number,
  ): Promise<StagesWithDates[]> {
    const stages = await db
      .select({
        id: stage.id,
        startDate: stage.startDate,
        endDate: stage.endDate,
      })
      .from(stage)
      .where(eq(stage.tournamentId, tournamentId))
      .orderBy(asc(stage.startDate));

    return stages;
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
          locationId: stage.locationId,
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
          location: {
            id: location.id,
            name: location.name,
            apiId: location.apiId,
            coordinates: location.coordinates,
          },
        };
      case StageResponsesEnum.WITH_TOURNAMENT:
        return {
          ...this.getMappingObject(StageResponsesEnum.BASE),
          tournament: {
            id: tournament.id,
            name: tournament.name,
            type: tournament.tournamentType,
            startDate: tournament.startDate,
            logo: tournament.logo,
            country: tournament.country,
            locationId: tournament.locationId,
            location: {
              id: location.id,
              name: location.name,
              apiId: location.apiId,
            },
          },
        };
      case StageResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(StageResponsesEnum.BASE),
          createdAt: stage.createdAt,
          updatedAt: stage.updatedAt,
          minPlayersPerTeam: stage.minPlayersPerTeam,
          maxPlayersPerTeam: stage.maxPlayersPerTeam,
          maxSubstitutes: stage.maxSubstitutes,
          maxChanges: stage.maxChanges,
        };
      case StageResponsesEnum.WITH_EXTENDED_TOURNAMENT:
        return {
          ...this.getMappingObject(StageResponsesEnum.EXTENDED),
          tournament: {
            id: tournament.id,
            name: tournament.name,
            type: tournament.tournamentType,
            startDate: tournament.startDate,
            logo: tournament.logo,
            locationId: tournament.locationId,
            country: tournament.country,
            location: {
              id: location.id,
              name: location.name,
              apiId: location.apiId,
              coordinates: location.coordinates,
            }, // TODO: check if this is correct
            minPlayersPerTeam: stage.minPlayersPerTeam,
            maxPlayersPerTeam: stage.maxPlayersPerTeam,
            maxSubstitutes: stage.maxSubstitutes,
            maxChanges: stage.maxChanges,
          },
        };
      default:
        return this.getMappingObject(StageResponsesEnum.BASE);
    }
  }
}
