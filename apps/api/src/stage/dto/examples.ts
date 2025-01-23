import {
  MiniStageResponse,
  StageResponse,
  StageResponseWithTournament,
  ExtendedStageResponse,
  ExtendedStageResponseWithTournament,
} from './responses.dto';
import {
  CreateStageRequest,
  StageQuery,
  UpdateStageRequest,
} from './requests.dto';
import {
  stageStatusEnum,
  stageTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import {
  MiniTournamentResponseWithLogo,
  TournamentResponse,
} from 'src/tournament/dto/responses.dto';

// Response Examples
export const miniStageExample: MiniStageResponse = {
  id: 1,
  name: 'Group Stage',
  tournamentId: 1,
  stageStatus: stageStatusEnum.ONGOING,
};

export const stageExample: StageResponse = {
  ...miniStageExample,
  rostersParticipating: 0,
  startDate: new Date(),
  endDate: new Date(),
  stageType: stageTypeEnum.ROUND_ROBIN,
  description: 'Initial group stage of the tournament',
  logo: 'https://example.com/stage-logo.jpg',
};

const tournamentExample: MiniTournamentResponseWithLogo = {
  id: 1,
  name: 'Chess Championship 2025',
  type: tournamentTypeEnum.CONTEST,
  startDate: new Date('2025-02-01T10:00:00Z'),
  location: tournamentLocationEnum.ONLINE,
  logo: 'https://example.com/tournament-logo.jpg',
  country: 'DE',
};

const fullTournamentExample: TournamentResponse = {
  ...tournamentExample,
  description: 'International Chess Championship 2025',
  teamType: tournamentTeamTypeEnum.MIXED,
  creator: {
    id: 1,
    username: 'chessmaster',
    isFake: false,
  },
  affiliatedGroup: {
    id: 1,
    name: 'Chess Club',
    abbreviation: 'CC',
  },
  endDate: new Date('2025-03-01T18:00:00Z'),
  maxParticipants: 64,
  currentParticipants: 32,
  isPublic: true,
  category: {
    id: 1,
    name: 'Chess',
    logo: 'https://example.com/chess-category-logo.jpg',
  },
  links: 'https://chess.com/tournament/123',
};

export const stageWithTournamentExample: StageResponseWithTournament = {
  ...stageExample,
  tournament: tournamentExample,
};

export const extendedStageExample: ExtendedStageResponse = {
  ...stageExample,
  endDate: new Date('2025-02-15T18:00:00Z'),
  startDate: new Date('2025-02-01T10:00:00Z'),
  minPlayersPerTeam: 1,
  maxPlayersPerTeam: 1,
};

export const extendedStageWithTournamentExample: ExtendedStageResponseWithTournament =
  {
    ...extendedStageExample,
    tournament: fullTournamentExample,
  };

// Request Examples
export const createStageExample: CreateStageRequest = {
  tournamentId: 1,
  name: 'Group Stage',
  stageType: stageTypeEnum.ROUND_ROBIN,
  stageStatus: stageStatusEnum.ONGOING,
  description: 'Initial group stage of the tournament',
  stageLocation: tournamentLocationEnum.ONLINE,
  startDate: new Date('2025-02-01T10:00:00Z'),
  endDate: new Date('2025-02-15T18:00:00Z'),
  minPlayersPerTeam: 1,
  maxPlayersPerTeam: 1,
  logo: 'https://example.com/stage-logo.jpg',
};

export const updateStageExample: UpdateStageRequest = {
  name: 'Updated Group Stage',
  stageType: stageTypeEnum.ROUND_ROBIN,
  stageStatus: stageStatusEnum.ONGOING,
  description: 'Updated description for the group stage',
  stageLocation: tournamentLocationEnum.ONLINE,
  endDate: new Date('2025-02-20T18:00:00Z'),
  minPlayersPerTeam: 1,
  maxPlayersPerTeam: 2,
};

export const stageQueryExample: StageQuery = {
  name: 'Group',
  stageType: stageTypeEnum.ROUND_ROBIN,
  stageStatus: stageStatusEnum.ONGOING,
  stageLocation: tournamentLocationEnum.ONLINE,
  startDate: new Date('2025-02-01T10:00:00Z'),
  endDate: new Date('2025-02-15T18:00:00Z'),
  tournamentId: 1,
  minPlayersPerTeam: 1,
  maxPlayersPerTeam: 1,
  page: 1,
  pageSize: 10,
  field: 'name',
  order: 'desc',
};
