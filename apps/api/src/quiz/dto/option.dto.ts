import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ICreateQuizOptionDto } from '@tournament-app/types';
import { Transform } from 'class-transformer';

export class CreateQuizOptionDto implements ICreateQuizOptionDto {
  @ApiProperty()
  @IsString()
  option: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isCorrect: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  questionId?: number;

  @ApiPropertyOptional({ description: 'Option order' })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateQuizOptionDto {
  @ApiPropertyOptional({ description: 'Option text' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'Is this the correct option' })
  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;

  @ApiPropertyOptional({ description: 'Option order' })
  @IsNumber()
  @IsOptional()
  order?: number;
}
