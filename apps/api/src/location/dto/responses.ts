import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  BaseLocationResponse,
  IExtendedLocationResponse,
  ILocationResponse,
  IMiniLocationResponse,
} from '@tournament-app/types';
import { LocationQuery } from './requests';
import { generateQueryExamples } from 'src/base/swagger/example.generator';

export class MiniLocationResponse implements IMiniLocationResponse {
  @ApiProperty({
    description: 'Unique identifier for the location',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'API ID of the location',
    example: '1234567890',
    readOnly: true,
  })
  apiId: string;
}

export class LocationResponse
  extends MiniLocationResponse
  implements ILocationResponse
{
  @ApiProperty({
    description: 'Name of the location',
    example: 'New York',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'Coordinates of the location',
    example: [40.7128, -74.006],
    readOnly: true,
  })
  coordinates: [number, number];
}

export class ExtendedLocationResponse
  extends LocationResponse
  implements IExtendedLocationResponse
{
  @ApiProperty({
    description: 'Date when the location was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the location was last updated',
    example: '2023-01-20T09:15:30Z',
    readOnly: true,
  })
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
  