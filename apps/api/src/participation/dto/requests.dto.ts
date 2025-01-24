import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationResponsesEnum } from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class QueryParticipationDto extends BaseQuery<ParticipationResponsesEnum> {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  tournamentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  groupId?: number;
}
