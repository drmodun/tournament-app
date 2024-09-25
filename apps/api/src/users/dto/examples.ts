import { refs } from '@nestjs/swagger';
import {
  ExtendedUserResponse,
  MiniUserResponse,
  MiniUserResponseWithCountry,
  MiniUserResponseWithProfilePicture,
  UserResponse,
} from './responses.dto';
import { BaseQueryResponse } from 'src/base/query/baseResponse';
import { UserQuery } from './requests.dto';
import { BaseUserResponseType, UserResponsesEnum } from '@tournament-app/types';

export const miniUserResponseExample = {
  id: 1,
  username: 'john_doe',
} satisfies MiniUserResponse;

export const miniUserResponseWithProfilePictureExample = {
  ...miniUserResponseExample,
  profilePicture: 'https://example.com/image.jpg',
} satisfies MiniUserResponseWithProfilePicture;

export const miniUserResponseWithCountryExample = {
  ...miniUserResponseWithProfilePictureExample,
  country: 'USA',
} satisfies MiniUserResponseWithCountry;

export const defaultExample = {
  ...miniUserResponseWithCountryExample,
  bio: 'I am a cool person',
  email: 'john.doe@example.com',
  followers: 0,
  level: 0,
  name: 'John Doe',
  updatedAt: new Date(),
} satisfies UserResponse;

export const extendedExample = {
  ...defaultExample,
  createdAt: new Date(),
  following: 0,
  location: 'New York',
} satisfies ExtendedUserResponse;

export const userResponseSchema = {
  anyOf: refs(
    MiniUserResponse,
    UserResponse,
    ExtendedUserResponse,
    MiniUserResponseWithCountry,
    MiniUserResponseWithProfilePicture,
  ),
};

export const userResponseExamples = {
  UserResponse: {
    value: defaultExample,
  },
  MiniUserResponse: {
    value: {
      id: 1,
      username: 'john_doe',
    } as MiniUserResponse,
  },
  MiniUserResponseWithCountry: {
    value: miniUserResponseWithCountryExample,
  },
  MiniUserResponseWithProfilePicture: {
    value: miniUserResponseWithProfilePictureExample,
  },
  ExtendedUserResponse: {
    value: extendedExample,
  },
};

export class UserQueryResponseExample extends BaseQueryResponse<
  BaseUserResponseType,
  UserQuery
> {}

export const userQueryResponses = {};
export const userQuerySchemaList = [];
export const actualClassList = [];

for (const responseType in userResponseExamples) {
  const response: UserQueryResponseExample = {
    metadata: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      links: {
        first: 'https://example.com/api/users?page=1',
        prev: 'https://example.com/api/users?page=0',
        next: 'https://example.com/api/users?page=2',
      },
      query: {
        page: 1,
        pageSize: 10,
        username: 'john_doe',
        country: 'USA',
        field: 'username',
        order: 'asc',
        responseType: UserResponsesEnum.MINI,
      },
    },
    results: [userResponseExamples[responseType].value],
  };
  userQuerySchemaList.push(response);
  userQueryResponses[responseType] = { value: response };
}

//TODO: extract this to a helper function, test it and do the same for schemas
//TODO: fix schema generation for nested objects
