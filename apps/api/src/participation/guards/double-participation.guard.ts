import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ParticipationService } from '../participation.service';

@Injectable()
export class DoubleParticipationGuard implements CanActivate {
  constructor(private readonly participationService: ParticipationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tournament = request.tournament;

    const userId = request.params.userId || request.user.id;

    const groupId = request.params.groupId;

    const isAlreadyParticipating =
      await this.participationService.isParticipant(tournament.id, {
        groupId,
        userId,
      });

    if (isAlreadyParticipating) {
      throw new ForbiddenException(
        'You are already participating in this tournament',
      );
    }

    return true;
  }
}
