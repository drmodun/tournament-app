import { Injectable } from '@nestjs/common';
import { BaseQuery } from 'src/base/query/baseQuery';
import {
  category,
  categoryToLFP,
  lookingForPlayers,
  groupToUser,
  groupRequirements,
  group,
  eloRequirement,
  location,
  userGroupBlockList,
} from 'src/db/schema';
import {
  GroupResponsesEnum,
  CategoryResponsesEnum,
  LocationResponsesEnum,
  IGetLFPRequest,
} from '@tournament-app/types';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import { CategoryDrizzleRepository } from 'src/category/category.repository';
import {
  and,
  ColumnBaseConfig,
  ColumnDataType,
  eq,
  InferSelectModel,
  notInArray,
  sql,
  SQL,
} from 'drizzle-orm';
import { PrimaryRepository } from 'src/base/repository/primaryRepository';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import { LFPQueryDto } from './dto/requests';
import { LocationDrizzleRepository } from 'src/location/location.repository';
import { LocationHelper } from 'src/base/static/locationHelper';

@Injectable()
export class LFPDrizzleRepository extends PrimaryRepository<
  typeof lookingForPlayers,
  LFPQueryDto,
  Partial<InferSelectModel<typeof lookingForPlayers>>
> {
  constructor(
    private readonly groupDrizzleRepository: GroupDrizzleRepository,
    private readonly categoryDrizzleRepository: CategoryDrizzleRepository,
    private readonly locationDrizzleRepository: LocationDrizzleRepository,
  ) {
    super(lookingForPlayers);
  }

  getMappingObject(responseType: string) {
    switch (responseType) {
      case 'mini':
        return {
          id: lookingForPlayers.id,
          groupId: lookingForPlayers.groupId,
          message: lookingForPlayers.message,
          createdAt: lookingForPlayers.createdAt,
        };
      case 'base':
        return {
          ...this.getMappingObject('mini'),
          group: {
            ...this.groupDrizzleRepository.getMappingObject(
              GroupResponsesEnum.BASE,
            ),
          },
          categories: {
            ...this.categoryDrizzleRepository.getMappingObject(
              CategoryResponsesEnum.MINI_WITH_LOGO,
            ),
          },
        };
      default:
        return this.getMappingObject('base');
    }
  }

  public sortRecord: Record<
    string,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {};

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    return query;
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = lookingForPlayers[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'groupId':
          return eq(lookingForPlayers.groupId, +parsed);
        case 'categoryId':
          return eq(categoryToLFP.categoryId, +parsed);
        case 'message':
          return sql`${lookingForPlayers.message} ILIKE ${`%${parsed}%`}`;
        default:
          return;
      }
    });
  }

  async deleteLFP(id: number) {
    return await db
      .delete(lookingForPlayers)
      .where(eq(lookingForPlayers.id, id));
  }

  async getGroups(userId: number, { lng, lat, distance }: IGetLFPRequest) {
    // 1. Get blocked groups and groups user is member of
    const [blockedGroupsResult, userGroupsResult] = await Promise.all([
      db
        .select({ id: group.id })
        .from(group)
        .innerJoin(
          userGroupBlockList,
          eq(group.id, userGroupBlockList.blockedGroupId),
        )
        .where(eq(userGroupBlockList.userId, userId)),
      db
        .select({ id: group.id })
        .from(group)
        .innerJoin(groupToUser, eq(group.id, groupToUser.groupId))
        .where(eq(groupToUser.userId, userId)),
    ]);

    const blockedGroupIds = blockedGroupsResult.map((group) => group.id);
    const userGroupIds = userGroupsResult.map((group) => group.id);
    const forbiddenGroupIds = [...blockedGroupIds, ...userGroupIds];

    const distanceInKm = distance ? distance * 1000 : null;

    // 2. Main Query
    const lfpList = await db
      .select({
        id: lookingForPlayers.id,
        groupId: lookingForPlayers.groupId,
        message: lookingForPlayers.message,
        createdAt: lookingForPlayers.createdAt,
        group: {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.BASE,
          ),
        },
        location: {
          ...this.locationDrizzleRepository.getMappingObject(
            LocationResponsesEnum.BASE,
          ),
        },
        groupRequirements: {
          id: groupRequirements.id,
          groupId: groupRequirements.groupId,
          minimumAge: groupRequirements.minimumAge,
          maximumAge: groupRequirements.maximumAge,
          isSameCountry: groupRequirements.isSameCountry,
        },
        eloRequirements: {
          id: eloRequirement.id,
          categoryId: eloRequirement.categoryId,
          minimumElo: eloRequirement.minimumElo,
          maximumElo: eloRequirement.maximumElo,
        },
        category: {
          ...this.categoryDrizzleRepository.getMappingObject(
            CategoryResponsesEnum.MINI_WITH_LOGO,
          ),
        },
      })
      .from(lookingForPlayers)
      .leftJoin(group, eq(lookingForPlayers.groupId, group.id))
      .leftJoin(location, eq(group.locationId, location.id))
      .leftJoin(groupRequirements, eq(group.id, groupRequirements.groupId))
      .leftJoin(
        eloRequirement,
        eq(groupRequirements.id, eloRequirement.groupRequirementId),
      )
      .leftJoin(category, eq(eloRequirement.categoryId, category.id))
      .where(
        and(
          notInArray(group.id, forbiddenGroupIds),
          distanceInKm & lat & lng
            ? sql`ST_DWithin(
              ${location.coordinates},
              ${LocationHelper.ST_GeographyFromText(
                LocationHelper.ConvertToWKT(lng, lat),
              )},
              ${distanceInKm}
            )`
            : undefined,
        ),
      )
      .groupBy(
        lookingForPlayers.id,
        lookingForPlayers.groupId,
        lookingForPlayers.message,
        lookingForPlayers.createdAt,
        group.id,
        group.name,
        group.abbreviation,
        group.logo,
        group.description,
        group.country,
        group.type,
        group.focus,
        category.id,
        category.name,
        category.image,
        location.id,
        location.name,
        location.coordinates,
        groupRequirements.id,
        groupRequirements.groupId,
        groupRequirements.minimumAge,
        groupRequirements.maximumAge,
        groupRequirements.isSameCountry,
        eloRequirement.id,
        eloRequirement.categoryId,
      );

    // Post processing - categories
    const lfpMap = new Map<number, any>();
    for (const row of lfpList) {
      if (!lfpMap.has(row?.id)) {
        lfpMap.set(row?.id, {
          group: row.group,
          message: row.message,
          id: row.id,
          createdAt: row.createdAt,
          groupId: row.groupId,
          location: row.location,
          groupRequirements: {
            ...row.groupRequirements,
            eloRequirements: [],
          },
        });
      }

      if (row.eloRequirements?.id !== null) {
        lfpMap.get(row?.id)?.groupRequirements?.eloRequirements?.push({
          id: row.eloRequirements?.id,
          categoryId: row.eloRequirements?.categoryId,
          minimumElo: row.eloRequirements?.minimumElo,
          maximumElo: row.eloRequirements?.maximumElo,
          category: row.category, // I guess check this again later
        });
      }
    }

    return Array.from(lfpMap.values());
  }
}
