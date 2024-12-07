import { refs } from '@nestjs/swagger';
import {
  GroupJoinRequestWithUserResponse,
  GroupJoinRequestWithMiniUserResponse,
  GroupJoinRequestWithGroupResponse,
  GroupJoinRequestWithMiniGroupResponse,
} from './responses.dto';
import { BaseQueryResponse } from 'src/base/query/baseResponse';
import { GroupJoinRequestQuery } from './requests.dto';
import {
  BaseGroupJoinRequestResponseType,
  GroupJoinRequestResponsesEnum,
} from '@tournament-app/types';
import { defaultExample as userExample } from 'src/users/dto/examples';
import { miniUserResponseWithProfilePictureExample } from 'src/users/dto/examples';
import { baseResponseExample, withLogoExample } from 'src/group/dto/examples';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';

export const groupJoinRequestWithUserExample = {
  ...userExample,
  groupId: 1,
  message: 'I would like to join this group',
} satisfies GroupJoinRequestWithUserResponse;

export const groupJoinRequestWithMiniUserExample = {
  ...miniUserResponseWithProfilePictureExample,
  createdAt: new Date(),
} satisfies GroupJoinRequestWithMiniUserResponse;

export const groupJoinRequestWithGroupExample = {
  ...baseResponseExample,
  userId: 1,
  message: 'I would like to join this group',
} satisfies GroupJoinRequestWithGroupResponse;

export const groupJoinRequestWithMiniGroupExample = {
  ...withLogoExample,
  createdAt: new Date(),
} satisfies GroupJoinRequestWithMiniGroupResponse;

export const groupJoinRequestResponseSchema = {
  anyOf: refs(
    GroupJoinRequestWithUserResponse,
    GroupJoinRequestWithMiniUserResponse,
    GroupJoinRequestWithGroupResponse,
    GroupJoinRequestWithMiniGroupResponse,
  ),
};

export class GroupJoinRequestQueryResponseExample extends BaseQueryResponse<
  BaseGroupJoinRequestResponseType,
  GroupJoinRequestQuery
> {
  constructor() {
    super();
    this.results = [groupJoinRequestWithUserExample];
    this.metadata = {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      links: {
        first: null,
        prev: null,
        next: null,
      },
    };
  }
}

export const groupJoinRequestQueryResponses: SwaggerExamples<BaseGroupJoinRequestResponseType> =
  {
    [GroupJoinRequestResponsesEnum.WITH_USER]: {
      value: groupJoinRequestWithUserExample,
    },
    [GroupJoinRequestResponsesEnum.WITH_MINI_USER]: {
      value: groupJoinRequestWithMiniUserExample,
    },
    [GroupJoinRequestResponsesEnum.WITH_GROUP]: {
      value: groupJoinRequestWithGroupExample,
    },
    [GroupJoinRequestResponsesEnum.WITH_MINI_GROUP]: {
      value: groupJoinRequestWithMiniGroupExample,
    },
  };

export const groupJoinRequestQueryResponseSchemaList = {
  anyOf: refs(
    GroupJoinRequestWithUserResponse,
    GroupJoinRequestWithMiniUserResponse,
    GroupJoinRequestWithGroupResponse,
    GroupJoinRequestWithMiniGroupResponse,
  ),
};

export const groupJoinRequestQuerySchemaList = [
  GroupJoinRequestWithUserResponse,
  GroupJoinRequestWithMiniUserResponse,
  GroupJoinRequestWithGroupResponse,
  GroupJoinRequestWithMiniGroupResponse,
];

export const groupJoinRequestsExamples = generateQueryExamples<
  BaseGroupJoinRequestResponseType,
  GroupJoinRequestQuery
>({
  examples: groupJoinRequestQueryResponses,
  baseUrl: '/group-join-requests',
  defaultQuery: {
    page: 1,
    pageSize: 10,
  },
});

export const actualClassList = [GroupJoinRequestQueryResponseExample];
