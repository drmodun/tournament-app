import { Test, TestingModule } from '@nestjs/testing';
import { TournamentService } from '../tournament.service';
import { TournamentDrizzleRepository } from '../tournament.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTournamentRequest } from '../dto/requests.dto';
import {
  tournamentLocationEnum,
  TournamentResponsesEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';

describe('TournamentService', () => {
  let service: TournamentService;
  let repository: jest.Mocked<TournamentDrizzleRepository>;

  const mockTournament = {
    id: 1,
    name: 'Test Tournament',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    maxTeams: 8,
    minTeams: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      createEntity: jest.fn(),
      getQuery: jest.fn(),
      getSingleQuery: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentService,
        {
          provide: TournamentDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
    repository = module.get(TournamentDrizzleRepository);
  });

  describe('create', () => {
    const createDto: CreateTournamentRequest = {
      name: 'Test Tournament',
      description: 'Test Description',
      startDate: new Date(),
      endDate: new Date(),
      categoryId: 1,
      location: tournamentLocationEnum.ONLINE,
      teamType: tournamentTeamTypeEnum.MIXED,
      tournamentType: tournamentTypeEnum.COMPETITION,
      isPublic: true,
      links: 'https://chess.com/tournament/123',
      maxParticipants: 8,
      country: 'USA',
      isRanked: true,
      affiliatedGroupId: 1,
      creatorId: 1,
    };

    it('should successfully create a tournament', async () => {
      repository.createEntity.mockResolvedValue([mockTournament]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTournament);
      expect(repository.createEntity).toHaveBeenCalledWith(createDto);
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      repository.createEntity.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = {
      responseType: TournamentResponsesEnum.BASE,
      page: 1,
      limit: 10,
    };

    it('should return an array of tournaments', async () => {
      repository.getQuery.mockResolvedValue([mockTournament]);

      const result = await service.findAll(query);

      expect(result).toEqual([mockTournament]);
      expect(repository.getQuery).toHaveBeenCalledWith({
        page: query.page,
        limit: query.limit,
        responseType: query.responseType,
      });
    });

    it('should return empty array when no tournaments found', async () => {
      repository.getQuery.mockResolvedValue([]);

      const result = await service.findAll(query);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single tournament', async () => {
      repository.getSingleQuery.mockResolvedValue([mockTournament]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTournament);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException when tournament not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Tournament',
    };

    it('should successfully update a tournament', async () => {
      const updatedTournament = { ...mockTournament, ...updateDto };
      repository.updateEntity.mockResolvedValue([updatedTournament]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedTournament);
      expect(repository.updateEntity).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when tournament not found', async () => {
      repository.updateEntity.mockResolvedValue([]);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully remove a tournament', async () => {
      repository.deleteEntity.mockResolvedValue([mockTournament]);

      const result = await service.remove(1);

      expect(result).toEqual(mockTournament);
      expect(repository.deleteEntity).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when tournament not found', async () => {
      repository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
