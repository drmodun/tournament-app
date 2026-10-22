import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IExtendedSubcategoryResponse,
  ISubcategoryMiniResponse,
  ISubcategoryResponse,
} from '@tournament-app/types';
import { CategoryMiniResponseWithLogo } from '../../category/dto/responses.dto';

export class SubcategoryMiniResponse implements ISubcategoryMiniResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;
}

export class SubcategoryResponse
  extends SubcategoryMiniResponse
  implements ISubcategoryResponse
{
  @ApiResponseProperty()
  description: string | null;

  @ApiResponseProperty()
  image: string | null;

  @ApiResponseProperty()
  categoryId: number;

  @ApiResponseProperty()
  tournamentCount: number;
}

export class SubcategoryResponseExtended
  extends SubcategoryResponse
  implements IExtendedSubcategoryResponse
{
  @ApiResponseProperty({ type: CategoryMiniResponseWithLogo })
  category: CategoryMiniResponseWithLogo;

  @ApiResponseProperty()
  createdAt: Date;
}
