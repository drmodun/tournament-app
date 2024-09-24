import { ApiResponseProperty } from '@nestjs/swagger';
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
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  username: string;
}

export class MiniUserResponseWithProfilePicture
  extends MiniUserResponse
  implements IMiniUserResponseWithProfilePicture
{
  @ApiResponseProperty()
  profilePicture: string;
}

export class MiniUserResponseWithCountry
  extends MiniUserResponseWithProfilePicture
  implements IMiniUserResponseWithCountry
{
  @ApiResponseProperty()
  country: string;
}

export class UserResponse
  extends MiniUserResponseWithCountry
  implements IUserResponse
{
  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  bio: string;

  @ApiResponseProperty()
  level: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  updatedAt: Date;

  @ApiResponseProperty()
  followers: number;
}

export class ExtendedUserResponse
  extends UserResponse
  implements IExtendedUserResponse
{
  @ApiResponseProperty()
  location: string;

  @ApiResponseProperty()
  following: number;

  @ApiResponseProperty()
  createdAt: Date;
}

export class AdminUserResponse
  extends ExtendedUserResponse
  implements IAdminUserResponse
{
  @ApiResponseProperty({ enum: Object.values(subscriptionEnum) })
  subscription: subscriptionEnumType;

  @ApiResponseProperty()
  password: string;

  @ApiResponseProperty({ enum: Object.values(userRoleEnum) })
  role: userRoleEnumType;

  @ApiResponseProperty()
  code: string;
}

export const defaultExample = {
  bio: 'I am a cool person',
  country: 'USA',
  email: 'john.doe@example.com',
  followers: 0,
  id: 1,
  level: 0,
  name: 'John Doe',
  profilePicture: 'https://example.com/image.jpg',
  updatedAt: new Date(),
  username: 'john_doe',
} satisfies UserResponse;
