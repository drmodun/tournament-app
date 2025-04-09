import { Test, TestingModule } from '@nestjs/testing';
import { StageService } from '../stage.service';
import { StageDrizzleRepository } from '../stage.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { CreateStageRequest } from '../dto/requests.dto';
import {
  StageResponsesEnum,
  StageSortingEnum,
  stageTypeEnum,
  IChallongeTournament,
  stageStatusEnum,
  notificationTypeEnum,
} from '@tournament-app/types';
import { StagesWithDates } from '../types';
import { ChallongeService } from 'src/challonge/challonge.service';
import { RosterDrizzleRepository } from '../../roster/roster.repository';
import { SseNotificationsService } from '../../infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from '../../infrastructure/firebase-notifications/templates';
import { TemplatesEnum } from 'src/infrastructure/types';
import { MatchesService } from 'src/matches/matches.service';
import { RosterService } from 'src/roster/roster.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Mock rxjs fromEvent to prevent 'Invalid event target' errors
jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs');
  return {
    ...original,
    fromEvent: jest.fn().mockImplementation(() =>
      original.of({
        data: { message: 'test notification' },
        type: 'notification',
      }),
    ),
  };
});

describe('StageService', () => {
  let service: StageService;
  let repository: jest.Mocked<StageDrizzleRepository>;
  let mockRosterRepository: jest.Mocked<RosterDrizzleRepository>;
  let mockSseNotificationsService: jest.Mocked<SseNotificationsService>;
  let mockNotificationTemplateFiller: jest.Mocked<NotificationTemplatesFiller>;
  let mockMatchService: jest.Mocked<MatchesService>;
  let mockRosterService: jest.Mocked<RosterService>;
  let mockChallongeServiceImpl: jest.Mocked<ChallongeService>;

  const mockStage = {
    id: 1,
    name: 'Test Stage',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    stageType: stageTypeEnum.KNOCKOUT,
    createdAt: new Date(),
    updatedAt: new Date(),
    tournamentId: 1,
  };

  beforeEach(async () => {
    const mockRepository = {
      createEntity: jest.fn(),
      getQuery: jest.fn(),
      getSingleQuery: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
      getAllTournamentStagesSortedByStartDate: jest.fn(),
    };

    mockChallongeServiceImpl = {
      createChallongeTournament: jest.fn(),
      createChallongeTournamentFromStage: jest.fn(),
      updateTournament: jest.fn(),
      deleteTournament: jest.fn(),
      getTournamentMatches: jest.fn(),
      createBulkParticipants: jest.fn(),
      updateTournamentState: jest.fn(),
    } as unknown as jest.Mocked<ChallongeService>;

    mockMatchService = {
      createMatchScore: jest.fn(),
      canUserEditMatchup: jest.fn(),
      checkRoundCompletionAndUpdateNextRound: jest.fn(),
      getMatchupsWithResults: jest.fn(),
      importChallongeMatchesToStage: jest.fn(),
    } as unknown as jest.Mocked<MatchesService>;

    mockRosterRepository = {
      getRostersForChallongeParticipants: jest.fn(),
      getUsersInStageRosters: jest.fn(),
      attachChallongeParticipantIdToRosters: jest.fn(),
    } as unknown as jest.Mocked<RosterDrizzleRepository>;

    mockRosterService = {
      createForSinglePlayer: jest.fn(),
      createForSinglePlayerForNewStage: jest.fn(),
    } as unknown as jest.Mocked<RosterService>;

    mockSseNotificationsService = {
      createWithUsers: jest.fn(),
    } as unknown as jest.Mocked<SseNotificationsService>;

    mockNotificationTemplateFiller = {
      fill: jest.fn(),
    } as unknown as jest.Mocked<NotificationTemplatesFiller>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        StageService,
        {
          provide: StageDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: ChallongeService,
          useValue: mockChallongeServiceImpl,
        },
        {
          provide: RosterDrizzleRepository,
          useValue: mockRosterRepository,
        },
        {
          provide: SseNotificationsService,
          useValue: mockSseNotificationsService,
        },
        {
          provide: NotificationTemplatesFiller,
          useValue: mockNotificationTemplateFiller,
        },
        {
          provide: MatchesService,
          useValue: mockMatchService,
        },
        {
          provide: RosterService,
          useValue: mockRosterService,
        },
      ],
    }).compile();

    service = module.get<StageService>(StageService);
    repository = module.get(StageDrizzleRepository);

    service.createChallongeTournament = jest.fn();
    service.updateChallongeTournament = jest.fn();
    service.deleteChallongeTournament = jest.fn();

    jest.spyOn(service, 'createChallongeTournament').mockResolvedValue({
      id: '1',
    } as IChallongeTournament);

    jest.spyOn(service, 'updateChallongeTournament').mockResolvedValue();

    jest.spyOn(service, 'deleteChallongeTournament').mockResolvedValue();
  });

  describe('create', () => {
    const createDto: CreateStageRequest = {
      name: 'Test Stage',
      description: 'Test Description',
      startDate: new Date(),
      endDate: new Date(),
      stageType: stageTypeEnum.KNOCKOUT,
      tournamentId: 1,
    };

    it('should successfully create a stage', async () => {
      repository.createEntity.mockResolvedValue([mockStage]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockStage);
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
      responseType: StageResponsesEnum.BASE,
      page: 1,
      limit: 10,
    };

    it('should return an array of stages', async () => {
      repository.getQuery.mockResolvedValue([mockStage]);

      const result = await service.findAll(query);

      expect(result).toEqual([mockStage]);
      expect(repository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single stage', async () => {
      repository.getSingleQuery.mockResolvedValue([mockStage]);

      const result = await service.findOne(1, StageResponsesEnum.BASE);

      expect(result).toEqual(mockStage);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        1,
        StageResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException when stage not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(1, StageResponsesEnum.BASE)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Stage',
      description: 'Updated Description',
    };

    it('should successfully update a stage', async () => {
      const updatedStage = { ...mockStage, ...updateDto };
      repository.updateEntity.mockResolvedValue([updatedStage]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedStage);
      expect(repository.updateEntity).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when stage not found', async () => {
      repository.updateEntity.mockResolvedValue([]);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete a stage', async () => {
      repository.deleteEntity.mockResolvedValue([mockStage]);

      const result = await service.remove(1);

      expect(result).toEqual(mockStage);
      expect(repository.deleteEntity).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when stage not found', async () => {
      repository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFirstStage', () => {
    const tournamentId = 1;
    const expectedQuery = {
      responseType: StageResponsesEnum.MINI,
      field: StageSortingEnum.START_DATE,
      order: 'asc',
      tournamentId,
    };

    it('should return the first stage of a tournament', async () => {
      repository.getQuery.mockResolvedValue([mockStage]);

      const result = await service.getFirstStage(tournamentId);

      expect(result).toEqual(mockStage);
      expect(repository.getQuery).toHaveBeenCalledWith(expectedQuery);
    });

    it('should return undefined if no stages exist', async () => {
      repository.getQuery.mockResolvedValue([]);

      const result = await service.getFirstStage(tournamentId);

      expect(result).toBeUndefined();
      expect(repository.getQuery).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('isFirstStage', () => {
    const tournamentId = 1;
    const stageId = 1;

    it('should return true if the stage is the first stage', async () => {
      const firstStage = { ...mockStage, id: stageId };
      repository.getQuery.mockResolvedValue([firstStage]);

      const result = await service.isFirstStage(stageId, tournamentId);

      expect(result).toBe(true);
    });

    it('should return false if the stage is not the first stage', async () => {
      const firstStage = { ...mockStage, id: 2 }; // Different ID
      repository.getQuery.mockResolvedValue([firstStage]);

      const result = await service.isFirstStage(stageId, tournamentId);

      expect(result).toBe(false);
    });
  });

  describe('getStagesSortedByStartDate', () => {
    const tournamentId = 1;
    const mockStagesWithDates: StagesWithDates[] = [
      {
        id: 1,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-10'),
      },
      {
        id: 2,
        startDate: new Date('2023-01-11'),
        endDate: new Date('2023-01-20'),
      },
      {
        id: 3,
        startDate: new Date('2023-01-21'),
        endDate: undefined,
      },
    ];

    it('should return stages sorted by start date', async () => {
      repository.getAllTournamentStagesSortedByStartDate.mockResolvedValue(
        mockStagesWithDates,
      );

      const result = await service.getStagesSortedByStartDate(tournamentId);

      expect(result).toEqual(mockStagesWithDates);
      expect(
        repository.getAllTournamentStagesSortedByStartDate,
      ).toHaveBeenCalledWith(tournamentId);
    });

    it('should return an empty array if no stages exist', async () => {
      repository.getAllTournamentStagesSortedByStartDate.mockResolvedValue([]);

      const result = await service.getStagesSortedByStartDate(tournamentId);

      expect(result).toEqual([]);
      expect(
        repository.getAllTournamentStagesSortedByStartDate,
      ).toHaveBeenCalledWith(tournamentId);
    });
  });

  describe('getManagedStages', () => {
    const userId = 1;
    const pagination = { page: 1, pageSize: 10 };
    const mockManagedStages = [mockStage];

    beforeEach(() => {
      repository.getManagedStages = jest.fn();
    });

    it('should return stages managed by the user', async () => {
      repository.getManagedStages.mockResolvedValue(mockManagedStages);

      const result = await service.getManagedStages(userId, pagination);

      expect(result).toEqual(mockManagedStages);
      expect(repository.getManagedStages).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });

    it('should return empty array when no stages are managed by the user', async () => {
      repository.getManagedStages.mockResolvedValue([]);

      const result = await service.getManagedStages(userId, pagination);

      expect(result).toEqual([]);
      expect(repository.getManagedStages).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });

    it('should work without pagination parameter', async () => {
      repository.getManagedStages.mockResolvedValue(mockManagedStages);

      const result = await service.getManagedStages(userId);

      expect(result).toEqual(mockManagedStages);
      expect(repository.getManagedStages).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });
  });

  describe('startStage', () => {
    const stageId = 1;
    const mockRosters = [
      {
        id: 1,
        participationId: 1,
        name: 'Team Alpha',
      },
      {
        id: 2,
        participationId: 1,
        name: 'Team Beta',
      },
    ];

    const mockStageWithChallonge = {
      ...mockStage,
      challongeTournamentId: 'challonge-123',
      stageStatus: stageStatusEnum.UPCOMING,
    };

    const mockChallongeParticipants = [
      { id: 'challonge-p1', attributes: { misc: '1' } },
      { id: 'challonge-p2', attributes: { misc: '2' } },
    ];

    beforeEach(() => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStageWithChallonge);
      jest.spyOn(service, 'update').mockResolvedValue({
        ...mockStageWithChallonge,
        stageStatus: stageStatusEnum.ONGOING,
      });

      mockRosterRepository.getRostersForChallongeParticipants = jest
        .fn()
        .mockResolvedValue(mockRosters);
      mockRosterRepository.attachChallongeParticipantIdToRosters = jest
        .fn()
        .mockResolvedValue(undefined);

      // Set up ChallongeService mock methods
      mockChallongeServiceImpl.createBulkParticipants = jest
        .fn()
        .mockResolvedValue(mockChallongeParticipants);
      mockChallongeServiceImpl.updateTournamentState = jest
        .fn()
        .mockResolvedValue({});
      mockChallongeServiceImpl.getTournamentMatches = jest
        .fn()
        .mockResolvedValue([]);

      // Use the mock directly instead of creating a new one
      Object.defineProperty(service, 'challongeService', {
        value: mockChallongeServiceImpl,
      });

      // Mock the sendStageStartNotifications method
      service.sendStageStartNotifications = jest
        .fn()
        .mockResolvedValue(undefined);
    });

    it('should successfully start a stage', async () => {
      const result = await service.startStage(stageId);

      expect(service.findOne).toHaveBeenCalledWith(
        stageId,
        StageResponsesEnum.WITH_CHALLONGE_TOURNAMENT,
      );

      expect(
        mockRosterRepository.getRostersForChallongeParticipants,
      ).toHaveBeenCalledWith(stageId);

      expect(
        mockChallongeServiceImpl.createBulkParticipants,
      ).toHaveBeenCalled();

      // Verify the transaction-based update is called with correct parameters
      expect(
        mockRosterRepository.attachChallongeParticipantIdToRosters,
      ).toHaveBeenCalledWith([
        {
          rosterId: 1,
          challongeParticipantId: 'challonge-p1',
        },
        {
          rosterId: 2,
          challongeParticipantId: 'challonge-p2',
        },
      ]);

      expect(service.update).toHaveBeenCalledWith(stageId, {
        stageStatus: stageStatusEnum.ONGOING,
      });

      expect(
        mockChallongeServiceImpl.updateTournamentState,
      ).toHaveBeenCalledWith(
        mockStageWithChallonge.challongeTournamentId,
        stageStatusEnum.ONGOING,
      );

      expect(service.sendStageStartNotifications).toHaveBeenCalledWith(
        stageId,
        mockStageWithChallonge.name,
      );

      expect(result.stageStatus).toEqual(stageStatusEnum.ONGOING);
    });

    it('should throw BadRequestException if stage is already ongoing', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({
        ...mockStageWithChallonge,
        stageStatus: stageStatusEnum.ONGOING,
      });

      await expect(service.startStage(stageId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no challonge tournament ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({
        ...mockStageWithChallonge,
        challongeTournamentId: null,
      });

      await expect(service.startStage(stageId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no rosters found', async () => {
      mockRosterRepository.getRostersForChallongeParticipants.mockResolvedValueOnce(
        [],
      );

      await expect(service.startStage(stageId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle transaction failure gracefully', async () => {
      // Mock the transaction to fail
      mockRosterRepository.attachChallongeParticipantIdToRosters.mockRejectedValueOnce(
        new Error('Transaction failed'),
      );

      await expect(service.startStage(stageId)).rejects.toThrow(Error);

      // Verify service dependencies were called correctly before the error
      expect(
        mockRosterRepository.getRostersForChallongeParticipants,
      ).toHaveBeenCalledWith(stageId);
      expect(
        mockChallongeServiceImpl.createBulkParticipants,
      ).toHaveBeenCalled();

      // Verify that the stage update was not called due to the transaction error
      expect(service.update).not.toHaveBeenCalled();
      expect(
        mockChallongeServiceImpl.updateTournamentState,
      ).not.toHaveBeenCalled();
    });
  });

  describe('sendStageStartNotifications', () => {
    it('should send notifications to all users in stage rosters', async () => {
      // Arrange
      const stageId = 123;
      const stageName = 'Test Tournament Stage';

      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
        { id: 3, username: 'user3' },
      ];

      const mockMessage =
        'Heads up, your tournament Test Tournament Stage has started';

      mockRosterRepository.getUsersInStageRosters.mockResolvedValue(mockUsers);
      mockNotificationTemplateFiller.fill.mockReturnValue(mockMessage);
      mockSseNotificationsService.createWithUsers.mockResolvedValue(undefined);

      // Act
      await service.sendStageStartNotifications(stageId, stageName);

      // Assert
      expect(mockRosterRepository.getUsersInStageRosters).toHaveBeenCalledWith(
        stageId,
      );

      expect(mockNotificationTemplateFiller.fill).toHaveBeenCalledWith(
        TemplatesEnum.TOURNAMENT_START,
        { tournament: stageName },
      );

      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalledWith(
        {
          type: notificationTypeEnum.TOURNAMENT_START,
          message: mockMessage,
          link: `/stage/${stageId}`,
          image: null,
        },
        [1, 2, 3],
      );
    });

    it('should not send notifications when no users are found', async () => {
      // Arrange
      const stageId = 123;
      const stageName = 'Test Tournament Stage';

      mockRosterRepository.getUsersInStageRosters.mockResolvedValue([]);

      // Act
      await service.sendStageStartNotifications(stageId, stageName);

      // Assert
      expect(mockRosterRepository.getUsersInStageRosters).toHaveBeenCalledWith(
        stageId,
      );
      expect(mockNotificationTemplateFiller.fill).not.toHaveBeenCalled();
      expect(
        mockSseNotificationsService.createWithUsers,
      ).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const stageId = 123;
      const stageName = 'Test Tournament Stage';

      mockRosterRepository.getUsersInStageRosters.mockRejectedValue(
        new Error('Database error'),
      );

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await service.sendStageStartNotifications(stageId, stageName);

      // Assert
      expect(mockRosterRepository.getUsersInStageRosters).toHaveBeenCalledWith(
        stageId,
      );
      expect(console.error).toHaveBeenCalled();
      expect(
        mockSseNotificationsService.createWithUsers,
      ).not.toHaveBeenCalled();
    });
  });
});
