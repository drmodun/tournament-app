import {
  BaseUserResponseType,
  UserResponseEnumType,
} from '@tournament-app/types';
import { UserCredentialsDto } from 'src/auth/dto/userCredentials.dto';
import {
  EmailConfirmationTokenDto,
  PasswordResetTokenDto,
  ValidatedUserDto,
} from 'src/auth/dto/validatedUser.dto';

export type DtoType =
  | ValidatedUserDto
  | UserCredentialsDto
  | PasswordResetTokenDto
  | EmailConfirmationTokenDto;

export enum UserDtosEnum {
  VALIDATED = 'auth',
  CREDENTIALS = 'credentials',
  PASSWORD_RESET_TOKEN = 'passwordResetToken',
  EMAIL_CONFIRMATION_TOKEN = 'emailConfirmationToken',
}

export type UserDtosEnumType = (typeof UserDtosEnum)[keyof typeof UserDtosEnum];

export type AnyUserReturnType = DtoType | BaseUserResponseType;

export type UserReturnTypesEnumType = UserDtosEnumType | UserResponseEnumType;
