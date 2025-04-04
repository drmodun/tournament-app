import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QuizService } from '../quiz.service';

@Injectable()
export class CanEditQuizGuard implements CanActivate {
  constructor(private readonly quizService: QuizService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const quizId = parseInt(request.params.quizId);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (isNaN(quizId)) {
      throw new NotFoundException('Invalid quiz ID');
    }

    await this.quizService.checkAuthor(quizId, user.id);
    return true;
  }
}
