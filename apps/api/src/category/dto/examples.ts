import {
  CategoryResponse,
  CategoryResponseExtended,
  CategoryMiniResponse,
  CategoryMiniResponseWithLogo,
} from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import {
  BaseCategoryResponseType,
  CategoryResponsesEnum,
  categoryTypeEnum,
} from '@tournament-app/types';
import {
  CategoryQuery,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './requests.dto';

// Response Examples
export const categoryMiniExample: CategoryMiniResponse = {
  id: 1,
  name: 'Chess',
};

export const withLogoExample: CategoryMiniResponseWithLogo = {
  ...categoryMiniExample,
  logo: 'https://example.com/chess-category-logo.jpg',
};

export const categoryExample: CategoryResponse = {
  ...withLogoExample,
  description: 'Chess tournaments and competitions',
  type: categoryTypeEnum.PROGRAMMING,
  tournamentCount: 5,
  activeTournamentCount: 3,
  id: 1,
  logo: 'https://example.com/chess-category-logo.jpg',
};

export const extendedExample: CategoryResponseExtended = {
  ...categoryExample,
  createdAt: new Date('2024-01-07T14:00:00Z'),
  updatedAt: new Date('2024-01-07T14:00:00Z'),
};

export const categoryResponses: SwaggerExamples<BaseCategoryResponseType> = {
  [CategoryResponsesEnum.MINI]: { value: categoryMiniExample },
  [CategoryResponsesEnum.MINI_WITH_LOGO]: { value: withLogoExample },
  [CategoryResponsesEnum.BASE]: { value: categoryExample },
  [CategoryResponsesEnum.EXTENDED]: { value: extendedExample },
};

export const createCategoryExample: CreateCategoryRequest = {
  name: 'Chess',
  description: 'Chess tournaments and competitions',
  logo: 'https://example.com/chess-category-logo.jpg',
  type: categoryTypeEnum.PROGRAMMING,
};

export const updateCategoryExample: UpdateCategoryRequest = {
  name: 'Chess Updated',
  description: 'Updated chess tournaments and competitions',
  type: categoryTypeEnum.OTHER,
};

export const uploadLogoExample = {
  logo: 'https://example.com/new-chess-category-logo.jpg',
};

export const categoryRequests = {
  createCategoryExample,
  updateCategoryExample,
  uploadLogoExample,
};

export const categoryQueryResponses = generateQueryExamples<
  BaseCategoryResponseType,
  CategoryQuery
>({
  examples: categoryResponses,
  baseUrl: '/categories',
  defaultQuery: {
    page: 1,
    pageSize: 10,
  },
});
