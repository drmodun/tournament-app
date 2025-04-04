import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ICreateQuizQuestionDto,
  IUpdateQuizQuestionDto,
  quizQuestionTypeEnum,
} from '@tournament-app/types';
import { CreateQuizOptionDto } from './option.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateQuizQuestionDto implements ICreateQuizQuestionDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  quizId?: number;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  question: string;

  @ApiProperty({
    enum: quizQuestionTypeEnum,
  })
  @IsEnum(quizQuestionTypeEnum)
  questionType: quizQuestionTypeEnum;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  timeLimit: number | null;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  points?: number | null;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  explanation?: string | null;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  @IsOptional()
  options?: CreateQuizOptionDto[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  isImmediateFeedback?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  correctAnswers?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image: string | null;
}

export class UpdateQuizQuestionDto
  extends PartialType(CreateQuizQuestionDto)
  implements IUpdateQuizQuestionDto {}
