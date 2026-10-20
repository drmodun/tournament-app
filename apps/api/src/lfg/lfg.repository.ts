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
  eloRequirement,
  group,
  follower,
} from 'src/db/schema';
import {
  BASE_ELO,
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
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right', false>
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
    const [forbiddenUserIds, requirementRows] = await Promise.all([
      this.getUserIdsHiddenFromGroup(groupId),
      this.getGroupRequirementRows(groupId),
    ]);

    const requirements = requirementRows[0]?.groupRequirements ?? null;
    const groupCountry = requirementRows[0]?.group?.country;

    // A same-country requirement cannot be applied to a group without a country
    if (requirements?.isSameCountry && !groupCountry) {
      return [];
    }

    const eloRequirements = requirements
      ? await this.getEloRequirementRows(requirements.id)
      : [];

    const rows = await this.getPlayerRows([
      notInArray(user.id, forbiddenUserIds),
      ...(requirements?.isSameCountry ? [eq(user.country, groupCountry)] : []),
      ...this.getAgeConditions(requirements),
      ...this.getEloConditions(eloRequirements),
    ]);

    return this.groupPlayerRows(rows);
  }

  // Users the group has blocked, plus those who are already members
  private async getUserIdsHiddenFromGroup(groupId: number): Promise<number[]> {
    const [blockedUsers, groupMembers] = await Promise.all([
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
    ]);

    return [...blockedUsers, ...groupMembers].map((player) => player.id);
  }

  private getGroupRequirementRows(groupId: number) {
    return db
      .select({
        //best approach: select nested objects
        groupRequirements: {
          id: groupRequirements.id,
          minimumAge: groupRequirements.minimumAge,
          maximumAge: groupRequirements.maximumAge,
          isSameCountry: groupRequirements.isSameCountry,
        },
        group: {
          country: group.country,
        },
      })
      .from(groupRequirements)
      .leftJoin(group, eq(groupRequirements.groupId, group.id))
      .where(eq(groupRequirements.groupId, groupId));
  }

  private getEloRequirementRows(groupRequirementId: number) {
    return db
      .select({
        categoryId: eloRequirement.categoryId,
        minimumElo: eloRequirement.minimumElo,
        maximumElo: eloRequirement.maximumElo,
      })
      .from(eloRequirement)
      .where(eq(eloRequirement.groupRequirementId, groupRequirementId));
  }

  // A player without a career in the category is rated at the base rating
  private getEloConditions(
    eloRequirements: {
      categoryId: number;
      minimumElo: number | null;
      maximumElo: number | null;
    }[],
  ): SQL[] {
    return eloRequirements.flatMap((requirement) => {
      const elo = sql`coalesce((
        select ${categoryCareer.elo} from ${categoryCareer}
        where ${categoryCareer.userId} = ${user.id}
          and ${categoryCareer.categoryId} = ${requirement.categoryId}
      ), ${BASE_ELO})`;

      return [
        ...(requirement.minimumElo != null
          ? [gte(elo, requirement.minimumElo)]
          : []),
        ...(requirement.maximumElo != null
          ? [lte(elo, requirement.maximumElo)]
          : []),
      ];
    });
  }

  private getAgeConditions(
    requirements: { minimumAge?: number; maximumAge?: number } | null,
  ): SQL[] {
    const conditions: SQL[] = [];
    const age = sql`date_part('year', age(${user.dateOfBirth}))`;

    // A missing bound (null in the database) means no limit on that side
    if (requirements?.minimumAge != null) {
      conditions.push(gte(age, requirements.minimumAge));
    }

    if (requirements?.maximumAge != null) {
      conditions.push(lte(age, requirements.maximumAge));
    }

    return conditions;
  }

  // One row per looking-for-group post and category the player listed on it
  private getPlayerRows(conditions: SQL[]) {
    return db
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
      .where(and(...conditions))
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
  }

  private groupPlayerRows(
    rows: Awaited<ReturnType<LFGDrizzleRepository['getPlayerRows']>>,
  ) {
    const playerMap = new Map<number, any>();

    for (const row of rows) {
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
