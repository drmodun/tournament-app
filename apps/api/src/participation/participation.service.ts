import { Injectable, NotFoundException } from '@nestjs/common';
import { ParticipationDrizzleRepository } from './participation.repository';
import {
  ParticipationResponsesEnum,
  BaseParticipationResponseType,
} from '@tournament-app/types';
import { QueryParticipationDto } from './dto/requests.dto';

@Injectable()
export class ParticipationService {
  constructor(
    private readonly participationRepository: ParticipationDrizzleRepository,
  ) {}

  async create(tournamentId: number, userId?: number, groupId?: number) {
    if (!userId && !groupId) {
      throw new Error('Either userId or groupId must be provided');
    }

    const action = this.participationRepository.createEntity({
      tournamentId,
      userId,
      groupId,
    });

    await action;
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
  ): Promise<void> {
    if (!(await this.entityExists(id))) {
      throw new NotFoundException('Participation not found');
    }

    const action = this.participationRepository.updateEntity(
      id,
      updateParticipationDto,
    );

    await action;
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
    userId?: number,
    groupId?: number,
  ): Promise<boolean> {
    if (!userId && !groupId) {
      return false;
    }

    const results = await this.participationRepository.getQuery({
      query: { userId, tournamentId, groupId },
    } as QueryParticipationDto);

    return results.length > 0;
  }
}
