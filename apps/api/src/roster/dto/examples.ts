import { RosterDto, MiniRosterDto, PlayerDto } from './responses';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { BaseRosterResponse, RosterResponsesEnum } from '@tournament-app/types';
import { QueryRosterDto } from './requests';

// Sample player data
const playerExample: PlayerDto = {
  user: {
    id: 1,
    username: 'player1',
    country: 'US',
    profilePicture: 'https://example.com/player1-avatar.png',
    isFake: false,
  },
  isSubstitute: false,
  career: [
    {
      category: {
        id: 1,
        name: 'Category 1',
        logo: 'https://example.com/category1-image.png',
      },
      elo: 1000,
      createdAt: new Date('2023-01-15T12:00:00Z'),
      userId: 1,
      categoryId: 1,
    },
  ],
};

const substitutePlayerExample: PlayerDto = {
  user: {
    id: 2,
    username: 'substitute1',
    country: 'CA',
    profilePicture: 'https://example.com/player2-avatar.png',
    isFake: false,
  },
  isSubstitute: true,
  career: [
    {
      category: {
        id: 1,
        name: 'Category 1',
        logo: 'https://example.com/category1-image.png',
      },
      elo: 1000,
      createdAt: new Date('2023-01-15T12:00:00Z'),
      userId: 2,
      categoryId: 1,
    },
  ],
};

// Mini roster example
export const miniRosterExample: MiniRosterDto = {
  id: 1,
  stageId: 1,
  participationId: 1,
  group: {
    id: 1,
    name: 'Team Alpha',
    logo: 'https://example.com/team-alpha-logo.png',
    abbreviation: 'TA',
  },
  user: {
    id: 1,
    username: 'player1',
    profilePicture: 'https://example.com/player1-avatar.png',
    isFake: false,
  },
};

// Full roster example
export const rosterExample: RosterDto = {
  ...miniRosterExample,
  players: [playerExample, substitutePlayerExample],
  createdAt: new Date('2023-01-15T12:00:00Z'),
  updatedAt: new Date('2023-01-15T12:00:00Z'),
};

// Swagger examples for different response types
export const rosterResponses: SwaggerExamples<BaseRosterResponse> = {
  [RosterResponsesEnum.MINI]: {
    value: miniRosterExample,
  },
  [RosterResponsesEnum.BASE]: {
    value: rosterExample,
  },
  [RosterResponsesEnum.EXTENDED]: {
    value: {
      ...rosterExample,
      // Additional extended properties would go here
    },
  },
};

// Generate query examples for documentation
export const rosterQueryResponses = generateQueryExamples<
  BaseRosterResponse,
  QueryRosterDto
>({
  examples: rosterResponses,
  baseUrl: '/roster',
  defaultQuery: {
    page: 1,
    pageSize: 10,
  },
});

// Schema for Swagger documentation
export const rosterResponseSchema = {
  oneOf: [
    { $ref: '#/components/schemas/MiniRosterDto' },
    { $ref: '#/components/schemas/RosterDto' },
  ],
};

// Example for creating a roster
export const createRosterExample = {
  members: [
    {
      userId: 1,
      isSubstitute: false,
    },
    {
      userId: 2,
      isSubstitute: true,
    },
  ],
};

// Example for updating a roster
export const updateRosterExample = {
  members: [
    {
      userId: 1,
      isSubstitute: false,
    },
    {
      userId: 3, // Changed member
      isSubstitute: true,
    },
  ],
};
