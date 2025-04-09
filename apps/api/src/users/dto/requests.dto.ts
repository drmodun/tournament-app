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
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 3,
    maxLength: 30,
  })
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({
    description: 'Username for the user account',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiPropertyOptional({
    description: 'Biography or description of the user',
    example: 'Professional gamer with 5 years of experience',
    minLength: 3,
    maxLength: 300,
    nullable: true,
  })
  bio?: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email address for the user account',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @IsStrongPassword()
  @ApiProperty({
    description:
      'Password for the user account (must meet strong password requirements)',
    example: 'P@ssw0rd123!',
    format: 'password',
  })
  password: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether this is a fake user account',
    example: false,
    default: false,
    nullable: true,
  })
  isFake?: boolean;

  @IsOptional()
  @ApiPropertyOptional({
    description: "URL to the user's profile picture",
    example: 'https://example.com/images/profile.jpg',
    nullable: true,
  })
  profilePicture?: string;

  @IsString()
  @ApiProperty({
    description: 'Two-letter country code where the user is from',
    example: 'US',
    minLength: 2,
    maxLength: 2,
  })
  country: string;

  @IsDate()
  @ApiProperty({
    description: "User's date of birth",
    example: '1995-06-15',
    type: Date,
  })
  @Transform(({ value }) => new Date(value))
  dateOfBirth: Date;
}

export class UpdateUserInfo implements IUpdateUserInfo {
  @ApiPropertyOptional({
    description: "URL to the user's profile picture",
    example: 'https://example.com/images/profile.jpg',
    nullable: true,
  })
  @IsOptional()
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'Two-letter country code where the user is from',
    example: 'US',
    minLength: 2,
    maxLength: 2,
    nullable: true,
  })
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Username for the user account',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
    nullable: true,
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 3,
    maxLength: 30,
    nullable: true,
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  name?: string;

  @ApiPropertyOptional({
    description: 'Biography or description of the user',
    example: 'Professional gamer with 5 years of experience',
    minLength: 3,
    maxLength: 300,
    nullable: true,
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional({
    description: "User's date of birth",
    example: '1995-06-15',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: "User's location",
    example: 'New York, USA',
    nullable: true,
  })
  @IsOptional()
  location?: string;
}

export class UpdatePasswordRequest {
  @IsStrongPassword()
  @ApiProperty({
    description:
      'New password for the user account (must meet strong password requirements)',
    example: 'NewP@ssw0rd123!',
    format: 'password',
  })
  password: string;

  @IsString()
  @ApiProperty({
    description: "Current password to verify the user's identity",
    example: 'CurrentP@ssw0rd123!',
    format: 'password',
  })
  currentPassword: string;
}

export class UpdateEmailRequest implements IUpdateEmailRequest {
  @IsEmail()
  @ApiProperty({
    description: 'New email address for the user account',
    example: 'new.email@example.com',
    format: 'email',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: "Current password to verify the user's identity",
    example: 'CurrentP@ssw0rd123!',
    format: 'password',
  })
  currentPassword: string;
}

export class UserQuery
  extends BaseQuery<UserReturnTypesEnumType>
  implements UserQueryType
{
  @ApiPropertyOptional({
    description: 'Filter users by name',
    example: 'John',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter users by username',
    example: 'johndoe',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Filter users by email',
    example: 'john.doe@example.com',
    format: 'email',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter users by country code',
    example: 'US',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter users by location',
    example: 'New York',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter users by age',
    example: 25,
    type: Number,
    nullable: true,
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  age?: number;
}
