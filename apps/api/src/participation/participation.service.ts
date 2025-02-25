import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParticipationDrizzleRepository } from './participation.repository';
import {
  ParticipationResponsesEnum,
  BaseParticipationResponseType,
} from '@tournament-app/types';
import { QueryParticipationDto } from './dto/requests.dto';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { TournamentParticipantArgument } from './types';

@Injectable()
export class ParticipationService {
  constructor(
    private readonly participationRepository: ParticipationDrizzleRepository,
  ) {}

  async create(
    tournamentId: number,
    { groupId, userId }: TournamentParticipantArgument,
  ) {
    if (!userId && !groupId) {
      throw new BadRequestException(
        'Either userId or groupId must be provided',
      );
    }

    const action = await this.participationRepository.createEntity({
      tournamentId,
      userId,
      groupId,
    });

    if (!action[0]) {
      throw new BadRequestException('Failed to create participation');
    }

    return action[0];
  }

  async findAll<TResponseType extends BaseParticipationResponseType>(
    query: QueryParticipationDto,
  ): Promise<TResponseType[]> {
    const results = await this.participationRepository.getQuery(query);
    return results as TResponseType[];
  }

  async findOne<TResponseType extends BaseParticipationResponseType>(
    id: number,
    responseType: ParticipationResponsesEnum = ParticipationResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.participationRepository.getSingleQuery(
      id,
      responseType,
    );

    if (results.length === 0) {
      throw new NotFoundException('Participation not found');
    }

    return results[0] as TResponseType;
  }

  async findOneWithoutThrow(
    id: number,
    responseType: ParticipationResponsesEnum = ParticipationResponsesEnum.BASE,
  ) {
    const results = await this.participationRepository.getSingleQuery(
      id,
      responseType,
    );

    return results[0] || null;
  }

  async update(
    id: number,
    updateParticipationDto: Partial<{
      points: number;
    }>,
  ): Promise<ActionResponsePrimary> {
    if (!(await this.entityExists(id))) {
      throw new NotFoundException('Participation not found');
    }

    const action = this.participationRepository.updateEntity(
      id,
      updateParticipationDto,
    );

    const result = await action;

    if (!result[0]) {
      throw new NotFoundException('Participation update failed');
    }

    return result[0];
  }

  async entityExists(id: number): Promise<boolean> {
    const results = await this.participationRepository.getSingleQuery(
      id,
      ParticipationResponsesEnum.MINI,
    );
    return results.length > 0;
  }

  async remove(id: number): Promise<void> {
    if (!(await this.entityExists(id))) {
      throw new NotFoundException('Participation not found');
    }

    await this.participationRepository.deleteEntity(id);
  }

  async isParticipant(
    tournamentId: number,
    { groupId, userId }: TournamentParticipantArgument,
  ): Promise<boolean> {
    if (!userId && !groupId) {
      return false;
    }

    const results = await this.participationRepository.getQuery({
      userId,
      tournamentId,
      groupId,
    } as QueryParticipationDto);

    return results.length > 0;
  }
}
