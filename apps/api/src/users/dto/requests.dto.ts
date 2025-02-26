import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateUserRequest,
  IUpdateEmailRequest,
  IUpdateUserInfo,
  UserQueryType,
} from '@tournament-app/types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
  IsStrongPassword,
  IsBoolean,
  IsDate,
  IsNumber,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';
import { UserReturnTypesEnumType } from '../types';
import { Transform, Type } from 'class-transformer';

export class CreateUserRequest implements ICreateUserRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiPropertyOptional()
  bio?: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsStrongPassword()
  @ApiProperty()
  password: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFake?: boolean;

  @IsOptional()
  @ApiPropertyOptional()
  profilePicture?: string;

  @IsString()
  @ApiProperty()
  country: string;

  @IsDate()
  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  dateOfBirth: Date;
}

export class UpdateUserInfo implements IUpdateUserInfo {
  @ApiPropertyOptional()
  @IsOptional()
  profilePicture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(3)
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  location?: string;
}

export class UpdatePasswordRequest {
  @IsStrongPassword()
  password: string;

  @IsString()
  currentPassword: string;
} // TODO: possibly move to auth

export class UpdateEmailRequest implements IUpdateEmailRequest {
  @IsEmail()
  email: string;

  @IsString()
  currentPassword: string;
}

export class UserQuery
  extends BaseQuery<UserReturnTypesEnumType>
  implements UserQueryType
{
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  age?: number;
}

//TODO: test query params more carefully and see if more transformations have to be done
