import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BaseUserResponseType,
  CreateUserRequest,
  FullUserQuery,
  UpdateUserInfo,
  UserResponseEnumType,
  UserResponsesEnum,
} from '@tournament-app/types';
import { UserDrizzleQueryManager } from './queryManager';
import { eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import { user } from 'src/db/schema';

@Injectable()
export class UsersService {
  constructor(private readonly queryManager: UserDrizzleQueryManager) {}
  async create(createUserDto: CreateUserRequest) {
    return await db.insert(user).values(createUserDto).returning({
      id: user.id,
    });
  }

  async findAll<TResponseType extends BaseUserResponseType>(
    query: FullUserQuery,
  ) {
    const queryFunction = this.queryManager.getQuery(query);
    const results = await queryFunction;

    return results as TResponseType[];
  }

  async findOne<TResponseType extends BaseUserResponseType>(
    id: number,
    responseType: UserResponseEnumType = UserResponsesEnum.EXTENDED,
  ) {
    const query = this.queryManager.getSingleQuery(id, responseType);
    const results = await query;

    if (results.length === 0) {
      throw new NotFoundException('User not found');
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateUserDto: UpdateUserInfo) {
    return db.update(user).set(updateUserDto).where(eq(user.id, id)).returning({
      id: user.id,
    }); // TODO: potentially move these to the query manager as a sort of a repo layer
  }

  async remove(id: number) {
    return db.delete(user).where(eq(user.id, id)).returning({
      id: user.id,
    });
  }
}
