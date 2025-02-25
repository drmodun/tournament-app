import {
  MiniLocationResponse,
  LocationResponse,
  ExtendedLocationResponse,
} from './responses';
import {
  generateQueryExamples,
  SwaggerExamples,
} from 'src/base/swagger/example.generator';
import { CreateLocationDto, UpdateLocationDto } from './requests';
import {
  BaseLocationResponse,
  LocationResponsesEnum,
} from '@tournament-app/types';

export const miniLocationExample: MiniLocationResponse = {
  id: 1,
  apiId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ', // Paris Google Maps API ID
};

export const locationExample: LocationResponse = {
  ...miniLocationExample,
  name: 'Paris',
  coordinates: [48.856614, 2.3522219],
};

export const extendedLocationExample: ExtendedLocationResponse = {
  ...locationExample,
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

export const createLocationExample: CreateLocationDto = {
  name: 'Paris',
  apiId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
  lat: 48.856614,
  lng: 2.3522219,
};

export const updateLocationExample: UpdateLocationDto = {
  name: 'Paris Updated',
  lat: 48.856614,
  lng: 2.3522219,
};

export const locationResponses: SwaggerExamples<BaseLocationResponse> = {
  [LocationResponsesEnum.MINI]: { value: miniLocationExample },
  [LocationResponsesEnum.BASE]: { value: locationExample },
  [LocationResponsesEnum.EXTENDED]: { value: extendedLocationExample },
};

export const locationQueryExample = {
  name: 'Paris',
  apiId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
  page: 1,
  responseType: LocationResponsesEnum.MINI,
  pageSize: 10,
  field: 'name',
  order: 'asc',
};

export const locationQueryExamples = generateQueryExamples<
  BaseLocationResponse,
  typeof locationQueryExample
>({
  examples: locationResponses,
  baseUrl: '/locations',
  defaultQuery: locationQueryExample,
});
