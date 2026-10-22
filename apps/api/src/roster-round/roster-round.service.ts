import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IRosterRoundResponse,
  RosterRoundSortingEnum,
} from '@tournament-app/types';
import { RosterRoundDrizzleRepository } from './roster-round.repository';
import { RosterRoundQuery } from './dto/requests.dto';

@Injectable()
export class RosterRoundService {
  constructor(private readonly repository: RosterRoundDrizzleRepository) {}

  async findAll(query: RosterRoundQuery): Promise<IRosterRoundResponse[]> {
    if (!query.stageId && !query.rosterId) {
      throw new BadRequestException('Filter by stageId or rosterId');
    }

    const { field = RosterRoundSortingEnum.ROUND_NUMBER, order = 'asc' } =
      query;

    const results = await this.repository.getQuery({
      ...query,
      responseType: 'base',
      field,
      order,
    });

    return results as unknown as IRosterRoundResponse[];
  }
}
