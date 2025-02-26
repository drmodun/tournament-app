import { Injectable } from '@nestjs/common';
import {
  category,
  group,
  location,
  participation,
  tournament,
  user,
} from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import { aliasedTable, eq, gte, lte, SQL } from 'drizzle-orm';
import {
  IUpdateTournamentRequest,
  TournamentResponseEnumType,
  TournamentResponsesEnum,
  TournamentSortingEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import { TournamentDtosEnum, TournamentReturnTypesEnumType } from './types';

@Injectable()
export class TournamentDrizzleRepository extends PrimaryRepository<
  typeof tournament,
  BaseQuery,
  IUpdateTournamentRequest
> {
  constructor() {
    super(tournament);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: TournamentResponseEnumType,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case TournamentResponsesEnum.BASE:
        return query
          .leftJoin(user, eq(tournament.creatorId, user.id))
          .leftJoin(group, eq(tournament.affiliatedGroupId, group.id))
          .leftJoin(category, eq(tournament.categoryId, category.id))
          .leftJoin(location, eq(tournament.locationId, location.id));

      case TournamentResponsesEnum.EXTENDED:
        const parent = aliasedTable(tournament, 'parent');
        return query
          .leftJoin(user, eq(tournament.creatorId, user.id))
          .leftJoin(group, eq(tournament.affiliatedGroupId, group.id))
          .leftJoin(category, eq(tournament.categoryId, category.id))
          .leftJoin(location, eq(tournament.locationId, location.id))
          .leftJoin(parent, eq(tournament.id, parent.id));
      default:
        return query;
    }
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      switch (key) {
        case 'name':
          return eq(tournament.name, value as string);
        case 'type':
          return eq(tournament.tournamentType, value as tournamentTypeEnum);
        case 'location':
          return eq(tournament.locationId, value as number);
        case 'teamType':
          return eq(
            tournament.tournamentTeamType,
            value as tournamentTeamTypeEnum,
          );
        case 'startDate':
          return gte(tournament.startDate, value as Date);
        case 'endDate':
          return lte(tournament.endDate, value as Date);
        case 'isRanked':
          return eq(tournament.isRanked, value as boolean);
        case 'minimumMMR':
          return gte(tournament.minimumMMR, value as number);
        case 'maximumMMR':
          return lte(tournament.maximumMMR, value as number);
        case 'isMultipleTeamsPerGroupAllowed':
          return eq(
            tournament.isMultipleTeamsPerGroupAllowed,
            value as boolean,
          );
        case 'categoryId':
          return eq(tournament, value as number);
        case 'affiliatedGroupId':
          return eq(tournament.affiliatedGroupId, value as number);
        case 'creatorId':
          return eq(tournament.creatorId, value as number);
        case 'minParticipants':
          return gte(
            db.$count(
              participation,
              eq(participation.tournamentId, tournament.id),
            ),
            value as number,
          );
        case 'maxParticipants':
          return lte(tournament.maxParticipants, value as number);
        case 'isPublic':
          return eq(tournament.isPublic, value as boolean);
        default:
          return;
      }
    });
  }

  sortRecord: Record<TournamentSortingEnum, PgColumn | SQL<number>> = {
    [TournamentSortingEnum.NAME]: tournament.name,
    [TournamentSortingEnum.CREATED_AT]: tournament.createdAt,
    [TournamentSortingEnum.UPDATED_AT]: tournament.updatedAt,
    [TournamentSortingEnum.CATEGORY]: tournament.categoryId,
    [TournamentSortingEnum.MINIMUM_MMR]: tournament.minimumMMR,
    [TournamentSortingEnum.MAXIMUM_MMR]: tournament.maximumMMR,
    [TournamentSortingEnum.PARTICIPANT_COUNT]: db.$count(
      participation,
      eq(participation.tournamentId, tournament.id),
    ),
    [TournamentSortingEnum.MAXIMUM_PARTICIPANTS]: tournament.maxParticipants,
    [TournamentSortingEnum.TOURNAMENT_TYPE]: tournament.tournamentType,
    [TournamentSortingEnum.TOURNAMENT_LOCATION]: tournament.tournamentLocation,
    [TournamentSortingEnum.COUNTRY]: tournament.country,
  };

  getMappingObject(responseEnum: TournamentReturnTypesEnumType) {
    switch (responseEnum) {
      case TournamentResponsesEnum.MINI:
        return {
          id: tournament.id,
          name: tournament.name,
          type: tournament.tournamentType,
          startDate: tournament.startDate,
          locationId: tournament.locationId,
        };
      case TournamentResponsesEnum.MINI_WITH_LOGO:
        return {
          ...this.getMappingObject(TournamentResponsesEnum.MINI),
          location: tournament.tournamentLocation,
          logo: tournament.logo,
          country: tournament.country,
        };
      case TournamentResponsesEnum.BASE:
        return {
          ...this.getMappingObject(TournamentResponsesEnum.MINI_WITH_LOGO),
          description: tournament.description,
          teamType: tournament.tournamentTeamType,
          creator: {
            id: user.id,
            username: user.username,
          },
          affiliatedGroup: {
            id: user.id,
            name: user.username,
            abbreviation: user.username,
          },
          endDate: tournament.endDate,
          maxParticipants: tournament.maxParticipants,
          currentParticipants: db.$count(
            participation,
            eq(participation.tournamentId, tournament.id),
          ),
          isPublic: tournament.isPublic,
          category: {
            id: category.id,
            name: category.name,
            logo: category.image,
          },
          actualLocation: {
            id: location.id,
            name: location.name,
            apiId: location.apiId,
            coordinates: location.coordinates,
          },
          links: tournament.links,
        };

      case TournamentResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(TournamentResponsesEnum.BASE),
          createdAt: tournament.createdAt,
          updatedAt: tournament.updatedAt,
          isMultipleTeamsPerGroupAllowed:
            tournament.isMultipleTeamsPerGroupAllowed,
          isFakePlayersAllowed: tournament.isFakePlayersAllowed,
          parentTournament: {
            id: tournament.id,
            name: tournament.name,
            type: tournament.tournamentType,
            startDate: tournament.startDate,
            location: tournament.tournamentLocation,
            logo: tournament.logo,
            country: tournament.country,
          },
          conversionRuleId: tournament.conversionRuleId,
          isRanked: tournament.isRanked,
          maximumMMR: tournament.maximumMMR,
          minimumMMR: tournament.minimumMMR,
        };
      case TournamentDtosEnum.WITH_RELATIONS:
        return {
          id: tournament.id,
          name: tournament.name,
          categoryId: tournament.categoryId,
          affiliatedGroupId: tournament.affiliatedGroupId,
          creatorId: tournament.creatorId,
          parentTournamentId: tournament.parentTournamentId,
        };
      default:
        return {}; // TODO: if this messes up the return type remove it and replace it with null
    }
  }
}
