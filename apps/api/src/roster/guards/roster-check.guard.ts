import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  ICreateRosterMemberRequest,
  IParticipationResponse,
  IExtendedStageResponseWithTournament,
  StageResponsesEnum,
  IExtendedStageResponse,
  userRoleEnum,
} from '@tournament-app/types';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { ParticipationService } from 'src/participation/participation.service';
import { RosterService } from '../roster.service';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { StageService } from 'src/stage/stage.service';

@Injectable()
export class CanRosterBeUsedGuard implements CanActivate {
  constructor(
    private readonly participationService: ParticipationService,
    private readonly rosterService: RosterService,
    private readonly stageService: StageService,
    private readonly groupMemberService: GroupMembershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: ValidatedUserDto = request.user;

    if (user.role === userRoleEnum.ADMIN) {
      return true;
    }

    let participationId =
      request.params?.participationId ||
      request.body?.participationId ||
      request.query?.participationId ||
      null;
    let stageId =
      request.params?.stageId ||
      request.body?.stageId ||
      request.query?.stageId ||
      null;

    const rosterId =
      request.params?.rosterId ||
      request.body?.rosterId ||
      request.query?.rosterId ||
      null;

    if (rosterId) {
      const roster = await this.rosterService.findOne(rosterId);
      if (!roster) {
        throw new BadRequestException('Roster not found');
      }

      request.params.participationId = participationId;
      request.params.stageId = stageId;

      participationId = roster.participationId;
      stageId = roster.stageId;
    }

    const members: ICreateRosterMemberRequest[] = request.body?.members;

    if (!participationId || !stageId) {
      throw new BadRequestException(
        'Participation ID and Stage ID are required',
      );
    }

    if (!members || members?.length === 0) {
      throw new BadRequestException('Members are required');
    }

    const participation: IParticipationResponse =
      await this.participationService.findOne(participationId);

    if (!participation) {
      throw new ForbiddenException('Participation not found');
    }

    if (participation.userId === user.id) {
      // Implies the participation is solo
      this.validateForSolo(user.id, members);
    }

    if (participation.groupId) {
      // Implies the participation is in a group
      await this.validateAdminStatus(participation.groupId, user.id);
      await this.validateEntireRosterGroupMembership(
        participation.groupId,
        members,
      );
    }

    const stage: IExtendedStageResponse = await this.stageService.findOne(
      stageId,
      StageResponsesEnum.EXTENDED,
    );

    if (!stage) {
      throw new ForbiddenException('Stage does not exist');
    }

    request.stage = stage;

    if (stage.tournamentId !== participation.tournamentId) {
      throw new ForbiddenException('Stage does not belong to tournament');
    }

    const memberIds = members?.map((member) => member.userId);


    const isAnyMemberInAnotherRoster =
      await this.rosterService.isAnyMemberInAnotherRoster(
        memberIds,
        stageId,
        rosterId && [rosterId],
      );

    if (isAnyMemberInAnotherRoster) {
      throw new ForbiddenException(
        'One or more of the selected players are already in another roster',
      );
    }

    const isEachMemberTournamentEligible =
      await this.rosterService.isEachMemberTournamentEligible(memberIds, stage);


    if (!isEachMemberTournamentEligible) {
      throw new ForbiddenException(
        'One or more of the selected players are not eligible for this stage, check elo and fake status',
      );
    }

    return true;
  }

  validateForSolo(userId: number, members: ICreateRosterMemberRequest[]) {
    members?.forEach((member) => {
      if (member.userId !== userId) {
        throw new ForbiddenException(
          'You cannot create a roster with other players as a solo player',
        );
      }
    });

    return true;
  }

  async validateAdminStatus(groupId: number, userId: number) {
    const adminCheck = await this.groupMemberService.isAdmin(groupId, userId);
    if (!adminCheck) {
      throw new ForbiddenException('You are not an admin of this group');
    }
  }

  async validateEntireRosterGroupMembership(
    groupId: number,
    members: ICreateRosterMemberRequest[],
  ) {
    const promises = members?.map((member) =>
      this.validateRosterMemberGroupMembership(groupId, member.userId),
    );

    await Promise.all(promises);
  }

  async validateRosterMemberGroupMembership(groupId: number, userId: number) {
    const groupMembership = await this.groupMemberService.isMember(
      groupId,
      userId,
    );
    if (!groupMembership) {
      throw new ForbiddenException(
        'One or more of the selected players are not members of the group',
      );
    }
  }

  checkIfMembersAreEligibleForStage(
    members: ICreateRosterMemberRequest[],
    stage: IExtendedStageResponseWithTournament,
  ) {
    const rosterSize = members?.length;
    const maxPlayersPerStage = stage.maxPlayersPerTeam;

    const currentTime = new Date().getTime();

    if (stage.startDate.getTime() < currentTime) {
      throw new ForbiddenException('Stage has already started');
    }

    if (maxPlayersPerStage && rosterSize > maxPlayersPerStage) {
      throw new ForbiddenException('Roster size is too large');
    }

    if (stage.minPlayersPerTeam && rosterSize < stage.minPlayersPerTeam) {
      throw new ForbiddenException('Roster size is too small');
    }

    const substituteAmount = members?.filter(
      (member) => member.isSubstitute,
    ).length;

    if (substituteAmount && substituteAmount > stage.maxSubstitutes) {
      throw new ForbiddenException('Substitute amount is too large');
    }
  }
}
