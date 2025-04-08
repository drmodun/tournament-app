import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationResponsesEnum } from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class QueryParticipationDto extends BaseQuery<ParticipationResponsesEnum> {
  @ApiPropertyOptional({
    description: 'Filter participations by tournament ID',
    example: 123,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  tournamentId?: number;

  @ApiPropertyOptional({
    description: 'Filter participations by user ID',
    example: 456,
    type: Number,
    nullable: true,
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter participations by group ID',
    example: 789,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  groupId?: number;
}
