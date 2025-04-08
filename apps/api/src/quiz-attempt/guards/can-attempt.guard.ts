import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { QuizAttemptService } from '../quiz-attempt.service';

@Injectable()
export class CanAttemptGuard implements CanActivate {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const quizId = parseInt(request.params.quizId || request.body.quizId);

    if (user?.role === 'admin') {
      return true;
    }

    const isRetakeable =
      await this.quizAttemptService.checkIfQuizIsRetakeable(quizId);

    if (!isRetakeable) {
      await this.quizAttemptService.checkForPreviousAttempt(quizId, user.id);
    }

    return true;
  }
}
