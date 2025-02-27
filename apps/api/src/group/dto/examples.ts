import { refs } from '@nestjs/swagger';
import {
  GroupResponse,
  GroupResponseExtended,
  MiniGroupResponse,
  MiniGroupResponseWithCountry,
  MiniGroupResponseWithLogo,
} from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { GroupQuery } from './requests.dto';
import { GroupResponsesEnum, GroupSortingEnum } from '@tournament-app/types';

export const baseExample: MiniGroupResponse = {
  id: 1,
  name: 'Chess Club',
  abbreviation: 'CC',
};

export const withLogoExample: MiniGroupResponseWithLogo = {
  ...baseExample,
  logo: 'https://example.com/chess-club-logo.jpg',
};

const withCountryExample: MiniGroupResponseWithCountry = {
  ...baseExample,
  country: 'Croatia',
  logo: 'https://example.com/chess-club-logo.jpg',
  abbreviation: 'CC',
  id: 1,
  name: 'Chess Club',
};

export const baseResponseExample: GroupResponse = {
  ...withCountryExample,
  logo: 'https://example.com/chess-club-logo.jpg',
  description: 'A community of chess enthusiasts',
  type: 'Sports Club',
  focus: 'Chess',
  updatedAt: new Date().toISOString(),
  memberCount: 50,
};

const extendedResponseExample: GroupResponseExtended = {
  ...baseResponseExample,
  createdAt: new Date().toISOString(),
  tournamentCount: 10,
  subscriberCount: 100,
};

export const groupExamples: SwaggerExamples<
  | MiniGroupResponse
  | MiniGroupResponseWithLogo
  | MiniGroupResponseWithCountry
  | GroupResponse
  | GroupResponseExtended
> = {
  [GroupResponsesEnum.MINI]: { value: baseExample },
  [GroupResponsesEnum.MINI_WITH_LOGO]: { value: withLogoExample },
  [GroupResponsesEnum.MINI_WITH_COUNTRY]: { value: withCountryExample },
  [GroupResponsesEnum.BASE]: { value: baseResponseExample },
  [GroupResponsesEnum.EXTENDED]: { value: extendedResponseExample },
};

export const groupQueryResponses = generateQueryExamples<
  | MiniGroupResponse
  | MiniGroupResponseWithLogo
  | MiniGroupResponseWithCountry
  | GroupResponse
  | GroupResponseExtended,
  GroupQuery
>({
  examples: groupExamples,
  baseUrl: '/groups',
  defaultQuery: {
    page: 1,
    pageSize: 10,
  },
});

export const groupResponseSchema = {
  anyOf: refs(
    MiniGroupResponse,
    MiniGroupResponseWithLogo,
    MiniGroupResponseWithCountry,
    GroupResponse,
    GroupResponseExtended,
  ),
};

export const groupResponseTypeExample: SwaggerExamples<{
  responseType: GroupResponsesEnum;
}> = {
  default: {
    value: {
      responseType: GroupResponsesEnum.BASE,
    },
  },
};

export const groupSortingExample: SwaggerExamples<{ sort: GroupSortingEnum }> =
  {
    default: {
      value: {
        sort: GroupSortingEnum.NAME,
      },
    },
  };
