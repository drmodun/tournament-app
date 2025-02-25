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
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apiId: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  lat: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  lng: number;
}

export class UpdateLocationDto implements IUpdateLocationRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  apiId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  lng?: number;
}

export class LocationQuery
  extends BaseQuery<LocationResponseEnumType>
  implements ILocationQuery
{
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  lng?: number;
}
