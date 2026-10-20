import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { QuizAttemptService } from '../quiz-attempt.service';

@Injectable()
export class CanSubmitAnswerGuard implements CanActivate {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const attemptId = parseInt(request.params.attemptId);
    const questionId = request.params.questionId
      ? parseInt(request.params.questionId)
      : null;
    const answerId = request.params.answerId
      ? parseInt(request.params.answerId)
      : null;

    const user = request.user;

    if (user?.role === 'admin') {
      return true;
    }

    await this.quizAttemptService.checkAttempter(attemptId, user.id);
    await this.quizAttemptService.checkAttemptIsOpen(attemptId);

    if (request.method === 'POST') {
      await this.checkForPostAttempt(attemptId, questionId);
    } else if (request.method === 'PUT') {
      await this.checkForPutAttempt(attemptId, answerId);
    }

    return true;
  }

  async checkForPostAttempt(attemptId: number, questionId: number) {
    await this.quizAttemptService.checkIfAnswerExists(attemptId, questionId);
    await this.quizAttemptService.checkQuestionIsCurrent(attemptId, questionId);
  }

  async checkForPutAttempt(attemptId: number, answerId: number) {
    await this.quizAttemptService.checkAnswersCanChange(attemptId);

    const isFinal =
      await this.quizAttemptService.checkIfTheAnswerIsFinal(answerId);

    if (isFinal) {
      throw new ForbiddenException(
        'This answer is final and can no longer be changed',
      );
    }
  }
}
