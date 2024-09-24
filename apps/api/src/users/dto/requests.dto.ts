import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateUserRequest,
  IUpdateEmailRequest,
  IUpdatePasswordRequest,
  IUpdateUserInfo,
  UserQueryType,
  UserResponseEnumType,
} from '@tournament-app/types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

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
  @IsUrl()
  @ApiPropertyOptional()
  profilePicture?: string;

  @IsString()
  @ApiProperty()
  country: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  location?: string;
}

export class UpdateUserInfo implements IUpdateUserInfo {
  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  profilePicture?: string;

  @IsOptional()
  @ApiPropertyOptional()
  country?: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  username?: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(300)
  @ApiPropertyOptional()
  bio?: string;

  @IsOptional()
  @ApiPropertyOptional()
  location?: string;
}

export class UpdatePasswordRequest implements IUpdatePasswordRequest {
  @IsStrongPassword()
  password: string;
} // TODO: possibly move to auth

export class UpdateEmailRequest implements IUpdateEmailRequest {
  @IsEmail()
  email: string;
}

export class UserQuery
  extends BaseQuery<UserResponseEnumType>
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
}
