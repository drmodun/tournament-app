import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TournamentService } from '../tournament.service';
import { userRoleEnum } from '@tournament-app/types';
import { ITournamentWithRelations } from '../types';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';

@Injectable()
export class TournamentAdminGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly groupMembershipService: GroupMembershipService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!(await super.canActivate(context))) {
      return false;
    } // This fills in the user

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (user.role === userRoleEnum.ADMIN) {
      return true;
    }

    const tournamentId =
      request.params.tournamentId ||
      request.body.tournamentId ||
      request.query.tournamentId ||
      null;

    const tournament =
      await this.tournamentService.findOne<ITournamentWithRelations>(
        tournamentId,
      );

    if (tournament.creatorId === user.id) {
      return true;
    }

    if (!tournament.affiliatedGroupId) {
      return false;
    }

    return await this.groupMembershipService.isAdmin(
      tournament.affiliatedGroupId,
      user.id,
    );
  }
}
