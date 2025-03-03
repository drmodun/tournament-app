import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateScoreDto {
  @ApiProperty({ description: 'ID of the matchup this score belongs to' })
  @IsNumber()
  matchupId: number;

  @ApiProperty({ description: 'ID of the roster this score belongs to' })
  @IsNumber()
  rosterId: number;

  @ApiProperty({ description: 'Score value' })
  @IsNumber()
  score: number;

  @ApiProperty({
    description: 'Whether this score represents a win',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isWinner?: boolean;
}
