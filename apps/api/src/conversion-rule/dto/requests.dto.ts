import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  pointConversionStrategyEnum,
  pointConversionTypeEnum,
} from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class CreateConversionRuleDto {
  @ApiProperty({
    enum: pointConversionTypeEnum,
    description:
      'What source and destination are: stage_to_stage, stage_to_tournament or tournament_to_tournament',
  })
  @IsEnum(pointConversionTypeEnum)
  type: pointConversionTypeEnum;

  @ApiProperty({
    enum: pointConversionStrategyEnum,
    description:
      'ranking: points by place. qualification: places in range get an entry in the destination. elimination: qualification that also removes the other entries from the destination stage. seed: qualification in order of place. hybrid: qualification plus ranking points. tie_breaker: entries in range that share their place get an entry in the destination. qualification_with_lcq: qualification, and the places after the range enter lastChanceDestination',
  })
  @IsEnum(pointConversionStrategyEnum)
  strategy: pointConversionStrategyEnum;

  @ApiProperty({
    description: 'ID of the stage or tournament whose placings are converted',
  })
  @IsInt()
  source: number;

  @ApiProperty({
    description: 'ID of the stage or tournament that receives them',
  })
  @IsInt()
  destination: number;

  @ApiPropertyOptional({
    description:
      'qualification_with_lcq only: the stage (same tournament, not started) that the places after `to` enter',
  })
  @IsOptional()
  @IsInt()
  lastChanceDestination?: number;

  @ApiPropertyOptional({
    description: 'Points for every place in range, when maxPoints is not set',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'First place in range (default 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  from?: number;

  @ApiPropertyOptional({
    description: 'Last place in range (default: the last place)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  to?: number;

  @ApiPropertyOptional({ description: 'Points for the first place in range' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Fewest points a place in range gets (default 0)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({
    description: 'Points fewer for each place after the first',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsPerPlace?: number;
}

export class ConversionRuleQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  source?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  destination?: number;

  @ApiPropertyOptional({ enum: pointConversionTypeEnum })
  @IsOptional()
  @IsEnum(pointConversionTypeEnum)
  type?: pointConversionTypeEnum;
}
