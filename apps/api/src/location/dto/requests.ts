import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';
import {
  ICreateLocationRequest,
  IUpdateLocationRequest,
  ILocationQuery,
  LocationResponseEnumType,
} from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { BaseQuery } from 'src/base/query/baseQuery';

export class CreateLocationDto implements ICreateLocationRequest {
  @ApiProperty({
    description: 'Name of the location',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'API ID of the location',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  apiId: string;

  @ApiProperty({
    description: 'Latitude of the location',
    example: 40.7128,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    description: 'Longitude of the location',
    example: -74.006,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  lng: number;
}

export class UpdateLocationDto implements IUpdateLocationRequest {
  @ApiPropertyOptional({
    description: 'Name of the location',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'API ID of the location',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  apiId?: string;

  @ApiPropertyOptional({
    description: 'Latitude of the location',
    example: 40.7128,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude of the location',
    example: -74.006,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  lng?: number;
}

export class LocationQuery
  extends BaseQuery<LocationResponseEnumType>
  implements ILocationQuery
{
  @ApiPropertyOptional({
    description: 'Name of the location',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'API ID of the location',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  apiId?: string;

  @ApiPropertyOptional({
    description: 'Latitude of the location',
    example: 40.7128,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude of the location',
    example: -74.006,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  lng?: number;
}
