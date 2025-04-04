import { Module } from '@nestjs/common';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptDrizzleRepository } from './quiz-attempt.repository';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  imports: [QuizModule],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService, QuizAttemptDrizzleRepository],
  exports: [QuizAttemptService],
})
export class QuizAttemptModule {}
