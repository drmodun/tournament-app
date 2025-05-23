import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import {
  groupTypeEnum,
  IExtendedTournamentResponse,
  IMiniUserResponse,
  tournamentTeamTypeEnum,
  UserResponsesEnum,
} from '^tournament-app/types';
import { UsersService } from 'src/users/users.service';
import { GroupService } from 'src/group/group.service';
import { TeamTypeExtractor } from 'src/base/static/teamTypeExtractor';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentIsFakePlayersAllowedGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private groupService: GroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const tournament = request.tournament as IExtendedTournamentResponse;

    const applicationType = TeamTypeExtractor.getTeamTypeFromUrl(
      request.originalUrl,
    );

    const isFake =
      applicationType == tournamentTeamTypeEnum.SOLO
        ? await this.checkIfPlayerIsFake(request.params.userId)
        : await this.checkIfGroupIsFake(request.params.groupId);

    if (isFake) {
      if (!tournament.isFakePlayersAllowed || tournament.isRanked) {
        throw new ForbiddenException(
          'Fake players are not allowed to participate in this tournament',
        );
      }
    }

    return true;
  }

  private async checkIfPlayerIsFake(userId: number): Promise<boolean> {
    if (!userId) throw new BadRequestException('User id is not provided');

    const user = await this.userService.findOneIncludingFake<IMiniUserResponse>(
      userId,
      UserResponsesEnum.MINI,
    );

    return user.isFake;
  }

  private async checkIfGroupIsFake(groupId: number): Promise<boolean> {
    if (!groupId) throw new BadRequestException('Group id is not provided');

    const group = await this.groupService.findOne(groupId);

    return group.type == groupTypeEnum.FAKE;
  }
}
