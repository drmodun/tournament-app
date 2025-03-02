import {
  BaseUserUpdateRequest,
  ICareerUserResponse,
  IMiniUserResponseWithProfilePicture,
  UserResponsesEnum,
  UserSortingEnum,
  UserSortingEnumType,
} from '@tournament-app/types';
import {
  category,
  categoryCareer,
  follower,
  groupToUser,
  groupUserBlockList,
  interests,
  participation,
  tournament,
  user,
} from '../db/schema';
import {
  alias,
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelect,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from '../db/db';
import {
  and,
  asc,
  countDistinct,
  eq,
  gte,
  ilike,
  inArray,
  InferInsertModel,
  lt,
  lte,
  sql,
  SQL,
} from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { UserQuery } from './dto/requests.dto';
import { UserDtosEnum, UserReturnTypesEnumType } from './types';
import { PaginationOnly } from 'src/base/query/baseQuery';

@Injectable()
export class UserDrizzleRepository extends PrimaryRepository<
  typeof user,
  UserQuery,
  BaseUserUpdateRequest
> {
  constructor() {
    super(user);
  }
  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: UserReturnTypesEnumType,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case UserResponsesEnum.BASE:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .groupBy(user.id);

      case UserResponsesEnum.ADMIN:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .leftJoin(
            alias(follower, 'followingAlias'),
            eq(user.id, follower.followerId),
          )
          .groupBy(user.id);
      default:
        return query;
    }
  }

  public getMappingObject(
    responseEnum: UserReturnTypesEnumType, //TODO: add dtos as seperate mapping types
  ) {
    switch (responseEnum) {
      case UserResponsesEnum.MINI:
        return {
          id: user.id,
          username: user.username,
          isFake: user.isFake,
        };
      case UserResponsesEnum.MINI_WITH_PFP:
        return {
          ...this.getMappingObject(UserResponsesEnum.MINI),
          profilePicture: user.profilePicture,
        };
      case UserResponsesEnum.MINI_WITH_COUNTRY:
        return {
          ...this.getMappingObject(UserResponsesEnum.MINI_WITH_PFP),
          country: user.country,
        };
      case UserResponsesEnum.BASE:
        return {
          ...this.getMappingObject(UserResponsesEnum.MINI_WITH_COUNTRY),
          bio: user.bio,
          email: user.email,
          level: user.level,
          name: user.name,
          age: sql<number>`EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${user.dateOfBirth}))::INT`, // Check if this is correct
          updatedAt: user.updatedAt,
          followers: db.$count(follower, eq(follower.userId, user.id)),
        };
      case UserResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(UserResponsesEnum.BASE),
          following: db.$count(follower, eq(follower.followerId, user.id)),
          createdAt: user.createdAt,
        };
      case UserResponsesEnum.ADMIN:
        return {
          ...this.getMappingObject(UserResponsesEnum.EXTENDED),
          password: user.password,
          role: user.role,
          passwordResetToken: user.passwordResetToken,
          passwordResetTokenExpiresAt: user.passwordResetTokenExpiresAt,
          emailConfirmationToken: user.emailConfirmationToken,
          sseToken: user.sseToken,
        };
      case UserDtosEnum.VALIDATED:
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isFake: user.isFake,
        };
      case UserDtosEnum.CREDENTIALS:
        return {
          id: user.id,
          role: user.role,
          email: user.email,
          password: user.password,
        };
      case UserDtosEnum.PASSWORD_RESET_TOKEN:
        return {
          passwordResetToken: user.passwordResetToken,
          passwordResetTokenExpiresAt: user.passwordResetTokenExpiresAt,
          email: user.email,
          username: user.username,
        };
      case UserDtosEnum.EMAIL_CONFIRMATION_TOKEN:
        return {
          emailConfirmationToken: user.emailConfirmationToken,
          email: user.email,
          username: user.username,
        };
      case UserDtosEnum.SSE_TOKEN:
        return {
          sseToken: user.sseToken,
        };
      default:
        return null;
    }
  }

  public confirmUserEmail(token: string) {
    return db
      .update(user)
      .set({ isEmailVerified: true } as Partial<InferInsertModel<typeof user>>)
      .where(eq(user.emailConfirmationToken, token))
      .returning({
        isEmailVerified: user.isEmailVerified,
      });
  }

  public insertPaswordResetToken(
    token: string,
    email: string,
    expiresAt: Date,
  ) {
    return db
      .update(user)
      .set({
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expiresAt,
      } as Partial<InferInsertModel<typeof user>>)
      .where(eq(user.email, email))
      .returning({
        passwordResetToken: user.passwordResetToken,
        passwordResetTokenExpiresAt: user.passwordResetTokenExpiresAt,
        email: user.email,
        username: user.username,
      });
  }

  public resetPassword(token: string, password: string) {
    return db
      .update(user)
      .set({ password: password } as Partial<InferInsertModel<typeof user>>)
      .where(
        and(
          eq(user.passwordResetToken, token),
          gte(user.passwordResetTokenExpiresAt, new Date()),
        ),
      )
      .returning({
        password: user.password,
      });
  }

  public insertEmailConfirmationToken(token: string, userId: number) {
    return db
      .update(user)
      .set({
        emailConfirmationToken: token,
      } as Partial<InferInsertModel<typeof user>>)
      .where(eq(user.id, userId))
      .returning({
        email: user.email,
        username: user.username,
        emailConfirmationToken: user.emailConfirmationToken,
      });
  }

  public sortRecord: Record<UserSortingEnumType, PgColumn | SQL<number>> = {
    // Maybe make this into a factory function
    [UserSortingEnum.USERNAME]: user.username,
    [UserSortingEnum.LEVEL]: user.level,
    [UserSortingEnum.COUNTRY]: user.country,
    [UserSortingEnum.BETTING_POINTS]: user.bettingPoints,
    [UserSortingEnum.GROUP_JOIN_DATE]: groupToUser.createdAt,
    [UserSortingEnum.TOURNAMENTS_MODERATED]: countDistinct(tournament.id),
    [UserSortingEnum.TOURNAMENTS_WON]: countDistinct(
      participation.tournamentId, // TODO: add calculation later or scrap allTogether
    ),
    [UserSortingEnum.UPDATED_AT]: user.createdAt,
    [UserSortingEnum.TOURNAMENT_PARTICIPATION]: countDistinct(
      participation.tournamentId,
    ),
  };

  getValidWhereClause(query: UserQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = user[key];
      if (!field) return;
      const parsed = value;

      // TODO: some type fixes

      switch (key) {
        case 'name':
          return eq(user.name, parsed);
        case 'username':
          return eq(user.username, parsed);
        case 'email':
          return eq(user.email, parsed);
        case 'search':
          return ilike(user.username, `${parsed}%`);
        case 'country':
          return eq(user.country, parsed);
        case 'age':
          const today = new Date();
          const age = today.getFullYear() - (parsed as number);
          const dateOfBirth = new Date(age);

          return eq(user.dateOfBirth, dateOfBirth);
        default:
          return;
      }
    });
  }

  getSingleQuery(
    id: number,
    responseType: UserReturnTypesEnumType = UserResponsesEnum.BASE,
  ) {
    const selectedType = this.getMappingObject(responseType);
    const baseQuery = db
      .select(selectedType)
      .from(user)
      .where(and(eq(user.id, id), eq(user.isEmailVerified, true)))
      .$dynamic() as PgSelect<'user', typeof selectedType>;

    const Query = this.conditionallyJoin(baseQuery, responseType);

    return Query;
  }

  getSingleQueryIncludingFake(
    id: number,
    responseType: UserReturnTypesEnumType = UserResponsesEnum.BASE,
  ) {
    const selectedType = this.getMappingObject(responseType);
    const baseQuery = db
      .select(selectedType)
      .from(user)
      .where(eq(user.id, id))
      .$dynamic() as PgSelect<'user', typeof selectedType>;

    const Query = this.conditionallyJoin(baseQuery, responseType);

    return Query;
  }

  async checkIfUserIsBlocked(groupId: number, userId: number) {
    const exists = await db
      .select()
      .from(groupUserBlockList)
      .where(
        and(
          eq(groupUserBlockList.blockedUserId, userId),
          eq(groupUserBlockList.groupId, groupId),
        ),
      )
      .limit(1);

    return !!exists.length;
  }

  async userAutoComplete(
    search: string,
    pageSize: number = 10,
    page: number = 1,
  ): Promise<IMiniUserResponseWithProfilePicture[]> {
    return (await db
      .select({ ...this.getMappingObject(UserResponsesEnum.MINI_WITH_PFP) })
      .from(user)
      .where(ilike(user.username, `${search}%`))
      .orderBy(
        sql<number>`CASE WHEN ${user.username} = ${search} THEN 0 ELSE 1 END`,
        asc(user.username),
      )
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as IMiniUserResponseWithProfilePicture[];
  }

  async blockUser(groupId: number, userId: number) {
    await db.insert(groupUserBlockList).values({
      blockedUserId: userId,
      groupId,
    });
  }

  async unblockUser(groupId: number, userId: number) {
    await db
      .delete(groupUserBlockList)
      .where(
        and(
          eq(groupUserBlockList.blockedUserId, userId),
          eq(groupUserBlockList.groupId, groupId),
        ),
      );
  }

  async createInterest(categoryId: number, userId: number) {
    await db.insert(interests).values({
      categoryId,
      userId,
    });
  }

  async deleteInterest(categoryId: number, userId: number) {
    await db
      .delete(interests)
      .where(
        and(eq(interests.categoryId, categoryId), eq(interests.userId, userId)),
      );
  }

  async searchBlockedUsers(
    search: string,
    groupId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return (await db
      .select({
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        isFake: user.isFake,
      })
      .from(groupUserBlockList)
      .rightJoin(user, eq(user.id, groupUserBlockList.blockedUserId))
      .where(
        and(
          ilike(user.username, `${search}%`),
          eq(groupUserBlockList.groupId, groupId),
        ),
      )
      .orderBy(
        sql<number>`CASE WHEN ${user.username} = ${search} THEN 0 ELSE 1 END`,
        asc(user.username),
      )
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as IMiniUserResponseWithProfilePicture[];
  }

  async checkIfInterestExists(categoryId: number, userId: number) {
    const exists = await db
      .select()
      .from(interests)
      .where(
        and(eq(interests.categoryId, categoryId), eq(interests.userId, userId)),
      );

    return !!exists.length;
  }

  async getInterestCategories(userId: number, page: number, pageSize: number) {
    return db
      .select({
        id: category.id,
        name: category.name,
        image: category.image,
        type: category.type,
        description: category.description,
      })
      .from(interests)
      .where(eq(interests.userId, userId))
      .leftJoin(category, eq(interests.categoryId, category.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .groupBy(category.id);
  }

  async getMultipleCareers(
    userIds: number[],
    categoryId: number,
  ): Promise<ICareerUserResponse[]> {
    // TODO: move this to the career repository if we decide to create it
    return await db
      .select({
        userId: categoryCareer.userId,
        categoryId: categoryCareer.categoryId,
        elo: categoryCareer.elo,
        createdAt: categoryCareer.createdAt,
        user: {
          id: user.id,
          isFake: user.isFake,
          username: user.username,
          profilePicture: user.profilePicture,
          country: user.country,
        },
      })
      .from(categoryCareer)
      .where(
        and(
          inArray(categoryCareer.userId, userIds),
          eq(categoryCareer.categoryId, categoryId),
        ),
      );
  }

  getBlockedUsers(groupId: number, page: number, pageSize: number) {
    return db
      .select({
        id: user.id,
        username: user.username,
        profilePic: user.profilePicture,
        country: user.country,
      })
      .from(groupUserBlockList)
      .where(eq(groupUserBlockList.groupId, groupId))
      .rightJoin(user, eq(user.id, groupUserBlockList.blockedUserId))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .groupBy(user.id);
  }
}
