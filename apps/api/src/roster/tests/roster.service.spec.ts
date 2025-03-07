import { Test, TestingModule } from '@nestjs/testing';
import { RosterService } from '../roster.service';
import { RosterDrizzleRepository } from '../roster.repository';
import { StageDrizzleRepository } from '../../stage/stage.repository';
import { TournamentService } from '../../tournament/tournament.service';
import { CareerService } from '../../career/career.service';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateRosterDto } from '../dto/requests';
import {
  RosterResponsesEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import { ChallongeService } from 'src/challonge/challonge.service';

describe('RosterService', () => {
  let service: RosterService;
  let repository: jest.Mocked<RosterDrizzleRepository>;
  let stageRepository: jest.Mocked<StageDrizzleRepository>;
  let tournamentService: jest.Mocked<TournamentService>;
  let careerService: jest.Mocked<CareerService>;
  let challongeService: jest.Mocked<ChallongeService>;

  const mockRoster = {
    id: 1,
    participationId: 1,
    stageId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRosterWithPlayers = {
    ...mockRoster,
    participation: {
      id: 1,
      tournament: {
        id: 1,
        categoryId: 1,
      },
    },
    participationId: 1,
    players: [
      {
        id: 1,
        userId: 1,
        rosterId: 1,
        isSubstitute: false,
        user: {
          id: 1,
          username: 'testuser',
          isFake: false,
          career: [],
          country: 'US',
          profilePicture: 'test.jpg',
        },
        career: [],
      },
    ],
  };

  beforeEach(async () => {
    const mockRosterRepository = {
      createWithPlayers: jest.fn(),
      getQuery: jest.fn(),
      getWithPlayers: jest.fn(),
      getSingleQuery: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
      getForPlayer: jest.fn(),
      getForGroup: jest.fn(),
      getForTournament: jest.fn(),
      getForParticipation: jest.fn(),
      getForStage: jest.fn(),
      getOnlyPlayers: jest.fn(),
      updateWithPlayers: jest.fn(),
    };

    const mockStageRepository = {
      isAnyMemberInAnotherRoster: jest.fn(),
    };

    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const mockCareerService = {
      getMultipleCareers: jest.fn(),
    };

    const mockChallongeService = {
      createChallongeParticipantFromRoster: jest.fn(),
      deleteParticipant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RosterService,
        {
          provide: RosterDrizzleRepository,
          useValue: mockRosterRepository,
        },
        {
          provide: StageDrizzleRepository,
          useValue: mockStageRepository,
        },
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
        {
          provide: CareerService,
          useValue: mockCareerService,
        },
        {
          provide: ChallongeService,
          useValue: mockChallongeService,
        },
      ],
    }).compile();

    service = module.get<RosterService>(RosterService);
    repository = module.get(RosterDrizzleRepository);
    stageRepository = module.get(StageDrizzleRepository);
    tournamentService = module.get(TournamentService);
    careerService = module.get(CareerService);
    challongeService = module.get(ChallongeService);

    jest.mock('src/challonge/challonge.service');
    service.createChallongeParticipant = jest.fn();
    challongeService.deleteParticipant = jest.fn();
  });

  describe('create', () => {
    const createDto: CreateRosterDto = {
      members: [
        {
          userId: 1,
          isSubstitute: false,
        },
      ],
    };

    it('should successfully create a roster', async () => {
      repository.createWithPlayers.mockResolvedValue({
        rosterId: 1,
      });

      const result = await service.create(createDto, 1, 1);

      expect(result).toEqual({ id: 1 });
      expect(repository.createWithPlayers).toHaveBeenCalledWith(
        createDto,
        1,
        1,
      );
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      repository.createWithPlayers.mockResolvedValue(null);

      await expect(service.create(createDto, 1, 1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = {
      responseType: RosterResponsesEnum.BASE,
      page: 1,
      limit: 10,
    };

    it('should return an array of rosters with MINI response type', async () => {
      repository.getQuery.mockResolvedValue([mockRoster]);

      const result = await service.findAll({
        ...query,
        responseType: RosterResponsesEnum.MINI,
      });

      expect(result).toEqual([mockRoster]);
      expect(repository.getQuery).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        responseType: RosterResponsesEnum.MINI,
      });
    });

    it('should return an array of rosters with players for non-MINI response type', async () => {
      repository.getWithPlayers.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findAll(query);

      expect(result).toEqual([mockRosterWithPlayers]);
      expect(repository.getWithPlayers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findByPlayer', () => {
    const query = {
      page: 1,
      limit: 10,
    };

    it('should return rosters for a player', async () => {
      repository.getForPlayer.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findByPlayer(1, query);

      expect(result).toEqual([mockRosterWithPlayers]);
      expect(repository.getForPlayer).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByGroup', () => {
    const query = {
      page: 1,
      limit: 10,
    };

    it('should return rosters for a group', async () => {
      repository.getForGroup.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findByGroup(1, query);

      expect(result).toEqual([mockRosterWithPlayers]);
      expect(repository.getForGroup).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByTournament', () => {
    const query = {
      page: 1,
      limit: 10,
    };

    it('should return rosters for a tournament', async () => {
      repository.getForTournament.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findByTournament(1, query);

      expect(result).toEqual([mockRosterWithPlayers]);
      expect(repository.getForTournament).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByParticipation', () => {
    const query = {
      page: 1,
      limit: 10,
    };

    it('should return rosters for a participation', async () => {
      repository.getForParticipation.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findByParticipation(1, query);

      expect(result).toEqual([mockRosterWithPlayers]);
      expect(repository.getForParticipation).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByStage', () => {
    const query = {
      page: 1,
      limit: 10,
    };

    it('should return rosters for a stage', async () => {
      repository.getForStage.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findByStage(1, query);

      expect(result).toEqual([mockRosterWithPlayers]);
      expect(repository.getForStage).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findOne', () => {
    it('should return a single roster', async () => {
      repository.getSingleQuery.mockResolvedValue([mockRosterWithPlayers]);

      const result = await service.findOne(1, RosterResponsesEnum.BASE);

      expect(result).toEqual(mockRosterWithPlayers);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        1,
        RosterResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException when roster not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(
        service.findOne(1, RosterResponsesEnum.BASE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      members: [
        {
          userId: 2,
          isSubstitute: true,
        },
      ],
    };

    it('should successfully update a roster', async () => {
      repository.updateWithPlayers.mockResolvedValue();

      await service.update(1, updateDto);

      expect(repository.updateWithPlayers).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when roster not found', async () => {
      repository.updateWithPlayers.mockRejectedValue(new NotFoundException());

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('isAnyMemberInAnotherRoster', () => {
    it('should check if any member is in another roster', async () => {
      stageRepository.isAnyMemberInAnotherRoster.mockResolvedValue(false);

      const result = await service.isAnyMemberInAnotherRoster([1, 2], 1);

      expect(result).toBe(false);
      expect(stageRepository.isAnyMemberInAnotherRoster).toHaveBeenCalledWith(
        [1, 2],
        1,
        undefined,
      );
    });

    it('should check with excluded roster IDs', async () => {
      stageRepository.isAnyMemberInAnotherRoster.mockResolvedValue(true);

      const result = await service.isAnyMemberInAnotherRoster([1, 2], 1, [3]);

      expect(result).toBe(true);
      expect(stageRepository.isAnyMemberInAnotherRoster).toHaveBeenCalledWith(
        [1, 2],
        1,
        [3],
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete a roster', async () => {
      repository.deleteEntity.mockResolvedValue([mockRoster]);

      const result = await service.remove(1);

      expect(result).toEqual(mockRoster);
      expect(repository.deleteEntity).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when roster not found', async () => {
      repository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOnlyPlayers', () => {
    it('should return only players for a roster', async () => {
      const players = [
        {
          id: 1,
          userId: 1,
          rosterId: 1,
          isSubstitute: false,
          user: {
            id: 1,
            username: 'testuser',
            isFake: false,
            country: 'US',
            profilePicture: 'test.jpg',
          },
        },
      ];
      repository.getOnlyPlayers.mockResolvedValue(players);

      const result = await service.getOnlyPlayers(1);

      expect(result).toEqual(players);
      expect(repository.getOnlyPlayers).toHaveBeenCalledWith(1);
    });
  });

  describe('getChangeAmount', () => {
    it('should calculate the change amount when adding players', async () => {
      const players = [
        {
          id: 1,
          userId: 1,
          rosterId: 1,
          isSubstitute: false,
          user: {
            id: 1,
            username: 'testuser',
            isFake: false,
            country: 'US',
            profilePicture: 'test.jpg',
          },
        },
      ];
      repository.getOnlyPlayers.mockResolvedValue(players);

      // Adding one player (userId: 2)
      const result = await service.getChangeAmount(1, [1, 2]);

      // 1 added player + 0 removed players + abs(1 - 2) = 2
      expect(result).toBe(2);
    });

    it('should calculate the change amount when removing players', async () => {
      const players = [
        {
          id: 1,
          userId: 1,
          rosterId: 1,
          isSubstitute: false,
          user: {
            id: 1,
            username: 'testuser',
            isFake: false,
            country: 'US',
            profilePicture: 'test.jpg',
          },
        },
        {
          id: 2,
          userId: 2,
          rosterId: 1,
          isSubstitute: false,
          user: {
            id: 2,
            username: 'testuser2',
            isFake: false,
            country: 'US',
            profilePicture: 'test.jpg',
          },
        },
      ];
      repository.getOnlyPlayers.mockResolvedValue(players);

      // Removing one player (userId: 2)
      const result = await service.getChangeAmount(1, [1]);

      // 0 added players + 1 removed player + abs(2 - 1) = 2
      expect(result).toBe(2);
    });

    it('should calculate the change amount when replacing players', async () => {
      const players = [
        {
          id: 1,
          userId: 1,
          rosterId: 1,
          isSubstitute: false,
          user: {
            id: 1,
            username: 'testuser',
            isFake: false,
            country: 'US',
            profilePicture: 'test.jpg',
          },
        },
        {
          id: 2,
          userId: 2,
          rosterId: 1,
          isSubstitute: false,
          user: {
            id: 2,
            username: 'testuser2',
            isFake: false,
            country: 'US',
            profilePicture: 'test.jpg',
            categoryId: 1,
            createdAt: new Date(),
          },
        },
      ];
      repository.getOnlyPlayers.mockResolvedValue(players);

      // Replacing one player (userId: 2 with userId: 3)
      const result = await service.getChangeAmount(1, [1, 3]);

      // 1 added player + 1 removed player + abs(2 - 2) = 2
      expect(result).toBe(2);
    });
  });

  describe('isEachMemberTournamentEligible', () => {
    const mockStage = {
      id: 1,
      tournamentId: 1,
    };

    const mockTournament = {
      id: 1,
      minimumMMR: 1000,
      maximumMMR: 2000,
      isFakePlayersAllowed: false,
      categoryId: 1,
      category: {
        id: 1,
        name: 'Test Category',
        logo: 'test.jpg',
      },
      description: 'Test Tournament',
      isRanked: true,
      teamType: tournamentTeamTypeEnum.SOLO,
      creator: {
        id: 1,
        username: 'testuser',
        profilePicture: 'test.jpg',
        isFake: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isMultipleTeamsPerGroupAllowed: false,
      conversionRuleId: 1,
      isPublic: true,
      endDate: new Date(),
      maxParticipants: 100,
      currentParticipants: 0,
      isActive: true,
      isVisible: true,
      country: 'US',
      links: '',
      logo: 'test.jpg',
      name: 'Test Tournament',
      startDate: new Date(),
      type: tournamentTypeEnum.COMPETITION,
    };

    it('should return false if not all members have careers', async () => {
      tournamentService.findOne.mockResolvedValue(mockTournament);
      careerService.getMultipleCareers.mockResolvedValue([
        {
          userId: 1,
          elo: 1500,
          user: {
            id: 1,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
          categoryId: 1,
          createdAt: new Date(),
        },
      ]);

      const result = await service.isEachMemberTournamentEligible(
        [1, 2],
        mockStage as any,
      );

      expect(result).toBe(false);
    });

    it('should return false if any player has invalid ELO', async () => {
      tournamentService.findOne.mockResolvedValue(mockTournament);
      careerService.getMultipleCareers.mockResolvedValue([
        {
          userId: 1,
          categoryId: 1,
          createdAt: new Date(),
          elo: 900, // Below minimum
          user: {
            id: 1,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
        {
          userId: 2,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 2,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
      ]);

      const result = await service.isEachMemberTournamentEligible(
        [1, 2],
        mockStage as any,
      );

      expect(result).toBe(false);
    });

    it('should return false if fake players are not allowed', async () => {
      tournamentService.findOne.mockResolvedValue(mockTournament);
      careerService.getMultipleCareers.mockResolvedValue([
        {
          userId: 1,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 1,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
        {
          userId: 2,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 2,
            isFake: true,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
      ]);

      const result = await service.isEachMemberTournamentEligible(
        [1, 2],
        mockStage as any,
      );

      expect(result).toBe(false);
    });

    it('should return true if fake players are allowed', async () => {
      tournamentService.findOne.mockResolvedValue({
        ...mockTournament,
        isFakePlayersAllowed: true,
      });
      careerService.getMultipleCareers.mockResolvedValue([
        {
          userId: 1,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 1,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
        {
          userId: 2,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 2,
            isFake: true,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
      ]);

      const result = await service.isEachMemberTournamentEligible(
        [1, 2],
        mockStage as any,
      );

      expect(result).toBe(true);
    });

    it('should return undefined if all conditions are met and fake players not allowed', async () => {
      tournamentService.findOne.mockResolvedValue(mockTournament);
      careerService.getMultipleCareers.mockResolvedValue([
        {
          userId: 1,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 1,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
        {
          userId: 2,
          elo: 1500,
          categoryId: 1,
          createdAt: new Date(),
          user: {
            id: 2,
            isFake: false,
            profilePicture: 'test.jpg',
            username: 'testuser',
          },
        },
      ]);

      const result = await service.isEachMemberTournamentEligible(
        [1, 2],
        mockStage as any,
      );

      expect(result).toBeUndefined();
    });
  });
});
