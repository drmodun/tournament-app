import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateLFGRequest, IUpdateLFGRequest } from '@tournament-app/types';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateLFGRequest implements ICreateLFGRequest {
  @IsString()
  @MinLength(10)
  @MaxLength(750)
  @ApiProperty()
  message: string;

  @ApiProperty()
  @IsArray({
    each: true,
  })
  @Transform(({ value }) => value.map((id) => parseInt(id)))
  @Type(() => Number)
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
  @IsArray({
    each: true,
  })
  @Transform(({ value }) => value.map((id) => parseInt(id)))
  @Type(() => Number)
  categoryIds?: number[];
}
