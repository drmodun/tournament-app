import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ICreateTournamentRequest,
  IUpdateTournamentRequest,
  TournamentResponsesEnum,
  BaseTournamentResponseType,
} from '@tournament-app/types';
import { TournamentDrizzleRepository } from './tournament.repository';
import { TournamentQuery } from './dto/requests.dto';
import {
  AnyTournamentReturnType,
  TournamentReturnTypesEnumType,
} from './types';

@Injectable()
export class TournamentService {
  constructor(private readonly repository: TournamentDrizzleRepository) {}

  async create(createTournamentDto: ICreateTournamentRequest) {
    const tournament = await this.repository.createEntity({
      ...createTournamentDto,
    });

    if (!tournament[0]) {
      throw new UnprocessableEntityException('Tournament creation failed');
    }

    return tournament[0];
  }

  async findAll<TResponseType extends BaseTournamentResponseType>(
    query: TournamentQuery,
  ): Promise<TResponseType[]> {
    const { responseType = TournamentResponsesEnum.BASE, ...queryParams } =
      query;
    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findOne<TResponseType extends AnyTournamentReturnType>(
    id: number,
    responseType: TournamentReturnTypesEnumType = TournamentResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results[0]) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateTournamentDto: IUpdateTournamentRequest) {
    const tournament = await this.repository.updateEntity(
      id,
      updateTournamentDto,
    );

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return tournament[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return action[0];
  }
}
