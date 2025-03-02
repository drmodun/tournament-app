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
} from '@tournament-app/types';
import { StageDrizzleRepository } from './stage.repository';
import { StageQuery } from './dto/requests.dto';
import { StagesWithDates } from './types';

@Injectable()
export class StageService {
  constructor(private readonly repository: StageDrizzleRepository) {}

  async create(createStageDto: ICreateStageDto) {
    const stage = await this.repository.createEntity({
      ...createStageDto,
    });

    if (!stage[0]) {
      throw new UnprocessableEntityException('Stage creation failed');
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

  async update(id: number, updateStageDto: IUpdateStageDto) {
    const stage = await this.repository.updateEntity(id, updateStageDto);

    if (!stage[0]) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage[0];
  }

  async remove(id: number) {
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
