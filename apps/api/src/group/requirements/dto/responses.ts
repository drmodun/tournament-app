import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  ICategoryMiniResponseWithLogo,
  IEloRequirementResponse,
  IGroupRequirementsResponse,
} from '@tournament-app/types';
import { Type } from 'class-transformer';
import { CategoryMiniResponseWithLogo } from 'src/category/dto/responses.dto';

export class EloRequirementResponseDto implements IEloRequirementResponse {
  @ApiProperty({
    description: 'ID of the category for the Elo requirement',
    example: 1,
    required: true,
  })
  categoryId: number;

  @ApiProperty({
    description: 'Minimum Elo rating for the category',
    example: 1000,
    required: true,
  })
  minimumElo: number;

  @ApiProperty({
    description: 'Maximum Elo rating for the category',
    example: 2000,
    required: true,
  })
  maximumElo: number;

  @ApiProperty({
    description: 'Category',
    type: CategoryMiniResponseWithLogo,
  })
  @Type(() => CategoryMiniResponseWithLogo)
  category: ICategoryMiniResponseWithLogo;
}

export class GroupRequirementsResponseDto
  implements IGroupRequirementsResponse
{
  @ApiProperty({
    description: 'ID of the group requirements',
    example: 1,
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the group',
    example: 456,
    required: true,
  })
  groupId: number;

  @ApiProperty({
    description: 'Minimum age requirement for the group',
    example: 18,
    required: false,
  })
  minimumAge?: number;

  @ApiProperty({
    description: 'Maximum age requirement for the group',
    example: 65,
    required: false,
  })
  maximumAge?: number;

  @ApiProperty({
    description: 'Whether the group requires members to be from the same country',
    example: true,
    required: false,
  })
  isSameCountry?: boolean;

  @ApiProperty({
    description: 'Elo requirements for the group',
    type: [EloRequirementResponseDto],
  })
  @Type(() => EloRequirementResponseDto)
  eloRequirements: IEloRequirementResponse[];
}
