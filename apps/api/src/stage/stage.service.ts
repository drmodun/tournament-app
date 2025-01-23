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
} from '@tournament-app/types';
import { StageDrizzleRepository } from './stage.repository';
import { StageQuery } from './dto/requests.dto';

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
}
