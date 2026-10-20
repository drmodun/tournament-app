import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { groupRoleEnum, userRoleEnum } from '@tournament-app/types';
import { and, eq, exists, inArray, or } from 'drizzle-orm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { db } from 'src/db/db';
import { groupToUser, tournament } from 'src/db/schema';

// Passes for users who manage at least one tournament (its creator, or an admin of its affiliated
// group), and for site admins. Used for the fake players and groups that fill tournament brackets.
@Injectable()
export class TournamentManagerGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!(await super.canActivate(context))) {
      return false;
    }

    const user = context.switchToHttp().getRequest().user;

    if (user.role === userRoleEnum.ADMIN) {
      return true;
    }

    if (!(await this.managesAnyTournament(user.id))) {
      throw new ForbiddenException(
        'Only tournament organisers can create fake players and groups',
      );
    }

    return true;
  }

  async managesAnyTournament(userId: number): Promise<boolean> {
    const result = await db
      .select({ id: tournament.id })
      .from(tournament)
      .where(
        or(
          eq(tournament.creatorId, userId),
          exists(
            db
              .select({ groupId: groupToUser.groupId })
              .from(groupToUser)
              .where(
                and(
                  eq(groupToUser.groupId, tournament.affiliatedGroupId),
                  eq(groupToUser.userId, userId),
                  inArray(groupToUser.role, [
                    groupRoleEnum.ADMIN,
                    groupRoleEnum.OWNER,
                  ]),
                ),
              ),
          ),
        ),
      )
      .limit(1);

    return result.length > 0;
  }
}
