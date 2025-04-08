import { Module } from '@nestjs/common';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptDrizzleRepository } from './quiz-attempt.repository';
import { QuizModule } from '../quiz/quiz.module';
import { CanAccessAttemptGuard } from './guards/can-access-attempt.guard';

@Module({
  imports: [QuizModule],
  controllers: [QuizAttemptController],
  providers: [
    QuizAttemptService,
    QuizAttemptDrizzleRepository,
    CanAccessAttemptGuard,
  ],
  exports: [QuizAttemptService],
})
export class QuizAttemptModule {}
