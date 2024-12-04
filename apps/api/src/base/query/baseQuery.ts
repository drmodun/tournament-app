import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryType } from '@tournament-app/types';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export abstract class BaseQuery<TResponseType extends string = string>
  implements Partial<BaseQueryType<TResponseType>>
{
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  returnFullCount?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseType?: TResponseType;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  @Max(100)
  pageSize?: number;
}
