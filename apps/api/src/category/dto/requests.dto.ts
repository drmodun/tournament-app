import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
  ICategoryQuery,
  categoryTypeEnum,
} from '@tournament-app/types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { BaseQuery } from '../../base/query/baseQuery';

export class CreateCategoryRequest implements ICreateCategoryRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiProperty()
  description: string;

  @ApiProperty()
  @IsString()
  logo: string;

  @IsEnum(categoryTypeEnum)
  @ApiProperty()
  type: categoryTypeEnum;
}

export class UpdateCategoryRequest implements Partial<IUpdateCategoryRequest> {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsEnum(categoryTypeEnum)
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  type?: categoryTypeEnum;
}

export class CategoryQuery extends BaseQuery implements ICategoryQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;
}

export class UploadCategoryLogoRequest {
  @ApiProperty()
  logo: string;
}
