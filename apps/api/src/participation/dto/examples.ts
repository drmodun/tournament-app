import { refs } from '@nestjs/swagger';
import {
  MiniParticipationResponse,
  ParticipationResponse,
  ExtendedParticipationResponse,
} from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import {
  BaseParticipationResponseType,
  ParticipationResponsesEnum,
  tournamentTypeEnum,
} from '^tournament-app/types';
import { miniUserResponseWithProfilePictureExample } from 'src/users/dto/examples';
import { withLogoExample } from 'src/group/dto/examples';
import { QueryParticipationDto } from './requests.dto';

export const miniParticipationExample: MiniParticipationResponse = {
  id: 1,
  userId: 1,
  tournamentId: 1,
};

export const miniParticipationGroupExample: MiniParticipationResponse = {
  id: 2,
  groupId: 1,
  tournamentId: 1,
};

export const participationResponseExample: ParticipationResponse = {
  ...miniParticipationExample,
  tournament: {
    id: 1,
    type: tournamentTypeEnum.LEAGUE,
    startDate: new Date(),
    name: 'Chess Championship',
  },
  user: miniUserResponseWithProfilePictureExample,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const participationGroupResponseExample: ParticipationResponse = {
  ...miniParticipationGroupExample,
  tournament: {
    id: 1,
    type: tournamentTypeEnum.LEAGUE,
    startDate: new Date(),
    name: 'Chess Championship',
  },
  group: withLogoExample,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const extendedParticipationExample: ExtendedParticipationResponse = {};

export const participationResponseSchema = {
  anyOf: refs(
    MiniParticipationResponse,
    ParticipationResponse,
    ExtendedParticipationResponse,
  ),
};

export const participationExamples: SwaggerExamples<BaseParticipationResponseType> =
  {
    [ParticipationResponsesEnum.MINI]: { value: miniParticipationExample },
    [ParticipationResponsesEnum.EXTENDED]: {
      value: extendedParticipationExample,
    },
    [ParticipationResponsesEnum.PARTICIPANT]: {
      value: participationResponseExample,
    },
    [ParticipationResponsesEnum.BASE]: { value: participationResponseExample },
  };

export const participationQueryExamples = generateQueryExamples<
  BaseParticipationResponseType,
  QueryParticipationDto
>({
  examples: participationExamples,
  baseUrl: '/participations',
  defaultQuery: {
    page: 1,
    pageSize: 10,
    userId: 1,
    groupId: 1,
  },
});
