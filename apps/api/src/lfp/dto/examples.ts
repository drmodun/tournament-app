import { LFPResponse, MiniLFPResponse } from './responses';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { CreateLFPDto, UpdateLFPDto, LFPQueryDto } from './requests';
import { groupRequirementsResponseExample } from 'src/group/requirements/dto/examples';
import { baseResponseExample } from 'src/group/dto/examples';
// Base example
const miniExample: MiniLFPResponse = {
  id: 1,
  groupId: 1,
  message: 'Looking for players for our competitive team',
  createdAt: new Date('2024-01-07T14:00:00Z').toISOString(),
};

// With group example

// Full response example
const responseExample: LFPResponse = {
  ...miniExample,
  group: baseResponseExample,
  requirements: groupRequirementsResponseExample,
  location: {
    id: 1,
    name: 'Chess Club',
    coordinates: [12.345678, 12.345678],
    apiId: 'chess-club',
  },
};

// Swagger examples
export const lfpResponses: SwaggerExamples<LFPResponse | MiniLFPResponse> = {
  ['mini']: { value: miniExample },
  ['base']: { value: responseExample },
};

// Request examples
export const createLFPExample: CreateLFPDto = {
  message: 'Looking for players for our competitive team',
};

export const updateLFPExample: UpdateLFPDto = {
  message: 'Updated LFP message',
};

export const lfpQueryExample: LFPQueryDto = {
  groupId: 1,
  lat: 12.345678,
  lng: 12.345678,
  distance: 10,
};

export const lfpRequests = {
  createLFPExample,
  updateLFPExample,
  lfpQueryExample,
};

export const lfpQueryResponses = generateQueryExamples<
  LFPResponse | MiniLFPResponse,
  object
>({
  examples: lfpResponses,
  baseUrl: '/lfp',
  defaultQuery: {
    page: 1,
    pageSize: 10,
    groupId: 1,
  },
});
