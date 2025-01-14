import { ApiResponseProperty } from '@nestjs/swagger';
import {
  categoryTypeEnumType,
  ICategoryMiniResponse,
  ICategoryMiniResponseWithLogo,
  ICategoryResponse,
  IExtendedCategoryResponse,
} from '@tournament-app/types';

export class CategoryMiniResponse implements ICategoryMiniResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;
}

export class CategoryMiniResponseWithLogo
  extends CategoryMiniResponse
  implements ICategoryMiniResponseWithLogo
{
  @ApiResponseProperty()
  logo: string;
}

export class CategoryResponse
  extends CategoryMiniResponseWithLogo
  implements ICategoryResponse
{
  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  type: categoryTypeEnumType;

  @ApiResponseProperty()
  tournamentCount: number;

  @ApiResponseProperty()
  activeTournamentCount: number;
}

export class CategoryResponseExtended
  extends CategoryResponse
  implements IExtendedCategoryResponse
{
  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date;
}
