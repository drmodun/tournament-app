import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizAttemptService } from '../quiz-attempt.service';

@Injectable()
export class CanAccessAttemptGuard implements CanActivate {
  constructor(private quizAttemptService: QuizAttemptService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === 'admin') {
      return true;
    }

    const attemptId = parseInt(request.params.attemptId);

    if (!attemptId) {
      throw new NotFoundException('Attempt ID is required');
    }

    await this.quizAttemptService.checkAttempter(attemptId, user.id);

    return true;
  }
}
