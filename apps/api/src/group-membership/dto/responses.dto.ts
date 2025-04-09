import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IMinimalMembershipResponse,
  IGroupMembershipResponse,
  IUserMembershipResponseWithDates,
  IGroupMembershipResponseWithDates,
  groupRoleEnumType,
  groupRoleEnum,
} from '@tournament-app/types';
import {
  MiniGroupResponseWithLogo,
  MiniGroupResponseWithCountry,
} from '../../group/dto/responses.dto';
import {
  MiniUserResponseWithProfilePicture,
  MiniUserResponseWithCountry,
} from '../../users/dto/responses.dto';

export class MinimalMembershipResponse implements IMinimalMembershipResponse {
  @ApiProperty({
    description: 'Group ID',
    readOnly: true,
    example: 123,
  })
  groupId: number;

  @ApiProperty({
    description: 'User ID',
    readOnly: true,
    example: 456,
  })
  userId: number;

  @ApiProperty({
    enum: groupRoleEnum,
    readOnly: true,
    example: 'admin',
    description: 'Role',
  })
  role: groupRoleEnumType;
}

export class GroupMembershipResponse implements IGroupMembershipResponse {
  @ApiProperty({
    description: 'Group ID',
    readOnly: true,
    example: 123,
  })
  groupId: number;

  @ApiProperty({
    description: 'User ID',
    readOnly: true,
    example: 456,
  })
  userId: number;

  @ApiProperty({
    enum: groupRoleEnum,
    readOnly: true,
    example: 'admin',
    description: 'Role',
  })
  role: groupRoleEnumType;

  @ApiProperty({ type: () => MiniUserResponseWithProfilePicture })
  user: MiniUserResponseWithProfilePicture;

  @ApiProperty({ type: () => MiniGroupResponseWithLogo })
  group: MiniGroupResponseWithLogo;

  @ApiProperty({
    description: 'Date when the membership was created',
    readOnly: true,
    example: '2023-01-15T12:30:45Z',
  })
  createdAt: string;
}

export class UserMembershipResponseWithDates
  extends MiniUserResponseWithCountry
  implements IUserMembershipResponseWithDates
{
  @ApiProperty({
    description: 'Date when the membership was created',
    readOnly: true,
    example: '2023-01-15T12:30:45Z',
  })
  createdAt: Date;

  @ApiProperty({
    enum: groupRoleEnum,
    readOnly: true,
    example: 'admin',
    description: 'Role',
  })
  role: groupRoleEnumType;
}

export class GroupMembershipResponseWithDates
  extends MiniGroupResponseWithCountry
  implements IGroupMembershipResponseWithDates
{
  @ApiProperty({
    description: 'Date when the membership was created',
    readOnly: true,
    example: '2023-01-15T12:30:45Z',
  })
  createdAt: Date;

  @ApiProperty({
    enum: groupRoleEnum,
    readOnly: true,
    example: 'admin',
    description: 'Role',
  })
  role: groupRoleEnumType;
}

export class GroupMembershipKey implements IGroupMembershipKey {
  @ApiProperty({
    description: 'User ID',
    readOnly: true,
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: 'Group ID',
    readOnly: true,
    example: 456,
  })
  groupId: number;

  [key: string]: number;
}

export interface IGroupMembershipKey extends Record<string, number> {
  userId: number;
  groupId: number;
}
