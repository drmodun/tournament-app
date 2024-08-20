import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BaseUserResponseType,
  CreateUserRequest,
  FullUserQuery,
  UpdateUserInfo,
  UserResponseEnumType,
  UserResponsesEnum,
} from '@tournament-app/types';
import { UserDrizzleRepository } from './user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserDrizzleRepository) {}
  async create(createUserDto: CreateUserRequest) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    createUserDto.password = hashedPassword;

    const action = await this.repository.createEntity(createUserDto);

    if (!action[0]) {
      throw new UnprocessableEntityException('User creation failed');
    }

    return action[0];
  }

  async findAll<TResponseType extends BaseUserResponseType>(
    query: FullUserQuery,
  ) {
    const queryFunction = this.repository.getQuery(query);
    const results = await queryFunction;

    return results as TResponseType[];
  }

  async findOne<TResponseType extends BaseUserResponseType>(
    id: number,
    responseType: UserResponseEnumType = UserResponsesEnum.EXTENDED,
  ) {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (results.length === 0) {
      throw new NotFoundException('User not found');
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateUserDto: UpdateUserInfo) {
    const action = await this.repository.updateEntity(id, updateUserDto);

    if (!action[0]) {
      throw new BadRequestException('User update failed or user not found');
    }

    return action[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException('User removal failed or user not found');
    }

    return action[0];
  }
}
