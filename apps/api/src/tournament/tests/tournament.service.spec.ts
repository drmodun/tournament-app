import { Test, TestingModule } from '@nestjs/testing';
import { TournamentService } from '../tournament.service';
import { TournamentDrizzleRepository } from '../tournament.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTournamentRequest } from '../dto/requests.dto';
import { SubcategoryService } from 'src/subcategory/subcategory.service';
import { BadRequestException } from '@nestjs/common';
import {
  tournamentLocationEnum,
  TournamentResponsesEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';

describe('TournamentService', () => {
  let service: TournamentService;
  let repository: jest.Mocked<TournamentDrizzleRepository>;
  const subcategoryService = { checkBelongsToCategory: jest.fn() };

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
    subcategoryService.checkBelongsToCategory.mockReset();
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
        {
          provide: SubcategoryService,
          useValue: subcategoryService,
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
      tournamentTeamType: tournamentTeamTypeEnum.MIXED,
      tournamentType: tournamentTypeEnum.COMPETITION,
      isPublic: true,
      links: 'https://chess.com/tournament/123',
      maxParticipants: 8,
      country: 'USA',
      isRanked: true,
      affiliatedGroupId: 1,
      creatorId: 1,
      locationId: 1,
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

  describe('subcategories', () => {
    const current = {
      id: 1,
      name: 'Test Tournament',
      categoryId: 1,
      subcategoryId: 5,
    };

    it('checks the subcategory of a new tournament against its category', async () => {
      subcategoryService.checkBelongsToCategory.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(
        service.create({
          categoryId: 1,
          subcategoryId: 7,
        } as CreateTournamentRequest),
      ).rejects.toThrow(BadRequestException);
      expect(repository.createEntity).not.toHaveBeenCalled();
    });

    it('checks a new subcategory against the category being set', async () => {
      repository.getSingleQuery.mockResolvedValue([current] as never);
      repository.updateEntity.mockResolvedValue([{ id: 1 }]);

      await service.update(1, { categoryId: 2, subcategoryId: 9 });

      expect(subcategoryService.checkBelongsToCategory).toHaveBeenCalledWith(
        9,
        2,
      );
      expect(repository.updateEntity).toHaveBeenCalledWith(1, {
        categoryId: 2,
        subcategoryId: 9,
      });
    });

    it('checks a new subcategory against the current category', async () => {
      repository.getSingleQuery.mockResolvedValue([current] as never);
      repository.updateEntity.mockResolvedValue([{ id: 1 }]);

      await service.update(1, { subcategoryId: 9 });

      expect(subcategoryService.checkBelongsToCategory).toHaveBeenCalledWith(
        9,
        1,
      );
    });

    it('drops the subcategory when the tournament moves to another category', async () => {
      repository.getSingleQuery.mockResolvedValue([current] as never);
      repository.updateEntity.mockResolvedValue([{ id: 1 }]);

      await service.update(1, { categoryId: 2 });

      expect(repository.updateEntity).toHaveBeenCalledWith(1, {
        categoryId: 2,
        subcategoryId: null,
      });
    });

    it('clears the subcategory when sent null', async () => {
      repository.updateEntity.mockResolvedValue([{ id: 1 }]);

      await service.update(1, { subcategoryId: null });

      expect(repository.updateEntity).toHaveBeenCalledWith(1, {
        subcategoryId: null,
      });
      expect(subcategoryService.checkBelongsToCategory).not.toHaveBeenCalled();
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

  describe('getManagedTournaments', () => {
    const userId = 1;
    const pagination = { page: 1, pageSize: 10 };
    const mockManagedTournaments = [mockTournament];

    beforeEach(() => {
      repository.getManagedTournaments = jest.fn();
    });

    it('should return tournaments managed by the user', async () => {
      repository.getManagedTournaments.mockResolvedValue(
        mockManagedTournaments as any,
      );

      const result = await service.getManagedTournaments(userId, pagination);

      expect(result).toEqual(mockManagedTournaments);
      expect(repository.getManagedTournaments).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });

    it('should return empty array when no tournaments are managed by the user', async () => {
      repository.getManagedTournaments.mockResolvedValue([]);

      const result = await service.getManagedTournaments(userId, pagination);

      expect(result).toEqual([]);
      expect(repository.getManagedTournaments).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });

    it('should work without pagination parameter', async () => {
      repository.getManagedTournaments.mockResolvedValue(
        mockManagedTournaments as any,
      );

      const result = await service.getManagedTournaments(userId);

      expect(result).toEqual(mockManagedTournaments);
      expect(repository.getManagedTournaments).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });
  });
});
