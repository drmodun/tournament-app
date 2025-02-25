import {
  LFGMiniResponse,
  MiniLFGResponseWithUser,
  MiniLFGResponseWithCategory,
  LFGResponse,
  CareerCategoryResponse,
} from './responses';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import {
  miniUserResponseExample,
  miniUserResponseWithCountryExample,
} from 'src/users/dto/examples';
import {
  categoryMiniExample,
  categoryMiniWithLogoExample,
} from 'src/category/dto/examples';
import { BaseLFGResponseType, LFGResponsesEnum } from '@tournament-app/types';
import { CreateLFGRequest, UpdateLFGRequest } from './requests';

// Base example
const baseExample: LFGMiniResponse = {
  id: 1,
  userId: 1,
  message: 'Looking for a competitive team for upcoming tournaments',
  createdAt: new Date('2024-01-07T14:00:00Z'),
  updatedAt: new Date('2024-01-07T14:00:00Z'),
};

// Career category example
const careerExample: CareerCategoryResponse = {
  userId: 1,
  categoryId: 1,
  elo: 1500,
  createdAt: new Date('2024-01-07T14:00:00Z'),
  category: categoryMiniWithLogoExample,
};

// With user example
const withUserExample: MiniLFGResponseWithUser = {
  ...baseExample,
  user: miniUserResponseExample,
};

// With category example
const withCategoryExample: MiniLFGResponseWithCategory = {
  ...baseExample,
  categories: [categoryMiniExample],
};

// Full response example
const responseExample: LFGResponse = {
  ...baseExample,
  user: miniUserResponseWithCountryExample,
  careers: [careerExample],
};

// Swagger examples
export const lfgResponses: SwaggerExamples<BaseLFGResponseType> = {
  [LFGResponsesEnum.MINI]: { value: baseExample },
  [LFGResponsesEnum.MINI_WITH_USER]: { value: withUserExample },
  [LFGResponsesEnum.MINI_WITH_CATEGORY]: { value: withCategoryExample },
  [LFGResponsesEnum.BASE]: { value: responseExample },
};

// Request examples
export const createLFGExample: CreateLFGRequest = {
  message: 'Looking for a competitive team for upcoming tournaments',
  categoryIds: [1, 2, 3],
};

export const updateLFGExample: UpdateLFGRequest = {
  message: 'Updated LFG message',
  categoryIds: [1, 2],
};

export const lfgRequests = {
  createLFGExample,
  updateLFGExample,
};

export const lfgQueryResponses = generateQueryExamples<BaseLFGResponseType>({
  examples: lfgResponses,
  baseUrl: '/lfg',
  defaultQuery: {
    page: 1,
    pageSize: 10,
  },
});
