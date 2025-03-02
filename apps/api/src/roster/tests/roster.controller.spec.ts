import { Test, TestingModule } from '@nestjs/testing';
import { RosterController } from '../roster.controller';
import { RosterService } from '../roster.service';
import { CreateRosterDto, QueryRosterDto } from '../dto/requests';
import { RosterResponsesEnum } from '@tournament-app/types';
import { ParticipationService } from 'src/participation/participation.service';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { StageService } from 'src/stage/stage.service';
import { CareerService } from 'src/career/career.service';
import { CanRosterBeUsedGuard } from '../guards/roster-check.guard';
import { CanCreateRosterGuard } from '../guards/can-create-roster.guard';
import { ExecutionContext } from '@nestjs/common';

describe('RosterController', () => {
  let controller: RosterController;
  let service: jest.Mocked<RosterService>;
  let participationService: jest.Mocked<ParticipationService>;
  let rosterService: jest.Mocked<RosterService>;
  let stageService: jest.Mocked<StageService>;
  let groupMembershipService: jest.Mocked<GroupMembershipService>;
  let careerService: jest.Mocked<CareerService>;
  let guard: jest.Mocked<CanRosterBeUsedGuard>;
  let canCreateRosterGuard: jest.Mocked<CanCreateRosterGuard>;

  const createMockExecutionContext = (
    participationId?: number,
    stageId?: number,
    members?: any[],
    stage?: any,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { participationId, stageId },
          stage: stage || { id: stageId },
        }),
      }),
    }) as ExecutionContext;

  const mockRoster = {
    id: 1,
    participationId: 1,
    stageId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    participation: {
      id: 1,
      tournament: {
        id: 1,
      },
    },
  };

  const mockRosterWithPlayers = {
    ...mockRoster,
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
        },
      },
    ],
  };

  beforeEach(async () => {
    const mockRosterService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByPlayer: jest.fn(),
      findByGroup: jest.fn(),
      findByTournament: jest.fn(),
      findByParticipation: jest.fn(),
      findByStage: jest.fn(),
    };

    const mockParticipationService = {
      findOne: jest.fn(),
    };

    const mockStageService = {
      isFirstStage: jest.fn(),
    };

    const mockGroupMembershipService = {
      findAll: jest.fn(),
    };

    const mockCareerService = {
      getMultipleCareers: jest.fn(),
    };

    const mockGuard = {
      canActivate: jest.fn(),
    };

    const mockCanCreateRosterGuard = {
      canActivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RosterController],
      providers: [
        {
          provide: RosterService,
          useValue: mockRosterService,
        },
        {
          provide: ParticipationService,
          useValue: mockParticipationService,
        },
        {
          provide: StageService,
          useValue: mockStageService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
        {
          provide: CareerService,
          useValue: mockCareerService,
        },
        {
          provide: CanRosterBeUsedGuard,
          useValue: mockGuard,
        },
        {
          provide: CanCreateRosterGuard,
          useValue: mockCanCreateRosterGuard,
        },
      ],
    }).compile();

    controller = module.get<RosterController>(RosterController);
    service = module.get(RosterService);
  });

  describe('findAll', () => {
    it('should return rosters with metadata', async () => {
      const query: QueryRosterDto = {
        page: 1,
        pageSize: 10,
      };
      service.findAll.mockResolvedValue([mockRosterWithPlayers]);

      const req = {
        url: '/roster',
      };

      const result = await controller.findAll(query, req as any);

      expect(result).toEqual({
        results: [mockRosterWithPlayers],
        metadata: expect.any(Object),
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single roster', async () => {
      service.findOne.mockResolvedValue(mockRosterWithPlayers);

      const result = await controller.findOne(1, RosterResponsesEnum.BASE);

      expect(result).toEqual(mockRosterWithPlayers);
      expect(service.findOne).toHaveBeenCalledWith(1, RosterResponsesEnum.BASE);
    });
  });

  describe('update', () => {
    it('should update a roster', async () => {
      const updateDto: CreateRosterDto = {
        members: [
          {
            userId: 2,
            isSubstitute: true,
          },
        ],
      };

      await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('findByStage', () => {
    it('should return rosters for a stage with metadata', async () => {
      const query: QueryRosterDto = {
        page: 1,
        pageSize: 10,
      };
      service.findByStage.mockResolvedValue([mockRosterWithPlayers]);

      const req = {
        url: '/roster/stage/1',
      };

      const result = await controller.findByStage(1, query, req as any);

      expect(result).toEqual({
        results: [mockRosterWithPlayers],
        metadata: expect.any(Object),
      });
      expect(service.findByStage).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByParticipation', () => {
    it('should return rosters for a participation with metadata', async () => {
      const query: QueryRosterDto = {
        page: 1,
        pageSize: 10,
      };
      service.findByParticipation.mockResolvedValue([mockRosterWithPlayers]);

      const req = {
        url: '/roster/participation/1',
      };

      const result = await controller.findByParticipation(1, query, req as any);

      expect(result).toEqual({
        results: [mockRosterWithPlayers],
        metadata: expect.any(Object),
      });
      expect(service.findByParticipation).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByUser', () => {
    it('should return rosters for a user with metadata', async () => {
      const query: QueryRosterDto = {
        page: 1,
        pageSize: 10,
      };
      service.findByPlayer.mockResolvedValue([mockRosterWithPlayers]);

      const req = {
        url: '/roster/user/1',
      };

      const result = await controller.findByUser(1, query, req as any);

      expect(result).toEqual({
        results: [mockRosterWithPlayers],
        metadata: expect.any(Object),
      });
      expect(service.findByPlayer).toHaveBeenCalledWith(1, query);
    });
  });

  describe('findByGroup', () => {
    it('should return rosters for a group with metadata', async () => {
      const query: QueryRosterDto = {
        page: 1,
        pageSize: 10,
      };
      service.findByGroup.mockResolvedValue([mockRosterWithPlayers]);

      const req = {
        url: '/roster/group/1',
      };

      const result = await controller.findByGroup(1, query, req as any);

      expect(result).toEqual({
        results: [mockRosterWithPlayers],
        metadata: expect.any(Object),
      });
      expect(service.findByGroup).toHaveBeenCalledWith(1, query);
    });
  });

  describe('create', () => {
    it('should create a roster', async () => {
      const createDto: CreateRosterDto = {
        members: [
          {
            userId: 1,
            isSubstitute: false,
          },
        ],
      };
      service.create.mockResolvedValue(mockRosterWithPlayers);

      const result = await controller.create(createDto, 1, 1);

      expect(result).toEqual(mockRosterWithPlayers);
      expect(service.create).toHaveBeenCalledWith(createDto, 1, 1);
    });
  });
});
