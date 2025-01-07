import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
  ICategoryQuery,
} from '@tournament-app/types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
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

  @IsUrl()
  @ApiProperty()
  logo: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  type: string;
}

export class UpdateCategoryRequest implements IUpdateCategoryRequest {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiPropertyOptional()
  description: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  type: string;
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
  @IsUrl()
  @ApiProperty()
  logo: string;
}
