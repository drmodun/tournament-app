import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryType } from '@tournament-app/types';
import { IsOptional, IsString } from 'class-validator';

export abstract class BaseQuery<TResponseType extends string = string>
  implements Partial<BaseQueryType<TResponseType>>
{
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnFullCount?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseType?: TResponseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pageSize?: number;
}
