import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Max,
  MaxLength,
  MinLength,
  Min,
} from "class-validator";
import { BaseQuery, QueryType } from "src/baseQuery.dto";
import { UserResponseEnumType } from "./userResponses.dto";
import { Exclude } from "class-transformer";
import { Omit } from "src/baseActionResponse";

export class CreateUserRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  bio: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsUrl()
  profilePicture: string;

  @IsString()
  country: string;

  @IsOptional()
  location: string;
}

export class UpdateUserInfo extends Omit(CreateUserRequest, [
  "password",
  "email",
]) {
  @IsOptional()
  @Exclude()
  email: string;

  @IsOptional()
  @Exclude()
  password: string;
} // TODO: potentially remove this cause it's painful

export type BaseUserUpdateRequest = UpdateUserInfo | CreateUserRequest;

export class UpdatePasswordRequest {
  @IsStrongPassword()
  password: string;
} // TODO: possibly move to auth

export class UpdateEmailRequest {
  @IsEmail()
  email: string;
}

export interface UserQuery extends QueryType {
  name?: string;
  username?: string;
  email?: string;
  country?: string;
  location?: string;
} // TODO: potentially add checks for this as well

export class FullUserQuery extends BaseQuery<UserResponseEnumType> {
  query: UserQuery;
}

export class SingleUserQuery extends BaseQuery<UserResponseEnumType> {
  query: UserQuery;
}
