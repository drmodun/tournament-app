import { ApiProperty } from '@nestjs/swagger';
import { ICreateLFPRequest, IUpdateLFPRequest } from '@tournament-app/types';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class CreateLFPDto implements ICreateLFPRequest {
  @ApiProperty(
    {
      description: 'Message for the LFP',
      example: 'Looking for players for our competitive team',
    }
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}

export class UpdateLFPDto implements IUpdateLFPRequest {
  @ApiProperty({
    description: 'Message for the LFP',
    example: 'Looking for players for our competitive team',
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(2000)
  message?: string;
}

export class LFPQueryDto extends BaseQuery implements LFPQueryDto {
  @ApiProperty({
    description: 'Group ID',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  groupId?: number;

  @ApiProperty({
    description: 'Message for the LFP',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  message?: string;

  @ApiProperty({
    description: 'Latitude of the location',
    required: false
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({
    description: 'Longitude of the location',
    required: false
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({
    description: 'Distance',
    required: false
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @Type(() => Number)
  distance?: number;
}
