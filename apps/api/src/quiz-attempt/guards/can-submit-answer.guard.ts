import {
  BadRequestException,
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

    if (request.method === 'POST') {
      await this.checkForPostAttempt(attemptId, questionId);
    } else if (request.method === 'PUT') {
      await this.checkForPutAttempt(answerId);
    }

    return true;
  }

  async checkForPostAttempt(attemptId: number, questionId: number) {
    const attempt = await this.quizAttemptService.checkIfAnswerExists(
      attemptId,
      questionId,
    );

    if (attempt) {
      throw new BadRequestException('Answer already exists');
    }
  }

  async checkForPutAttempt(answerId: number) {
    const isFinal =
      await this.quizAttemptService.checkIfTheAnswerIsFinal(answerId);

    if (isFinal) {
      throw new ForbiddenException('Answer is not final, you cannot change it');
    }
  }
}
