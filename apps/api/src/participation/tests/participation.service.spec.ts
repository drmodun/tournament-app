import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationService } from '../participation.service';
import { ParticipationDrizzleRepository } from '../participation.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ParticipationResponsesEnum } from '@tournament-app/types';
import { QueryParticipationDto } from '../dto/requests.dto';
import { TournamentParticipantArgument } from '../types';
import { RosterService } from '../../roster/roster.service';
describe('ParticipationService', () => {
  let service: ParticipationService;
  let repository: jest.Mocked<ParticipationDrizzleRepository>;
  let mockRosterService: jest.Mocked<RosterService>;

  mockRosterService = {
    getRostersByStage: jest.fn(),
    createForSinglePlayer: jest.fn(),
  } as unknown as jest.Mocked<RosterService>;

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
      getManagedParticipationsForPlayer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationService,
        {
          provide: ParticipationDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: RosterService,
          useValue: mockRosterService,
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
    it('should return participation if found', async () => {
      const mockParticipationId = 1;
      const mockParticipation = {
        id: mockParticipationId,
        tournamentId: 1,
        userId: 1,
        groupId: null,
      };

      jest
        .spyOn(repository, 'getSingleQuery')
        .mockResolvedValue([mockParticipation]);

      const result = await service.findOneWithoutThrow(
        mockParticipationId,
        ParticipationResponsesEnum.BASE,
      );

      expect(result).toEqual(mockParticipation);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        mockParticipationId,
        ParticipationResponsesEnum.BASE,
      );
    });

    it('should return null if participation not found', async () => {
      const mockParticipationId = 1;

      jest.spyOn(repository, 'getSingleQuery').mockResolvedValue([]);

      const result = await service.findOneWithoutThrow(mockParticipationId);

      expect(result).toBeNull();
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        mockParticipationId,
        ParticipationResponsesEnum.BASE,
      );
    });

    it('should use BASE response type by default', async () => {
      const mockParticipationId = 1;

      jest.spyOn(repository, 'getSingleQuery').mockResolvedValue([]);

      await service.findOneWithoutThrow(mockParticipationId);

      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        mockParticipationId,
        ParticipationResponsesEnum.BASE,
      );
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
    it('should return true if participation exists', async () => {
      const mockParticipationId = 1;
      const mockParticipation = {
        id: mockParticipationId,
        tournamentId: 1,
        userId: 1,
        groupId: null,
      };

      jest
        .spyOn(repository, 'getSingleQuery')
        .mockResolvedValue([mockParticipation]);

      const result = await service.entityExists(mockParticipationId);

      expect(result).toBe(true);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        mockParticipationId,
        ParticipationResponsesEnum.MINI,
      );
    });

    it('should return false if participation does not exist', async () => {
      const mockParticipationId = 1;

      jest.spyOn(repository, 'getSingleQuery').mockResolvedValue([]);

      const result = await service.entityExists(mockParticipationId);

      expect(result).toBe(false);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        mockParticipationId,
        ParticipationResponsesEnum.MINI,
      );
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
    it('should return true if user is a participant', async () => {
      const mockTournamentId = 1;
      const mockUserId = 2;
      const mockParticipation = {
        id: 3,
        tournamentId: mockTournamentId,
        userId: mockUserId,
        groupId: null,
      };

      jest.spyOn(repository, 'getQuery').mockResolvedValue([mockParticipation]);

      const result = await service.isParticipant(mockTournamentId, {
        userId: mockUserId,
      });

      expect(result).toBe(true);
      expect(repository.getQuery).toHaveBeenCalledWith({
        userId: mockUserId,
        tournamentId: mockTournamentId,
        groupId: undefined,
      });
    });

    it('should return true if group is a participant', async () => {
      const mockTournamentId = 1;
      const mockGroupId = 2;
      const mockParticipation = {
        id: 3,
        tournamentId: mockTournamentId,
        userId: null,
        groupId: mockGroupId,
      };

      jest.spyOn(repository, 'getQuery').mockResolvedValue([mockParticipation]);

      const result = await service.isParticipant(mockTournamentId, {
        groupId: mockGroupId,
      });

      expect(result).toBe(true);
      expect(repository.getQuery).toHaveBeenCalledWith({
        userId: undefined,
        tournamentId: mockTournamentId,
        groupId: mockGroupId,
      });
    });

    it('should return false if neither user nor group is provided', async () => {
      const mockTournamentId = 1;

      const result = await service.isParticipant(mockTournamentId, {});

      expect(result).toBe(false);
      expect(repository.getQuery).not.toHaveBeenCalled();
    });

    it('should return false if no participations found', async () => {
      const mockTournamentId = 1;
      const mockUserId = 2;

      jest.spyOn(repository, 'getQuery').mockResolvedValue([]);

      const result = await service.isParticipant(mockTournamentId, {
        userId: mockUserId,
      });

      expect(result).toBe(false);
      expect(repository.getQuery).toHaveBeenCalledWith({
        userId: mockUserId,
        tournamentId: mockTournamentId,
        groupId: undefined,
      });
    });
  });

  describe('getManagedParticipationsForPlayer', () => {
    it('should call repository.getManagedParticipationsForPlayer with correct parameters', async () => {
      const mockTournamentId = 1;
      const mockPlayerId = 2;
      const mockManagedParticipations = [
        {
          id: 3,
          tournamentId: mockTournamentId,
          group: {
            id: 5,
            name: 'Test Group',
          },
          userId: null,
          groupId: 5,
        },
      ];

      jest
        .spyOn(repository, 'getManagedParticipationsForPlayer')
        .mockResolvedValue(mockManagedParticipations);

      const result = await service.getManagedParticipationsForPlayer(
        mockTournamentId,
        mockPlayerId,
      );

      expect(result).toEqual(mockManagedParticipations);
      expect(repository.getManagedParticipationsForPlayer).toHaveBeenCalledWith(
        mockTournamentId,
        mockPlayerId,
      );
    });
  });
});
