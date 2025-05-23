import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateLFGRequest,
  ILfgQuery,
  IUpdateLFGRequest,
  LFGResponsesEnumType,
} from '^tournament-app/types';
import { Transform } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class CreateLFGRequest implements ICreateLFGRequest {
  @IsString()
  @MinLength(10)
  @MaxLength(750)
  @ApiProperty()
  message: string;

  @ApiProperty()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((id) => {
        if (typeof id == 'string') {
          return parseInt(id, 10);
        }
        return id;
      });
    }
    return value;
  })
  @IsInt({ each: true })
  categoryIds: number[];
}

export class UpdateLFGRequest implements IUpdateLFGRequest {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(750)
  @ApiPropertyOptional()
  message?: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((id) => {
        if (typeof id == 'string') {
          return parseInt(id, 10);
        }
        return id;
      });
    }
    return value;
  })
  @IsInt({ each: true })
  categoryIds?: number[];
}

export class LFGQuery
  extends BaseQuery<LFGResponsesEnumType>
  implements ILfgQuery
{
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  userId?: number;
}
