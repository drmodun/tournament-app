import {
  BaseUserResponseType,
  UserResponseEnumType,
} from '@tournament-app/types';
import { UserCredentialsDto } from 'src/auth/dto/userCredentials.dto';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';

export type DtoType = ValidatedUserDto | UserCredentialsDto;

export enum UserDtosEnum {
  VALIDATED = 'auth',
  CREDENTIALS = 'credentials',
}

export type UserDtosEnumType = (typeof UserDtosEnum)[keyof typeof UserDtosEnum];

export type AnyUserReturnType = DtoType | BaseUserResponseType;

export type UserReturnTypesEnumType = UserDtosEnumType | UserResponseEnumType;
