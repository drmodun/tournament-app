import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ICreateGroupRequirementsRequest,
  IUpdateGroupRequirementsRequest,
  IEloRequirement,
} from '@tournament-app/types';
import 'reflect-metadata';
import { ApiProperty } from '@nestjs/swagger';

export class EloRequirementDto implements IEloRequirement {
  @ApiProperty({
    description: 'ID of the category for the Elo requirement',
    example: 1,
    required: true,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Minimum Elo rating for the category',
    example: 1000,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Max(5000)
  minimumElo: number;

  @ApiProperty({
    description: 'Maximum Elo rating for the category',
    example: 2000,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Max(5000)
  maximumElo: number;
}

export class CreateGroupRequirementsDto
  implements ICreateGroupRequirementsRequest
{
  @ApiProperty({
    description: 'Minimum age requirement for the group',
    example: 18,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumAge?: number;

  @ApiProperty({
    description: 'Maximum age requirement for the group',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maximumAge?: number;

  @ApiProperty({
    description:
      'Whether the group is restricted to users from the same country',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  isSameCountry?: boolean;

  @ApiProperty({
    description: 'Elo requirements for the group',
    example: [{ categoryId: 1, minimumElo: 1000, maximumElo: 2000 }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) =>
    value.map((item) => plainToInstance(EloRequirementDto, item)),
  )
  @Type(() => EloRequirementDto)
  eloRequirements?: EloRequirementDto[];
}

export class UpdateGroupRequirementsDto
  implements IUpdateGroupRequirementsRequest
{
  @ApiProperty({
    description: 'Minimum age requirement for the group',
    example: 18,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumAge?: number;

  @ApiProperty({
    description: 'Maximum age requirement for the group',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maximumAge?: number;

  @ApiProperty({
    description:
      'Whether the group is restricted to users from the same country',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSameCountry?: boolean;

  @ApiProperty({
    description: 'Elo requirements for the group',
    example: [{ categoryId: 1, minimumElo: 1000, maximumElo: 2000 }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EloRequirementDto)
  eloRequirements?: EloRequirementDto[];
}
