import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateScoreDto } from './create-score.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateScoreDto extends PartialType(CreateScoreDto) {
  @ApiProperty({ description: 'Score value', required: false })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({
    description: 'Whether this score represents a win',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isWinner?: boolean;
}
