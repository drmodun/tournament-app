import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ICreateStageDto,
  IUpdateStageDto,
  StageResponsesEnum,
  BaseStageResponseType,
  IStageResponse,
  StageSortingEnum,
  stageToUpdateTournamentRequest,
} from '@tournament-app/types';
import { StageDrizzleRepository } from './stage.repository';
import { StageQuery } from './dto/requests.dto';
import { IStageWithChallongeTournament, StagesWithDates } from './types';
import { ChallongeService } from 'src/challonge/challonge.service';
import { PaginationOnly } from 'src/base/query/baseQuery';

@Injectable()
export class StageService {
  constructor(
    private readonly repository: StageDrizzleRepository,
    private readonly challongeService: ChallongeService,
  ) {}

  async create(createStageDto: ICreateStageDto) {
    const stage = await this.repository.createEntity({
      ...createStageDto,
    });

    if (!stage[0]) {
      throw new UnprocessableEntityException('Stage creation failed');
    }

    console.log(stage[0]);

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

    try {
      await this.challongeService.deleteTournament(stage.challongeTournamentId);
    } catch {
      console.error('Challonge issue ');
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

    return stageId === firstStage.id;
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
}
