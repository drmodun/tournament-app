import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryType } from '@tournament-app/types';
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
  @IsBoolean()
  returnFullCount?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseType?: TResponseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  pageSize?: number;
}
