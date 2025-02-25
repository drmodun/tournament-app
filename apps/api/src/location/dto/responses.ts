import { ApiResponseProperty } from '@nestjs/swagger';
import {
  BaseLocationResponse,
  IExtendedLocationResponse,
  ILocationResponse,
  IMiniLocationResponse,
} from '@tournament-app/types';
import { LocationQuery } from './requests';
import { generateQueryExamples } from 'src/base/swagger/example.generator';

export class MiniLocationResponse implements IMiniLocationResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  apiId: string;
}

export class LocationResponse
  extends MiniLocationResponse
  implements ILocationResponse
{
  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  coordinates: [number, number];
}

export class ExtendedLocationResponse
  extends LocationResponse
  implements IExtendedLocationResponse
{
  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date;
}

export const locationResponses = {
  mini: {
    value: {
      id: 1,
      apiId: 'location123',
    },
  },
  base: {
    value: {
      id: 1,
      apiId: 'location123',
      name: 'New York',
      lat: 40.7128,
      lng: -74.006,
    },
  },
  extended: {
    value: {
      id: 1,
      apiId: 'location123',
      name: 'New York',
      lat: 40.7128,
      lng: -74.006,
      createdAt: new Date(),
    },
  },
};

export const locationQueryResponses = generateQueryExamples<
  BaseLocationResponse,
  LocationQuery
>({
  examples: locationResponses,
  baseUrl: '/locations',
  defaultQuery: {
    page: 1,
    pageSize: 10,
  },
});
