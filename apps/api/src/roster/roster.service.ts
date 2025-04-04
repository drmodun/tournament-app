import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RosterDrizzleRepository } from './roster.repository';
import {
  RosterResponsesEnum,
  BaseRosterResponse,
  IExtendedStageResponse,
  IExtendedTournamentResponse,
  TournamentResponsesEnum,
  IMiniRosterResponseWithChallongeId,
} from '@tournament-app/types';
import { CreateRosterDto, QueryRosterDto } from './dto/requests';
import { StageDrizzleRepository } from 'src/stage/stage.repository';
import { TournamentService } from 'src/tournament/tournament.service';
import { CareerService } from '../career/career.service';
import { ChallongeService } from 'src/challonge/challonge.service';
@Injectable()
export class RosterService {
  constructor(
    private readonly repository: RosterDrizzleRepository,
    private readonly stageRepository: StageDrizzleRepository,
    private readonly tournamentService: TournamentService,
    private readonly careerService: CareerService,
    private readonly challongeService: ChallongeService,
  ) {}

  async create(
    createRosterDto: CreateRosterDto,
    participationId: number,
    stageId: number,
  ) {
    const roster = await this.repository.createWithPlayers(
      createRosterDto,
      participationId,
      stageId,
    );

    if (!roster?.rosterId) {
      throw new UnprocessableEntityException('Failed to create roster');
    }

    return { id: roster.rosterId };
  }

  async findAll<TResponseType extends BaseRosterResponse>(
    query: QueryRosterDto,
  ): Promise<TResponseType[]> {
    const { responseType = RosterResponsesEnum.BASE, ...queryParams } = query;
    const queryFunction =
      query.responseType == RosterResponsesEnum.MINI
        ? this.repository.getQuery({
            ...queryParams,
            responseType,
          })
        : this.repository.getWithPlayers({
            ...queryParams,
          });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findByPlayer(playerId: number, query: QueryRosterDto) {
    const results = await this.repository.getForPlayer(playerId, query);

    return results;
  }

  async findByGroup(groupId: number, query: QueryRosterDto) {
    const results = await this.repository.getForGroup(groupId, query);

    return results;
  }

  async findByTournament(tournamentId: number, query: QueryRosterDto) {
    const results = await this.repository.getForTournament(tournamentId, query);

    return results;
  }

  async findByParticipation(participationId: number, query: QueryRosterDto) {
    const results = await this.repository.getForParticipation(
      participationId,
      query,
    );

    return results;
  }

  async findByStage(stageId: number, query: QueryRosterDto) {
    const results = await this.repository.getForStage(stageId, query);

    return results;
  }

  async findOne<TResponseType extends BaseRosterResponse>(
    id: number,
    responseType: RosterResponsesEnum = RosterResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getWithPlayers({
      responseType,
      rosterId: id,
    });

    if (!results.length) {
      throw new NotFoundException(`Roster with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateRosterDto: any) {
    await this.repository.updateWithPlayers(id, updateRosterDto);
  }

  async isAnyMemberInAnotherRoster(
    memberIds: number[],
    stageId: number,
    excludeRosterIds?: number[],
  ): Promise<boolean> {
    return await this.stageRepository.isAnyMemberInAnotherRoster(
      memberIds,
      stageId,
      excludeRosterIds,
    );
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Roster with ID ${id} not found`);
    }

    return action[0];
  }

  async removeFromChallonge(id: number) {
    const roster: IMiniRosterResponseWithChallongeId = await this.findOne(
      id,
      RosterResponsesEnum.MINI_WITH_CHALLONGE_ID,
    );

    if (!roster) {
      throw new NotFoundException(`Roster with ID ${id} not found`);
    }

    await this.challongeService.deleteParticipant(roster.challongeId);
  }

  async isEachMemberTournamentEligible(
    memberIds: number[],
    stage: IExtendedStageResponse,
  ) {
    const tournament: IExtendedTournamentResponse =
      await this.tournamentService.findOne(
        stage.tournamentId,
        TournamentResponsesEnum.EXTENDED,
      );

    const careers = await this.careerService.getMultipleCareers(
      memberIds,
      tournament.category?.id,
    );

    if (memberIds.length !== careers.length) {
      return false;
    }

    const playersWithInvalidElo = careers.filter(
      (career) =>
        career.elo &&
        (career.elo <= tournament.minimumMMR ||
          career.elo >= tournament.maximumMMR),
    );

    if (playersWithInvalidElo.length > 0) {
      return false;
    }

    if (tournament.isFakePlayersAllowed) return true;

    const fakePlayers = careers.filter((career) => career.user.isFake);

    if (fakePlayers.length > 0) {
      return false;
    }
  }

  async getOnlyPlayers(rosterId: number) {
    const roster = await this.repository.getOnlyPlayers(rosterId);

    return roster;
  }

  async getChangeAmount(rosterId: number, memberIds: number[]) {
    const roster = await this.getOnlyPlayers(rosterId);

    const currentPlayerIds = roster.map((player) => player.user.id);

    const addedPlayers = memberIds.filter(
      (id) => !currentPlayerIds.includes(id),
    );

    const removedPlayers = currentPlayerIds.filter(
      (id) => !memberIds.includes(id),
    );

    const changeAmount =
      addedPlayers.length +
      removedPlayers.length +
      Math.abs(currentPlayerIds.length - memberIds.length);

    return changeAmount;
  }

  async getManagedRostersForPlayer(stageId: number, playerId: number) {
    const results = await this.repository.getManagedRostersForPlayer(
      stageId,
      playerId,
    );

    return results;
  }
}
