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

export class EloRequirementDto implements IEloRequirement {
  @IsNumber()
  categoryId: number;

  @IsNumber()
  @Min(0)
  @Max(5000)
  minimumElo: number;

  @IsNumber()
  @Min(0)
  @Max(5000)
  maximumElo: number;
}

export class CreateGroupRequirementsDto
  implements ICreateGroupRequirementsRequest
{
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maximumAge?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  isSameCountry?: boolean;

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
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maximumAge?: number;

  @IsOptional()
  @IsBoolean()
  isSameCountry?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EloRequirementDto)
  eloRequirements?: EloRequirementDto[];
}
