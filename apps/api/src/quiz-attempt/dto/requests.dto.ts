import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';
export class CreateQuizAttemptRequest {
  @ApiProperty({ description: 'Quiz ID' })
  @IsInt()
  quizId: number;
}

export class SubmitQuizAttemptRequest {
  @ApiProperty()
  @IsBoolean()
  isSubmitted: boolean;
}

export class CreateQuizAnswerRequest {
  @ApiProperty()
  @IsInt()
  quizQuestionId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({
    description: 'Selected option ID for multiple choice questions',
  })
  @IsOptional()
  @IsInt()
  selectedOptionId?: number;
}

export class UpdateQuizAnswerRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({
    description: 'Selected option ID for multiple choice questions',
  })
  @IsOptional()
  @IsInt()
  selectedOptionId?: number;
}

export class QuizAttemptQuery extends BaseQuery {
  @ApiPropertyOptional({ description: 'Quiz ID' })
  @IsOptional()
  @IsInt()
  quizId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSubmitted?: boolean;
}
