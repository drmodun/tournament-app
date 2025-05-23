import {
  MiniTournamentResponse,
  MiniTournamentResponseWithLogo,
  TournamentResponse,
  ExtendedTournamentResponse,
} from './responses.dto';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import {
  CreateTournamentRequest,
  TournamentQuery,
  UpdateTournamentRequest,
} from './requests.dto';
import {
  BaseTournamentResponseType,
  TournamentResponsesEnum,
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from '^tournament-app/types';
import { MiniUserResponse } from 'src/users/dto/responses.dto';
import { MiniGroupResponse } from 'src/group/dto/responses.dto';
import { CategoryMiniResponseWithLogo } from 'src/category/dto/responses.dto';

// Response Examples
const baseExample: MiniTournamentResponse = {
  id: 1,
  name: 'Chess Championship 2025',
  type: tournamentTypeEnum.LEAGUE,
  startDate: new Date('2025-02-01T10:00:00Z'),
};

export const withLogoExample: MiniTournamentResponseWithLogo = {
  ...baseExample,
  location: tournamentLocationEnum.ONLINE,
  logo: 'https://example.com/chess-tournament-logo.jpg',
  country: 'DE',
};

const creatorExample: MiniUserResponse = {
  id: 1,
  username: 'chessmaster',
  isFake: false,
};

const groupExample: MiniGroupResponse = {
  id: 1,
  name: 'Chess Club',
  abbreviation: 'CC',
};

const categoryExample: CategoryMiniResponseWithLogo = {
  id: 1,
  name: 'Chess',
  logo: 'https://example.com/chess-category-logo.jpg',
};

export const tournamentExample: TournamentResponse = {
  ...withLogoExample,
  description: 'International Chess Championship 2025',
  teamType: tournamentTeamTypeEnum.SOLO,
  creator: creatorExample,
  affiliatedGroup: groupExample,
  endDate: new Date('2025-03-01T18:00:00Z'),
  maxParticipants: 64,
  currentParticipants: 32,
  isPublic: true,
  category: categoryExample,
  links: 'https://chess.com/tournament/123',
  actualLocation: {
    id: 1,
    name: 'Chess Club',
    coordinates: [12.345678, 12.345678],
    apiId: 'chess-club',
  },
};

export const extendedExample: ExtendedTournamentResponse = {
  ...tournamentExample,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-07T14:00:00Z'),
  isMultipleTeamsPerGroupAllowed: false,
  isFakePlayersAllowed: false,
  parentTournament: withLogoExample,
  conversionRuleId: 1,
  isRanked: true,
  maximumMMR: 2500,
  minimumMMR: 1500,
};

// Request Examples
export const createExample: CreateTournamentRequest = {
  name: 'Chess Championship 2025',
  description: 'International Chess Championship 2025',
  country: 'DE',
  tournamentType: tournamentTypeEnum.LEAGUE,
  location: tournamentLocationEnum.ONLINE,
  tournamentTeamType: tournamentTeamTypeEnum.SOLO,
  maxParticipants: 64,
  startDate: new Date('2025-02-01T10:00:00Z'),
  endDate: new Date('2025-03-01T18:00:00Z'),
  isPublic: true,
  locationId: 1,
  isRanked: true,
  categoryId: 1,
  creatorId: 1,
  links: 'https://chess.com/tournament/123',
};

export const updateExample: UpdateTournamentRequest = {
  name: 'Updated Chess Championship 2025',
  description: 'Updated International Chess Championship 2025',
  maxParticipants: 128,
  isPublic: false,
  locationId: 1,
};

// Swagger Examples
export const tournamentResponses: SwaggerExamples<BaseTournamentResponseType> =
  {
    [TournamentResponsesEnum.MINI]: { value: baseExample },
    [TournamentResponsesEnum.MINI_WITH_LOGO]: { value: withLogoExample },
    [TournamentResponsesEnum.BASE]: { value: tournamentExample },
    [TournamentResponsesEnum.EXTENDED]: { value: extendedExample },
  };

// Query Examples
export const queryExample: TournamentQuery = {
  name: 'Chess',
  type: tournamentTypeEnum.LEAGUE,
  location: tournamentLocationEnum.ONLINE,
  teamType: tournamentTeamTypeEnum.SOLO,
  startDate: new Date('2025-02-01T10:00:00Z'),
  endDate: new Date('2025-03-01T18:00:00Z'),
  isRanked: true,
  minimumMMR: 1500,
  maximumMMR: 2500,
  categoryId: 1,
  minParticipants: 32,
  maxParticipants: 128,
  isPublic: true,
};

export const tournamentQueryExamples = generateQueryExamples({
  examples: tournamentResponses,
  baseUrl: '/tournaments',
  defaultQuery: queryExample,
});
