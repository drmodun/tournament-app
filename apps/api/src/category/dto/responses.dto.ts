import { ApiResponseProperty } from '@nestjs/swagger';
import {
  ICategoryMiniResponse,
  ICategoryMiniResponseWithLogo,
  ICategoryResponse,
  IExtendedCategoryResponse,
} from '@tournament-app/types';

export class CategoryMiniResponse implements ICategoryMiniResponse {
  @ApiResponseProperty()
  id: string;

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
  type: string;

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
