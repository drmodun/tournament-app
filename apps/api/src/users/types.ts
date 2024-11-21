import {
  BaseUserResponseType,
  UserResponseEnumType,
} from '@tournament-app/types';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';

export type DtoType = ValidatedUserDto;

export enum UserDtosEnum {
  ValidatedUserDto = 'auth',
}

export type UserDtosEnumType = (typeof UserDtosEnum)[keyof typeof UserDtosEnum];

export type AnyUserReturnType = DtoType | BaseUserResponseType;
export type UserReturnTypesEnum = UserDtosEnum | UserResponseEnumType;
