import {
  GroupInviteResponse,
  GroupInviteResponsesEnum,
  IGroupInviteWithGroupResponse,
  IGroupInviteWithMiniGroupResponse,
} from '@tournament-app/types';
import {
  GroupInviteWithUserResponseDto,
  GroupInviteWithMiniUserResponseDto,
  GroupInviteWithGroupResponseDto,
  GroupInviteWithMiniGroupResponseDto,
} from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { GroupInviteQuery } from './requests.dto';

export const groupInviteWithUserExample = {
  id: 1,
  username: 'john_doe',
  bio: 'I am a user',
  profilePicture: 'https://example.com/image.jpg',
  country: 'USA',
  name: 'John Doe',
  email: 'john@doe.com',
  followers: 0,
  level: 0,
  updatedAt: new Date(),
  message: 'Would you like to join our group?',
  groupId: 1,
} satisfies GroupInviteWithUserResponseDto;

export const groupInviteWithMiniUserExample = {
  id: 1,
  username: 'john_doe',
  profilePicture: 'https://example.com/image.jpg',
  createdAt: new Date(),
} satisfies GroupInviteWithMiniUserResponseDto;

export const groupInviteWithGroupExample = {
  id: 1,
  name: 'Example Group',
  description: 'This is an example group',
  logo: 'https://example.com/logo.jpg',
  memberCount: 10,
  message: 'Would you like to join our group?',
  userId: 1,
  abbreviation: 'EG',
  country: 'USA',
  focus: 'Hybrid',
  location: 'New York',
  type: 'Public',
  updatedAt: new Date().toLocaleDateString(),
} satisfies IGroupInviteWithGroupResponse;

export const groupInviteWithMiniGroupExample = {
  id: 1,
  name: 'Example Group',
  abbreviation: 'EG',
  logo: 'https://example.com/logo.jpg',
  createdAt: new Date(),
} satisfies IGroupInviteWithMiniGroupResponse;

export const groupInviteExamples: SwaggerExamples<GroupInviteResponse> = {
  [GroupInviteResponsesEnum.WITH_USER]: {
    value: groupInviteWithUserExample,
  },
  [GroupInviteResponsesEnum.WITH_MINI_USER]: {
    value: groupInviteWithMiniUserExample,
  },
  [GroupInviteResponsesEnum.WITH_GROUP]: {
    value: groupInviteWithGroupExample,
  },
  [GroupInviteResponsesEnum.WITH_MINI_GROUP]: {
    value: groupInviteWithMiniGroupExample,
  },
};

export const groupInviteQueryResponseSchemaList = [
  GroupInviteWithUserResponseDto,
  GroupInviteWithMiniUserResponseDto,
  GroupInviteWithGroupResponseDto,
  GroupInviteWithMiniGroupResponseDto,
];

export const groupInviteQueryExamples = generateQueryExamples<
  GroupInviteResponse,
  GroupInviteQuery
>({
  examples: groupInviteExamples,
  baseUrl: '/group-invites',
  defaultQuery: {
    page: 1,
    pageSize: 10,
    userId: 1,
    groupId: 1,
  },
});
