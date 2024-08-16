import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Max,
  Min,
} from "class-validator";
import { BaseQuery, QueryType } from "src/baseQuery.dto";
import { UserResponseEnumType } from "./userResponses.dto";

export class CreateUserRequest {
  @IsString()
  @Min(3)
  @Max(30)
  name: string;

  @IsString()
  @Min(3)
  @Max(30)
  username: string;

  @IsOptional()
  @Min(3)
  @Max(300)
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

export class UpdateUserInfo {
  @IsOptional()
  @IsString()
  @Min(3)
  @Max(30)
  name: string;

  @IsOptional()
  @IsString()
  @Min(3)
  @Max(30)
  username: string;

  @IsOptional()
  @Min(3)
  @Max(300)
  bio: string;

  @IsOptional()
  @IsUrl()
  profilePicture: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  location: string;
}

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
}

export class FullUserQuery extends BaseQuery<UserResponseEnumType> {
  query: UserQuery;
}

export class SingleUserQuery extends BaseQuery<UserResponseEnumType> {
  query: UserQuery;
}
