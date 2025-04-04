import { Module } from '@nestjs/common';
import { QuizDrizzleRepository } from './quiz.repository';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { CanEditQuizGuard } from './guards/can-edit-quiz.guard';

@Module({
  controllers: [QuizController],
  providers: [QuizService, QuizDrizzleRepository, CanEditQuizGuard],
  exports: [QuizService, QuizDrizzleRepository, CanEditQuizGuard],
})
export class QuizModule {}
