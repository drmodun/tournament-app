import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateSubcategoryRequest,
  ISubcategoryQuery,
  IUpdateSubcategoryRequest,
  SubcategoryResponsesEnum,
} from '@tournament-app/types';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseQuery } from '../../base/query/baseQuery';

export class CreateSubcategoryRequest implements ICreateSubcategoryRequest {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  image?: string;

  @IsInt()
  @ApiProperty()
  categoryId: number;
}

export class UpdateSubcategoryRequest implements IUpdateSubcategoryRequest {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  image?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'Refused while tournaments use the subcategory',
  })
  categoryId?: number;
}

export class SubcategoryQuery
  extends BaseQuery<SubcategoryResponsesEnum>
  implements ISubcategoryQuery
{
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ enum: SubcategoryResponsesEnum })
  @IsOptional()
  @IsEnum(SubcategoryResponsesEnum)
  responseType?: SubcategoryResponsesEnum;
}
