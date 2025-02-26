import { ApiResponseProperty } from '@nestjs/swagger';
import {
  ICategoryMiniResponseWithLogo,
  IEloRequirementResponse,
  IGroupRequirementsResponse,
} from '@tournament-app/types';
import { Type } from 'class-transformer';
import { CategoryMiniResponseWithLogo } from 'src/category/dto/responses.dto';

export class EloRequirementResponseDto implements IEloRequirementResponse {
  @ApiResponseProperty()
  categoryId: number;

  @ApiResponseProperty()
  minimumElo: number;

  @ApiResponseProperty()
  maximumElo: number;

  @ApiResponseProperty({
    type: CategoryMiniResponseWithLogo,
  })
  @Type(() => CategoryMiniResponseWithLogo)
  category: ICategoryMiniResponseWithLogo;
}

export class GroupRequirementsResponseDto
  implements IGroupRequirementsResponse
{
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  minimumAge?: number;

  @ApiResponseProperty()
  maximumAge?: number;

  @ApiResponseProperty()
  isSameCountry?: boolean;

  @ApiResponseProperty({
    type: [EloRequirementResponseDto],
  })
  @Type(() => EloRequirementResponseDto)
  eloRequirements: IEloRequirementResponse[];
}
