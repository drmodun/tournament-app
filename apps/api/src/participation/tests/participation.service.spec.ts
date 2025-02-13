import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationService } from '../participation.service';
import { ParticipationDrizzleRepository } from '../participation.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ParticipationResponsesEnum } from '@tournament-app/types';
import { QueryParticipationDto } from '../dto/requests.dto';
import { TournamentParticipantArgument } from '../types';

describe('ParticipationService', () => {
  let service: ParticipationService;
  let repository: jest.Mocked<ParticipationDrizzleRepository>;

  const mockParticipation = {
    id: 1,
    tournamentId: 1,
    userId: 1,
    groupId: null,
    points: 0,
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
        ParticipationService,
        {
          provide: ParticipationDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ParticipationService>(ParticipationService);
    repository = module.get(ParticipationDrizzleRepository);
  });

  describe('create', () => {
    const tournamentId = 1;

    it('should create a solo participation', async () => {
      const participantArg: TournamentParticipantArgument = { userId: 1 };
      repository.createEntity.mockResolvedValue([mockParticipation]);

      const result = await service.create(tournamentId, participantArg);

      expect(result).toEqual(mockParticipation);
      expect(repository.createEntity).toHaveBeenCalledWith({
        tournamentId,
        userId: 1,
        groupId: undefined,
      });
    });

    it('should create a group participation', async () => {
      const participantArg: TournamentParticipantArgument = { groupId: 1 };
      const mockGroupParticipation = {
        ...mockParticipation,
        userId: null,
        groupId: 1,
      };
      repository.createEntity.mockResolvedValue([mockGroupParticipation]);

      const result = await service.create(tournamentId, participantArg);

      expect(result).toEqual(mockGroupParticipation);
      expect(repository.createEntity).toHaveBeenCalledWith({
        tournamentId,
        userId: undefined,
        groupId: 1,
      });
    });

    it('should throw BadRequestException when neither userId nor groupId is provided', async () => {
      const participantArg: TournamentParticipantArgument = {};

      await expect(
        service.create(tournamentId, participantArg),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when creation fails', async () => {
      const participantArg: TournamentParticipantArgument = { userId: 1 };
      repository.createEntity.mockResolvedValue([]);

      await expect(
        service.create(tournamentId, participantArg),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const query: QueryParticipationDto = {
      tournamentId: 1,
      page: 1,
      pageSize: 10,
    };

    it('should return all participations', async () => {
      repository.getQuery.mockResolvedValue([mockParticipation]);

      const result = await service.findAll(query);

      expect(result).toEqual([mockParticipation]);
      expect(repository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single participation', async () => {
      repository.getSingleQuery.mockResolvedValue([mockParticipation]);

      const result = await service.findOne(1, ParticipationResponsesEnum.BASE);

      expect(result).toEqual(mockParticipation);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        1,
        ParticipationResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException when participation not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(
        service.findOne(1, ParticipationResponsesEnum.BASE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneWithoutThrow', () => {
    it('should return a single participation', async () => {
      repository.getSingleQuery.mockResolvedValue([mockParticipation]);

      const result = await service.findOneWithoutThrow(
        1,
        ParticipationResponsesEnum.BASE,
      );

      expect(result).toEqual(mockParticipation);
    });

    it('should return null when participation not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      const result = await service.findOneWithoutThrow(
        1,
        ParticipationResponsesEnum.BASE,
      );

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto = { points: 100 };

    it('should update a participation', async () => {
      repository.getSingleQuery.mockResolvedValue([mockParticipation]);
      repository.updateEntity.mockResolvedValue([{ id: 1 }]);

      await service.update(1, updateDto);

      expect(repository.updateEntity).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when participation not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when update fails', async () => {
      repository.getSingleQuery.mockResolvedValue([mockParticipation]);
      repository.updateEntity.mockResolvedValue([]);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('entityExists', () => {
    it('should return true when entity exists', async () => {
      repository.getSingleQuery.mockResolvedValue([mockParticipation]);

      const result = await service.entityExists(1);

      expect(result).toBe(true);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        1,
        ParticipationResponsesEnum.MINI,
      );
    });

    it('should return false when entity does not exist', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      const result = await service.entityExists(1);

      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a participation', async () => {
      repository.getSingleQuery.mockResolvedValue([mockParticipation]);
      repository.deleteEntity.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.deleteEntity).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when participation not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('isParticipant', () => {
    const tournamentId = 1;

    it('should return true for existing solo participant', async () => {
      const participantArg: TournamentParticipantArgument = { userId: 1 };
      repository.getQuery.mockResolvedValue([mockParticipation]);

      const result = await service.isParticipant(tournamentId, participantArg);

      expect(result).toBe(true);
      expect(repository.getQuery).toHaveBeenCalledWith({
        query: { userId: 1, tournamentId, groupId: undefined },
      });
    });

    it('should return true for existing group participant', async () => {
      const participantArg: TournamentParticipantArgument = { groupId: 1 };
      repository.getQuery.mockResolvedValue([
        { ...mockParticipation, userId: null, groupId: 1 },
      ]);

      const result = await service.isParticipant(tournamentId, participantArg);

      expect(result).toBe(true);
      expect(repository.getQuery).toHaveBeenCalledWith({
        query: { userId: undefined, tournamentId, groupId: 1 },
      });
    });

    it('should return false when neither userId nor groupId provided', async () => {
      const participantArg: TournamentParticipantArgument = {};

      const result = await service.isParticipant(tournamentId, participantArg);

      expect(result).toBe(false);
      expect(repository.getQuery).not.toHaveBeenCalled();
    });

    it('should return false when participant not found', async () => {
      const participantArg: TournamentParticipantArgument = { userId: 1 };
      repository.getQuery.mockResolvedValue([]);

      const result = await service.isParticipant(tournamentId, participantArg);

      expect(result).toBe(false);
    });
  });
});
