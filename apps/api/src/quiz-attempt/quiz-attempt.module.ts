import { Module } from '@nestjs/common';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptDrizzleRepository } from './quiz-attempt.repository';
import { QuizModule } from '../quiz/quiz.module';
import { CanAccessAttemptGuard } from './guards/can-access-attempt.guard';
import { QuizAttemptValidationGuard } from './guards/quiz-attempt-validation.guard';

@Module({
  imports: [QuizModule],
  controllers: [QuizAttemptController],
  providers: [
    QuizAttemptService,
    QuizAttemptDrizzleRepository,
    CanAccessAttemptGuard,
    QuizAttemptValidationGuard,
  ],
  exports: [QuizAttemptService],
})
export class QuizAttemptModule {}
