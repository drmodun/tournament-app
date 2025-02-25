import { refs } from '@nestjs/swagger';
import {
  BaseGroupMembershipResponseType,
  groupRoleEnum,
} from '@tournament-app/types';
import {
  GroupMembershipKey,
  GroupMembershipResponse,
  GroupMembershipResponseWithDates,
  MinimalMembershipResponse,
  UserMembershipResponseWithDates,
} from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { GroupMembershipQuery } from './requests.dto';

export const minimalGroupMembershipExample = {
  userId: 1,
  groupId: 1,
  role: groupRoleEnum.MEMBER,
} satisfies MinimalMembershipResponse;

export const groupMembershipExample = {
  ...minimalGroupMembershipExample,
  user: {
    id: 1,
    isFake: false,
    username: 'john_doe',
    profilePicture: 'https://example.com/image.jpg',
  },
  group: {
    id: 1,
    name: 'Cool Group',
    logo: 'https://example.com/logo.jpg',
    abbreviation: 'CG',
  },
  groupId: 1,
  userId: 1,
  createdAt: new Date().toISOString(),
  role: groupRoleEnum.MEMBER,
} satisfies GroupMembershipResponse;

export const userMembershipWithDatesExample = {
  createdAt: new Date(),
  isFake: false,
  role: groupRoleEnum.MEMBER,
  country: 'country',
  id: 1,
  username: 'username',
  profilePicture: 'profilePicture',
} satisfies UserMembershipResponseWithDates;

export const groupMembershipWithDatesExample = {
  ...groupMembershipExample,
  createdAt: new Date(),
  role: groupRoleEnum.MEMBER,
  country: 'country',
  name: 'name',
  logo: 'logo',
  id: 1,
  abbreviation: 'abbreviation',
} satisfies GroupMembershipResponseWithDates;

export const groupMembershipKeyExample = {
  userId: 1,
  groupId: 1,
} satisfies GroupMembershipKey;

export const groupMembershipResponseSchema = {
  anyOf: refs(
    MinimalMembershipResponse,
    GroupMembershipResponse,
    UserMembershipResponseWithDates,
    GroupMembershipResponseWithDates,
    GroupMembershipKey,
  ),
};

export const groupMembershipExamples: SwaggerExamples<BaseGroupMembershipResponseType> =
  {
    MinimalMembershipResponse: {
      value: minimalGroupMembershipExample,
    },
    GroupMembershipResponse: {
      value: groupMembershipExample,
    },
    UserMembershipResponseWithDates: {
      value: userMembershipWithDatesExample,
    },
    GroupMembershipResponseWithDates: {
      value: groupMembershipWithDatesExample,
    },
    GroupMembershipKey: {
      value: groupMembershipKeyExample,
    },
  };

const {
  responses: groupMembershipQueryResponses,
  schemaList: groupMembershipQuerySchemaList,
} = generateQueryExamples<
  BaseGroupMembershipResponseType,
  GroupMembershipQuery
>({
  examples: groupMembershipExamples,
  baseUrl: 'https://example.com/api/group-membership',
  defaultQuery: {
    page: 1,
    pageSize: 10,
    userId: 1,
    groupId: 1,
    role: groupRoleEnum.MEMBER,
    field: 'createdAt',
    order: 'desc',
  },
});

export { groupMembershipQueryResponses, groupMembershipQuerySchemaList };
