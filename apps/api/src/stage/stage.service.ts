import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import {
  ICreateStageDto,
  IUpdateStageDto,
  StageResponsesEnum,
  BaseStageResponseType,
  IStageResponse,
  StageSortingEnum,
  stageToUpdateTournamentRequest,
  stageStatusEnum,
  stageTypeEnum,
  rosterToBulkCreateParticipantRequest,
  IBulkCreateChallongeParticipantRequest,
  notificationTypeEnum,
} from '@tournament-app/types';
import { StageDrizzleRepository } from './stage.repository';
import { StageQuery } from './dto/requests.dto';
import { IStageWithChallongeTournament, StagesWithDates } from './types';
import { canRunOnChallonge, isChallongeEnabled } from 'src/challonge/enabled';
import { ChallongeService } from 'src/challonge/challonge.service';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { RosterDrizzleRepository } from 'src/roster/roster.repository';
import { SseNotificationsService } from 'src/infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from 'src/infrastructure/sse-notifications/templates';
import { TemplatesEnum } from 'src/infrastructure/types';
import { MatchesService } from 'src/matches/matches.service';
import { RosterService } from 'src/roster/roster.service';
import { db } from 'src/db/db';
import { vansyStageQuiz } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class StageService {
  constructor(
    private readonly repository: StageDrizzleRepository,
    private readonly challongeService: ChallongeService,
    private readonly rosterRepository: RosterDrizzleRepository,
    private readonly sseNotificationsService: SseNotificationsService,
    private readonly notificationTemplateFiller: NotificationTemplatesFiller,
    private readonly matchesService: MatchesService,
    private readonly rosterService: RosterService,
  ) {}

  async create(createStageDto: ICreateStageDto) {
    const stage = await this.repository.createEntity({
      ...createStageDto,
    });

    if (!stage[0]) {
      throw new UnprocessableEntityException('Stage creation failed');
    }

    await this.rosterService.createForSinglePlayerForNewStage(
      stage[0].id as number,
    );

    if (isChallongeEnabled() && canRunOnChallonge(createStageDto.stageType)) {
      try {
        const stageId = await this.createChallongeTournament(
          stage[0].id as number,
        );

        await this.update(stage[0].id as number, {
          challongeTournamentId: stageId.id,
        });
      } catch (error) {
        console.error(
          'Failed to create challonge tournament, check api key',
          error,
        );
      }
    }

    return stage[0];
  }

  async findAll<TResponseType extends BaseStageResponseType>(
    query: StageQuery,
  ): Promise<TResponseType[]> {
    const { responseType = StageResponsesEnum.BASE, ...queryParams } = query;
    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async createChallongeTournament(stageId: number) {
    const stage: IStageResponse = await this.findOne(
      stageId,
      StageResponsesEnum.BASE,
    );

    try {
      const data =
        await this.challongeService.createChallongeTournamentFromStage(stage);
      await this.update(stageId, {
        challongeTournamentId: data.id,
      });
      return data;
    } catch (error) {
      console.error('Challonge issue', error);
    }
  }

  async getManagedStages(userId: number, pagination?: PaginationOnly) {
    const stages = await this.repository.getManagedStages(userId, pagination);
    return stages;
  }

  async updateChallongeTournament(stageId: number) {
    const stage: IStageWithChallongeTournament = await this.findOne(
      stageId,
      StageResponsesEnum.WITH_CHALLONGE_TOURNAMENT,
    );

    if (!isChallongeEnabled() || !stage.challongeTournamentId) {
      return;
    }

    try {
      await this.challongeService.updateTournament(
        stage.challongeTournamentId,
        stageToUpdateTournamentRequest(stage),
      );
    } catch {
      console.error('Challonge issue');
    }
  }

  async deleteChallongeTournament(stageId: number) {
    const stage: IStageWithChallongeTournament = await this.findOne(
      stageId,
      StageResponsesEnum.WITH_CHALLONGE_TOURNAMENT,
    );

    if (isChallongeEnabled() && stage.challongeTournamentId) {
      try {
        await this.challongeService.deleteTournament(
          stage.challongeTournamentId,
        );
      } catch {
        console.error('Challonge issue ');
      }
    }

    await this.update(stageId, { challongeTournamentId: null });
  }

  async findOne<TResponseType extends BaseStageResponseType>(
    id: number,
    responseType: StageResponsesEnum = StageResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results.length) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(
    id: number,
    updateStageDto: IUpdateStageDto & {
      challongeTournamentId?: string;
    },
  ) {
    const stage = await this.repository.updateEntity(id, updateStageDto);

    if (!stage[0]) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    await this.updateChallongeTournament(id);

    return stage[0];
  }

  // An organiser's edit. Status changes that would skip a step go through their own endpoints, and a
  // stage marked finished by hand finishes like any other, so its conversion rules apply.
  async updateByOrganiser(id: number, updateStageDto: IUpdateStageDto) {
    const { stageStatus, ...rest } = updateStageDto;
    const current: IStageResponse = await this.findOne(id);
    const isChange = stageStatus != null && stageStatus !== current.stageStatus;

    if (isChange && current.stageStatus === stageStatusEnum.FINISHED) {
      throw new BadRequestException(
        `The stage is finished; reopen it with POST /stages/${id}/reopen`,
      );
    }

    if (isChange && stageStatus === stageStatusEnum.ONGOING) {
      throw new BadRequestException(
        `Start the stage with PATCH /stages/start/${id}, which draws its bracket`,
      );
    }

    if (
      isChange &&
      stageStatus === stageStatusEnum.UPCOMING &&
      current.stageStatus === stageStatusEnum.ONGOING
    ) {
      throw new BadRequestException(
        'A stage that has started cannot go back to upcoming',
      );
    }

    if (
      rest.stageType != null &&
      rest.stageType !== current.stageType &&
      current.stageStatus !== stageStatusEnum.UPCOMING &&
      current.stageStatus !== stageStatusEnum.CANCELLED
    ) {
      throw new BadRequestException(
        'The format of a stage that has started cannot change',
      );
    }

    if (isChange && stageStatus === stageStatusEnum.FINISHED) {
      const updated = await this.update(id, rest);
      await this.matchesService.finishStage(id);
      return { ...updated, stageStatus };
    }

    return this.update(id, updateStageDto);
  }

  async remove(id: number) {
    await this.deleteChallongeTournament(id);
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return action[0];
  }

  async getFirstStage(tournamentId: number): Promise<IStageResponse> {
    const stages = await this.repository.getQuery({
      responseType: StageResponsesEnum.MINI,
      field: StageSortingEnum.START_DATE,
      order: 'asc',
      tournamentId,
    } satisfies StageQuery);
    return stages[0];
  }

  async isFirstStage(stageId: number, tournamentId: number): Promise<boolean> {
    const firstStage = await this.getFirstStage(tournamentId);

    return stageId == firstStage.id;
  }

  async getStagesSortedByStartDate(
    tournamentId: number,
  ): Promise<StagesWithDates[]> {
    const stages =
      await this.repository.getAllTournamentStagesSortedByStartDate(
        tournamentId,
      );

    return stages;
  }

  async sendStageStartNotifications(stageId: number, stageName: string) {
    try {
      const rosteredUsers =
        await this.rosterRepository.getUsersInStageRosters(stageId);

      if (!rosteredUsers || rosteredUsers.length === 0) {
        console.log(`No users found in rosters for stage ${stageId}`);
        return;
      }

      const message = this.notificationTemplateFiller.fill(
        TemplatesEnum.TOURNAMENT_START,
        {
          tournament: stageName,
        },
      );

      await this.sseNotificationsService.createWithUsers(
        {
          type: notificationTypeEnum.TOURNAMENT_START,
          message,
          link: `/stage/${stageId}`,
          image: null,
        },
        rosteredUsers.map((user) => user.id),
      );
    } catch (error) {
      console.error(
        `Failed to send stage start notifications: ${error.message}`,
      );
    }
  }

  async startStage(stageId: number) {
    const stage: IStageWithChallongeTournament = await this.findOne(
      stageId,
      StageResponsesEnum.WITH_CHALLONGE_TOURNAMENT,
    );

    if (
      stage.stageStatus === stageStatusEnum.ONGOING ||
      stage.stageStatus === stageStatusEnum.FINISHED
    ) {
      throw new BadRequestException(
        `Stage with ID ${stageId} is already ${stage.stageStatus}`,
      );
    }

    const rosters =
      await this.rosterRepository.getRostersForChallongeParticipants(stageId);

    if (rosters.length === 0) {
      throw new BadRequestException(
        `No rosters found for stage with ID ${stageId}`,
      );
    }

    // A quiz stage run on Vansy is ranked by the quiz, not a bracket: it starts without a draw and is
    // finished when Vansy sends the final standings
    if (
      stage.stageType === stageTypeEnum.QUIZ &&
      (await this.hasVansyQuiz(stageId))
    ) {
      const started = await this.update(stageId, {
        stageStatus: stageStatusEnum.ONGOING,
      });
      await this.sendStageStartNotifications(stageId, stage.name);
      return started;
    }

    // Without Challonge (disabled, or its API failed when the stage was created) the API runs the bracket,
    // as it does for formats Challonge does not have
    if (
      !isChallongeEnabled() ||
      !stage.challongeTournamentId ||
      !canRunOnChallonge(stage.stageType)
    ) {
      return this.startLocalStage(stageId, stage.name);
    }

    const bulkParticipantsRequest: IBulkCreateChallongeParticipantRequest =
      rosterToBulkCreateParticipantRequest(rosters);

    const rostersWithChallongeParticipants =
      await this.challongeService.createBulkParticipants(
        stage.challongeTournamentId,
        bulkParticipantsRequest,
      );

    await this.rosterRepository.attachChallongeParticipantIdToRosters(
      rostersWithChallongeParticipants.map((roster) => ({
        rosterId: rosters.find((r) => r.id === +roster.attributes?.misc)?.id,
        challongeParticipantId: roster.id,
      })),
    );

    const updatedStage = await this.update(stageId, {
      stageStatus: stageStatusEnum.ONGOING,
    });

    await this.challongeService.updateTournamentState(
      stage.challongeTournamentId,
      stageStatusEnum.ONGOING,
    );

    await this.sendStageStartNotifications(stageId, stage.name);

    await this.importInitialChallongeMatches(
      stageId,
      stage.challongeTournamentId,
    );

    return updatedStage;
  }

  private async hasVansyQuiz(stageId: number) {
    const [link] = await db
      .select({ stageId: vansyStageQuiz.stageId })
      .from(vansyStageQuiz)
      .where(eq(vansyStageQuiz.stageId, stageId));
    return !!link;
  }

  private async startLocalStage(stageId: number, stageName: string) {
    await this.matchesService.startLocalBracket(stageId, new Date());

    // A stage with a single roster is already finished by the draw
    const drawn: IStageResponse = await this.findOne(stageId);

    const updatedStage =
      drawn.stageStatus === stageStatusEnum.FINISHED
        ? drawn
        : await this.update(stageId, { stageStatus: stageStatusEnum.ONGOING });

    await this.sendStageStartNotifications(stageId, stageName);

    return updatedStage;
  }

  async getMatchesFromChallonge(challongeTournamentId: string) {
    const matches = await this.challongeService.getTournamentMatches(
      challongeTournamentId,
    );

    return matches.filter((match) => match?.attributes?.round == 1);
  }

  async importInitialChallongeMatches(
    stageId: number,
    challongeTournamentId: string,
  ) {
    const matches = await this.getMatchesFromChallonge(challongeTournamentId);

    await this.matchesService.importChallongeMatchesToStage(stageId, matches);
  }
}
