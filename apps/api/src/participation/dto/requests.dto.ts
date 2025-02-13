import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationResponsesEnum } from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class QueryParticipationDto extends BaseQuery<ParticipationResponsesEnum> {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  tournamentId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  groupId?: number;
}
