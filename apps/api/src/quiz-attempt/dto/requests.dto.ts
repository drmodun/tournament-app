import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';
export class SubmitQuizAttemptRequest {
  @ApiProperty()
  @IsBoolean()
  isSubmitted: boolean;
}

export class CreateQuizAnswerRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  answer?: string;

  @ApiPropertyOptional({
    description: 'Selected option ID for multiple choice questions',
  })
  @IsOptional()
  @IsInt()
  selectedOptionId?: number;

  quizQuestionId?: number;
  attemptId?: number;
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
