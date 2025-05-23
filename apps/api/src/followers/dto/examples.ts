import { FollowerResponsesEnum } from '^tournament-app/types';
import { FollowerMiniResponse, FollowerResponse } from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { FollowerQuery } from './request.dto';

export const followerResponseExample = {
  id: 1,
  username: 'john_doe',
  createdAt: new Date(),
  bio: 'I am a user',
  profilePicture: 'https://example.com/image.jpg',
  country: 'USA',
  name: 'John Doe',
  email: 'john@doe.com',
  followers: 0,
  level: 0,
  isFake: false,
  updatedAt: new Date(),
  age: 20,
} satisfies FollowerResponse;

export const followerMiniResponseExample = {
  createdAt: new Date(),
  id: 1,
  isFake: false,
  username: 'john_doe',
} satisfies FollowerMiniResponse;

export const followerQueryResponses: SwaggerExamples<
  FollowerResponse | FollowerMiniResponse
> = {
  [FollowerResponsesEnum.FOLLOWER]: {
    value: followerResponseExample,
  },
  [FollowerResponsesEnum.FOLLOWER_MINI]: {
    value: followerMiniResponseExample,
  },
};

export const followerQueryExamples = generateQueryExamples<
  FollowerResponse | FollowerMiniResponse,
  FollowerQuery
>({
  examples: followerQueryResponses,
  baseUrl: '/followers',
  defaultQuery: {
    page: 1,
    pageSize: 10,
    userId: 1,
    followerId: 2,
  },
});
