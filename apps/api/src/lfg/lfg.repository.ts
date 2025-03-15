import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseQuery } from 'src/base/query/baseQuery';
import {
  user,
  category,
  categoryToLFG,
  categoryCareer,
  lookingForGroup,
  groupToUser,
  groupUserBlockList,
  groupRequirements,
  group,
  eloRequirement,
  follower,
} from 'src/db/schema';
import {
  LFGResponsesEnum,
  LFGResponsesEnumType,
  LFGSortingEnum,
  UserResponsesEnum,
  CategoryResponsesEnum,
} from '@tournament-app/types';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { CategoryDrizzleRepository } from 'src/category/category.repository';
import {
  and,
  ColumnBaseConfig,
  ColumnDataType,
  eq,
  gte,
  InferSelectModel,
  lte,
  notInArray,
  or,
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
import { CreateLFGRequest, LFGQuery, UpdateLFGRequest } from './dto/requests';

@Injectable()
export class LFGDrizzleRepository extends PrimaryRepository<
  typeof lookingForGroup,
  LFGQuery,
  Partial<InferSelectModel<typeof lookingForGroup>>
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly categoryDrizzleRepository: CategoryDrizzleRepository,
  ) {
    super(lookingForGroup);
  }

  insertCategory(categoryId: number, lfgId: number) {
    return db
      .insert(categoryToLFG)
      .values({
        categoryId: categoryId,
        lfgId: lfgId,
      })
      .execute();
  }

  async getForPlayer(userId: number) {
    const lfgList = await db
      .select({
        user: {
          id: user.id,
          name: user.name,
          country: user.country,
          age: sql<number>`EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${user.dateOfBirth}))::INT`, // Check if this is correct
          profilePicture: user.profilePicture,
          followers: db.$count(follower, eq(follower.userId, user.id)),
          username: user.username,
          isFake: user.isFake,
          bio: user.bio,
        },
        message: lookingForGroup.message,
        careers: {
          categoryId: categoryCareer.categoryId,
          elo: categoryCareer.elo,
          userId: categoryCareer.userId,
          createdAt: categoryCareer.createdAt,
        },
        category: {
          id: category.id,
          name: category.name,
          logo: category.image,
        },
        id: lookingForGroup.id,
        createdAt: lookingForGroup.createdAt,
        userId: lookingForGroup.userId,
      })
      .from(lookingForGroup)
      .leftJoin(categoryToLFG, eq(lookingForGroup.id, categoryToLFG.lfgId))
      .leftJoin(category, eq(categoryToLFG.categoryId, category.id))
      .leftJoin(user, eq(lookingForGroup.userId, user.id))
      .leftJoin(
        categoryCareer,
        and(
          eq(category.id, categoryCareer.categoryId),
          eq(categoryCareer.userId, userId),
        ),
      )
      .leftJoin(follower, eq(follower.userId, user.id))
      .where(eq(lookingForGroup.userId, userId))
      .groupBy(
        lookingForGroup.id,
        lookingForGroup.userId,
        lookingForGroup.message,
        lookingForGroup.createdAt,
        user.id,
        user.name,
        user.country,
        user.dateOfBirth,
        user.profilePicture,
        user.username,
        user.bio,
        category.id,
        category.name,
        category.image,
        categoryCareer.elo,
        categoryCareer.categoryId,
        categoryCareer.userId,
        categoryCareer.createdAt,
      );

    // Post processing - careers
    const playerMap = new Map<number, any>();
    for (const row of lfgList) {
      if (!playerMap.has(row?.id)) {
        playerMap.set(row?.id, {
          user: row.user,
          message: row.message,
          id: row.id,
          createdAt: row.createdAt,
          userId: row.userId,
          careers: [],
        });
      }

      if (row.careers?.categoryId !== null && row.category?.id !== null) {
        playerMap.get(row?.id)?.careers.push({
          ...row.careers,
          category: {
            id: row.category?.id,
            name: row.category?.name,
            logo: row.category?.logo,
          },
        });
      }
    }

    return Array.from(playerMap.values());
  }

  getMappingObject(responseType: LFGResponsesEnumType) {
    switch (responseType) {
      case LFGResponsesEnum.MINI:
        return {
          id: lookingForGroup.id,
          userId: lookingForGroup.userId,
          message: lookingForGroup.message,
          createdAt: lookingForGroup.createdAt,
        };
      case LFGResponsesEnum.MINI_WITH_USER:
        return {
          ...this.getMappingObject(LFGResponsesEnum.MINI),
          user: {
            ...this.userDrizzleRepository.getMappingObject(
              UserResponsesEnum.MINI,
            ),
          },
        };
      case LFGResponsesEnum.MINI_WITH_CATEGORY:
        return {
          ...this.getMappingObject(LFGResponsesEnum.MINI),
          categories: {
            ...this.categoryDrizzleRepository.getMappingObject(
              CategoryResponsesEnum.MINI,
            ),
          },
        };
      case LFGResponsesEnum.BASE:
        return {
          ...this.getMappingObject(LFGResponsesEnum.MINI),
          user: {
            ...this.userDrizzleRepository.getMappingObject(
              UserResponsesEnum.BASE,
            ),
          },
          category: {
            ...this.categoryDrizzleRepository.getMappingObject(
              CategoryResponsesEnum.MINI_WITH_LOGO,
            ),
          },
          careers: {
            elo: categoryCareer.elo,
            categoryId: categoryCareer.categoryId,
            userId: categoryCareer.userId,
          },
        };
      default:
        return this.getMappingObject(LFGResponsesEnum.BASE);
    }
  }

  public sortRecord: Record<
    LFGSortingEnum,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {
    [LFGSortingEnum.CREATED_AT]: lookingForGroup.createdAt,
    [LFGSortingEnum.UPDATED_AT]: lookingForGroup.createdAt,
    [LFGSortingEnum.USER_USERNAME]: sql`"user"."username"`,
    [LFGSortingEnum.CATEGORIES]: sql`"category"."name"`,
  };

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: string,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case LFGResponsesEnum.BASE:
        return query
          .leftJoin(categoryToLFG, eq(lookingForGroup.id, categoryToLFG.lfgId))
          .leftJoin(
            categoryCareer,
            and(
              eq(categoryToLFG.categoryId, categoryCareer.categoryId),
              eq(categoryCareer.userId, lookingForGroup.userId),
            ),
          )
          .leftJoin(category, eq(categoryCareer.categoryId, category.id))
          .leftJoin(user, eq(lookingForGroup.userId, user.id))
          .leftJoin(follower, eq(follower.userId, user.id))
          .groupBy(
            lookingForGroup.id,
            lookingForGroup.userId,
            lookingForGroup.message,
            lookingForGroup.createdAt,
            user.id,
            user.name,
            user.country,
            user.dateOfBirth,
            user.profilePicture,
            user.username,
            user.bio,
            category.id,
            category.name,
            category.image,
            categoryCareer.elo,
            categoryCareer.categoryId,
            categoryCareer.userId,
          );
      case LFGResponsesEnum.MINI_WITH_USER:
        return query.leftJoin(user, eq(lookingForGroup.userId, user.id));
      case LFGResponsesEnum.MINI_WITH_CATEGORY:
        return query.leftJoin(
          categoryToLFG,
          eq(lookingForGroup.id, categoryToLFG.lfgId),
        );
      default:
        return query;
    }
  }

  protected getBaseQuery() {
    return db.select().from(lookingForGroup);
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = lookingForGroup[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'userId':
          return eq(lookingForGroup.userId, +parsed);
        case 'categoryId':
          return eq(categoryToLFG.categoryId, +parsed);
        case 'message':
          return sql`${lookingForGroup.message} ILIKE ${`%${parsed}%`}`;
        default:
          return;
      }
    });
  }

  async createWithCareer(createRequest: CreateLFGRequest, userId: number) {
    const transaction = await db.transaction(async (tx) => {
      const lfg = await tx
        .insert(lookingForGroup)
        .values({
          userId,
          message: createRequest.message,
        })
        .returning({ id: lookingForGroup.id });
      const categoryIds = createRequest.categoryIds;

      categoryIds.length > 0 &&
        (await tx.insert(categoryToLFG).values(
          categoryIds.map((categoryId) => ({
            categoryId,
            lfgId: lfg[0].id,
          })),
        ));
    });
    return transaction;
  }

  async updateWithCareer(
    id: number,
    updateRequest: UpdateLFGRequest,
    userId: number,
  ) {
    const transaction = await db.transaction(async (tx) => {
      const lfg = await tx
        .update(lookingForGroup)
        .set({ message: updateRequest.message })
        .where(
          and(eq(lookingForGroup.id, id), eq(lookingForGroup.userId, userId)),
        )
        .returning({ id: lookingForGroup.id });

      if (lfg.length === 0) {
        throw new BadRequestException('No transaction returned');
      }

      const categoryIds = updateRequest.categoryIds;

      categoryIds.length > 0 &&
        (await tx
          .delete(categoryToLFG)
          .where(eq(categoryToLFG.lfgId, lfg[0].id)));

      categoryIds.length > 0 &&
        (await tx.insert(categoryToLFG).values(
          categoryIds.map((categoryId) => ({
            categoryId,
            lfgId: lfg[0].id,
          })),
        ));
    });
    return transaction;
  }

  async deleteLFG(id: number, userId: number) {
    return await db
      .delete(lookingForGroup)
      .where(
        and(eq(lookingForGroup.id, id), eq(lookingForGroup.userId, userId)),
      );
  }

  async getPlayers(groupId: number) {
    // 1. Forbidden Users (Blocked and Group Members) - Correct
    const [blockedIdsResult, groupMembersIdsResult, groupReqsResult] =
      await Promise.all([
        db
          .select({ id: user.id })
          .from(user)
          .innerJoin(
            groupUserBlockList,
            and(
              eq(user.id, groupUserBlockList.blockedUserId),
              eq(groupUserBlockList.groupId, groupId),
            ),
          ),
        db
          .select({ id: user.id })
          .from(user)
          .innerJoin(
            groupToUser,
            and(
              eq(user.id, groupToUser.userId),
              eq(groupToUser.groupId, groupId),
            ),
          ),
        db
          .select({
            //best approach: select nested objects
            groupRequirements: {
              minimumAge: groupRequirements.minimumAge,
              maximumAge: groupRequirements.maximumAge,
              isSameCountry: groupRequirements.isSameCountry,
            },
            group: {
              country: group.country,
            },
            eloRequirement: {
              categoryId: eloRequirement.categoryId,
              minimumElo: eloRequirement.minimumElo,
              maximumElo: eloRequirement.maximumElo,
            },
          })
          .from(groupRequirements)
          .leftJoin(group, eq(groupRequirements.groupId, group.id))
          .leftJoin(
            eloRequirement,
            eq(groupRequirements.groupId, eloRequirement.groupRequirementId),
          )
          .where(eq(groupRequirements.groupId, groupId)),
      ]);

    const blockedIds = blockedIdsResult.map((player) => player.id);
    const groupMemberIds = groupMembersIdsResult.map((player) => player.id);
    const forbiddenIdsArray = [...blockedIds, ...groupMemberIds];

    // Extract relevant data from the results.
    const groupReqs = groupReqsResult[0]
      ? groupReqsResult[0].groupRequirements
      : null;
    const groupCountry = groupReqsResult[0]?.group?.country;

    // 2. ELO Requirements (Prepare for "at least one category" logic)
    // Build a Map to store requirements per category
    const eloReqsMap = new Map<
      number,
      { minElo?: number; maxElo?: number }[]
    >();

    // Populate the map with ELO requirements, grouped by category
    for (const req of groupReqsResult) {
      //make sure requirement exists
      if (req.eloRequirement) {
        const categoryId = req.eloRequirement.categoryId;
        if (!eloReqsMap.has(categoryId)) {
          eloReqsMap.set(categoryId, []);
        }
        //push new requirement to eloReqsMap
        eloReqsMap.get(categoryId)!.push({
          minElo: req.eloRequirement.minimumElo,
          maxElo: req.eloRequirement.maximumElo,
        });
      }
    }

    const eloConditions = [];
    // Iterate through each category in the map
    for (const [categoryId, ranges] of eloReqsMap) {
      // For each category, build conditions to check if user meets ANY of the ranges
      const categoryConditions = ranges.map((range) => {
        const rangeConditions = [];
        if (range.minElo !== undefined) {
          rangeConditions.push(gte(categoryCareer.elo, range.minElo));
        }
        if (range.maxElo !== undefined) {
          rangeConditions.push(lte(categoryCareer.elo, range.maxElo));
        }
        return and(...rangeConditions);
      });

      // Ensure the category ID matches and the user's ELO is within ANY of the valid ranges
      eloConditions.push(
        and(
          eq(categoryCareer.categoryId, categoryId),
          or(...categoryConditions), // Match ANY of the ranges for this category
        ),
      );
    }

    // 3. Age and Country Conditions (Prepare for conditional application)
    const minDOB = groupReqs?.minimumAge
      ? new Date(
          new Date().setFullYear(
            new Date().getFullYear() - groupReqs.minimumAge,
          ),
        )
      : undefined;

    const maxDOB = groupReqs?.maximumAge
      ? new Date(
          new Date().setFullYear(
            new Date().getFullYear() - (groupReqs.maximumAge ?? 100),
          ),
        )
      : undefined;

    // 4. Apply Age Filters (Conditional)
    const ageConditions = [];
    if (groupReqs?.minimumAge !== undefined) {
      ageConditions.push(
        lte(
          sql`date_part('year', age(${user.dateOfBirth}))`,
          groupReqs?.minimumAge,
        ),
      );
    }
    if (groupReqs?.maximumAge !== undefined) {
      ageConditions.push(
        gte(
          sql`date_part('year', age(${user.dateOfBirth}))`,
          groupReqs?.maximumAge,
        ),
      );
    }

    // 5. Prepare and Apply Country Filter (Conditional)
    const countryConditions = [];
    if (groupReqs?.isSameCountry) {
      //check if country is set
      if (!groupCountry) {
        return []; // Or throw error, depending on how you want to handle this
      }
      countryConditions.push(eq(user.country, groupCountry));
    }
    // 6. Main Query Construction

    const players = await db
      .select({
        user: {
          id: user.id,
          name: user.name,
          country: user.country,
          age: sql<number>`EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${user.dateOfBirth}))::INT`, // Check if this is correct
          profilePicture: user.profilePicture,
          followers: db.$count(follower, eq(follower.userId, user.id)),
          username: user.username,
          bio: user.bio,
        },
        message: lookingForGroup.message,
        careers: {
          categoryId: categoryCareer.categoryId,
          elo: categoryCareer.elo,
          userId: categoryCareer.userId,
          createdAt: categoryCareer.createdAt,
        },
        category: {
          id: category.id,
          name: category.name,
          logo: category.image,
        },
        id: lookingForGroup.id,
        createdAt: lookingForGroup.createdAt,
        userId: lookingForGroup.userId,
      })
      .from(lookingForGroup)
      .leftJoin(user, eq(lookingForGroup.userId, user.id))
      .leftJoin(categoryToLFG, eq(lookingForGroup.id, categoryToLFG.lfgId))
      .leftJoin(category, eq(categoryToLFG.categoryId, category.id))
      .leftJoin(
        categoryCareer,
        and(
          eq(categoryCareer.userId, user.id),
          eq(categoryCareer.categoryId, category.id),
        ),
      )
      .leftJoin(follower, eq(follower.userId, user.id))
      .where(
        and(
          notInArray(user.id, forbiddenIdsArray), // Use user.id here
          ...countryConditions,
          ...ageConditions,
          minDOB ? gte(user.dateOfBirth, minDOB) : undefined,
          maxDOB ? lte(user.dateOfBirth, maxDOB) : undefined,
          // eloConditions.length > 0 ? or(...eloConditions) : undefined,
        ),
      )
      .groupBy(
        user.id,
        user.name,
        user.country,
        user.dateOfBirth,
        user.profilePicture,
        user.username,
        user.bio,
        lookingForGroup.message,
        lookingForGroup.id,
        lookingForGroup.createdAt,
        lookingForGroup.userId,
        categoryCareer.categoryId,
        categoryCareer.elo,
        categoryCareer.userId,
        categoryCareer.createdAt,
        category.id,
        category.name,
        category.image,
      ); // Group by user and categoryCareer ID

    const playerMap = new Map<number, any>();
    for (const row of players) {
      if (!playerMap.has(row.user.id)) {
        playerMap.set(row.user.id, {
          user: row.user,
          message: row.message,
          id: row.id,
          createdAt: row.createdAt,
          userId: row.userId,
          careers: [],
        });
      }

      if (row.careers?.categoryId !== null && row.category?.id !== null) {
        playerMap.get(row.user.id).careers.push({
          ...row.careers,
          category: {
            id: row.category?.id,
            name: row.category?.name,
            logo: row.category?.logo,
          },
        });
      }
    }

    return Array.from(playerMap.values());
  }
}
