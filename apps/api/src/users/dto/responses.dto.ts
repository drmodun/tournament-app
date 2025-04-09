import { ApiProperty } from '@nestjs/swagger';
import {
  IMiniUserResponse,
  IMiniUserResponseWithProfilePicture,
  IMiniUserResponseWithCountry,
  IUserResponse,
  IExtendedUserResponse,
  IAdminUserResponse,
  subscriptionEnumType,
  userRoleEnumType,
  userRoleEnum,
  subscriptionEnum,
} from '@tournament-app/types';

export class MiniUserResponse implements IMiniUserResponse {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Username of the user',
    example: 'johndoe',
    readOnly: true,
  })
  username: string;

  @ApiProperty({
    description: 'Whether this is a fake user account',
    example: false,
    readOnly: true,
  })
  isFake: boolean;
}

export class MiniUserResponseWithProfilePicture
  extends MiniUserResponse
  implements IMiniUserResponseWithProfilePicture
{
  @ApiProperty({
    description: "URL to the user's profile picture",
    example: 'https://example.com/images/profile.jpg',
    readOnly: true,
  })
  profilePicture: string;
}

export class MiniUserResponseWithCountry
  extends MiniUserResponseWithProfilePicture
  implements IMiniUserResponseWithCountry
{
  @ApiProperty({
    description: 'Two-letter country code where the user is from',
    example: 'US',
    readOnly: true,
  })
  country: string;
}

export class UserResponse
  extends MiniUserResponseWithCountry
  implements IUserResponse
{
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    readOnly: true,
  })
  email: string;

  @ApiProperty({
    description: 'Biography or description of the user',
    example: 'Professional gamer with 5 years of experience',
    readOnly: true,
  })
  bio: string;

  @ApiProperty({
    description: "User's level in the platform",
    example: 42,
    readOnly: true,
  })
  level: number;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'Age of the user',
    example: 28,
    readOnly: true,
  })
  age: number;

  @ApiProperty({
    description: 'Date when the user profile was last updated',
    example: '2023-01-20T09:15:30Z',
    readOnly: true,
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of followers the user has',
    example: 156,
    readOnly: true,
  })
  followers: number;
}

export class ExtendedUserResponse
  extends UserResponse
  implements IExtendedUserResponse
{
  @ApiProperty({
    description: "User's location",
    example: 'New York, USA',
    readOnly: true,
  })
  location: string;

  @ApiProperty({
    description: 'Number of users this user is following',
    example: 89,
    readOnly: true,
  })
  following: number;

  @ApiProperty({
    description: 'Date when the user account was created',
    example: '2022-05-10T14:30:00Z',
    readOnly: true,
  })
  createdAt: Date;
}

export class AdminUserResponse
  extends ExtendedUserResponse
  implements IAdminUserResponse
{
  @ApiProperty({
    description: "User's subscription type",
    enum: Object.values(subscriptionEnum),
    example: 'PREMIUM',
    readOnly: true,
  })
  subscription: subscriptionEnumType;

  @ApiProperty({
    description: "User's role in the platform",
    enum: Object.values(userRoleEnum),
    example: 'ADMIN',
    readOnly: true,
  })
  role: userRoleEnumType;
}
