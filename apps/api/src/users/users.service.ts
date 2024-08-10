import { Injectable } from '@nestjs/common';
import { db } from 'src/db/db';
import { user } from 'src/db/schema';
import { userToMiniUserMappingObject } from './mappers/response.dto';
import { CreateUserRequest, MiniUserResponse } from '@tournament-app/types';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserRequest) {
    return 'This action adds a new user';
  }

  async findAll() {
    const results: MiniUserResponse[] = await db
      .select(userToMiniUserMappingObject(user))
      .from(user);

    return results;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
