import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateLFGRequest,
  ILfgQuery,
  IUpdateLFGRequest,
  LFGResponsesEnumType,
} from '@tournament-app/types';
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
  @ApiProperty({
    description: 'Message for the LFG',
    example: 'Looking for players for our competitive team',
  })
  message: string;

  @ApiProperty({
    description: 'Categories for the LFG',
    example: [1, 2, 3],
  })
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
  @ApiPropertyOptional({
    description: 'Message for the LFG',
    example: 'Looking for players for our competitive team',
  })
  message?: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Categories for the LFG',
    example: [1, 2, 3],
  })
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
  @ApiPropertyOptional({
    description: 'User ID',
    example: 123,
  })
  userId?: number;
}
