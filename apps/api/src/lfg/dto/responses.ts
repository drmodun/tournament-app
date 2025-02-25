import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, IsDate, ValidateNested } from 'class-validator';
import {
  IMiniUserResponse,
  IMiniUserResponseWithCountry,
  ICategoryMiniResponse,
  ICareerCategoryResponse,
  ILFGMiniResponse,
  IMiniLFGResponseWithUser,
  IMiniLFGResponseWithCategory,
  ILFGResponse,
} from '@tournament-app/types';
import {
  CategoryMiniResponse,
  CategoryMiniResponseWithLogo,
} from 'src/category/dto/responses.dto';
import {
  MiniUserResponse,
  MiniUserResponseWithCountry,
} from 'src/users/dto/responses.dto';

export class CareerCategoryResponse implements ICareerCategoryResponse {
  @ApiResponseProperty()
  @IsNumber()
  userId: number;

  @ApiResponseProperty()
  @IsNumber()
  categoryId: number;

  @ApiResponseProperty()
  @IsNumber()
  elo: number;

  @ApiResponseProperty()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty()
  @Type(() => CategoryMiniResponseWithLogo)
  category: CategoryMiniResponseWithLogo;
}

export class LFGMiniResponse implements ILFGMiniResponse {
  @ApiResponseProperty()
  @IsNumber()
  id: number;

  @ApiResponseProperty()
  @IsNumber()
  userId: number;

  @ApiResponseProperty()
  @IsNumber()
  categoryId: number;

  @ApiResponseProperty()
  @IsString()
  message: string;

  @ApiResponseProperty()
  @IsDate()
  createdAt: Date;
}

export class MiniLFGResponseWithUser
  extends LFGMiniResponse
  implements IMiniLFGResponseWithUser
{
  @ApiResponseProperty()
  @ValidateNested()
  @Type(() => MiniUserResponse)
  user: IMiniUserResponse;
}

export class MiniLFGResponseWithCategory
  extends LFGMiniResponse
  implements IMiniLFGResponseWithCategory
{
  @ApiResponseProperty({ type: [CategoryMiniResponse] })
  @ValidateNested({ each: true })
  @Type(() => CategoryMiniResponse)
  categories: ICategoryMiniResponse[];
}

export class LFGResponse extends LFGMiniResponse implements ILFGResponse {
  @ApiResponseProperty()
  @ValidateNested()
  @Type(() => MiniUserResponseWithCountry)
  user: IMiniUserResponseWithCountry;

  @ApiResponseProperty({ type: [CareerCategoryResponse] })
  @ValidateNested({ each: true })
  @Type(() => CareerCategoryResponse)
  careers: ICareerCategoryResponse[];
}
