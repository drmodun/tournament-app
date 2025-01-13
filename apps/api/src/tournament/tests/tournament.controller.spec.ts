import { Test, TestingModule } from '@nestjs/testing';
import { TournamentController } from '../tournament.controller';
import { TournamentService } from '../tournament.service';
import { ConditionalAdminGuard } from '../guards/conditional-admin.guard';
import { TournamentAdminGuard } from '../guards/tournament-admin.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import {
  CreateTournamentRequest,
  UpdateTournamentRequest,
} from '../dto/requests.dto';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import {
  ITournamentResponse,
  tournamentLocationEnum,
  TournamentResponsesEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';

describe('TournamentController', () => {
  let controller: TournamentController;
  let service: jest.Mocked<TournamentService>;

  const mockTournament: ITournamentResponse = {
    id: 1,
    name: 'Test Tournament',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    maxParticipants: 8,
    currentParticipants: 4,
    isPublic: true,
    category: {
      id: 1,
      name: 'Test Category',
      logo: 'https://chess.com/logo.png',
    },
    links: 'https://chess.com/tournament/123',
    teamType: tournamentTeamTypeEnum.MIXED,
    creator: {
      id: 1,
      username: 'testuser',
    },
    affiliatedGroup: {
      id: 1,
      abbreviation: 'TST',
      name: 'Test Group',
    },
    country: 'USA',
    type: tournamentTypeEnum.COMPETITION,
    location: tournamentLocationEnum.ONLINE,
    logo: 'https://chess.com/logo.png',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentController],
      providers: [
        {
          provide: TournamentService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ConditionalAdminGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TournamentAdminGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TournamentController>(TournamentController);
    service = module.get(TournamentService);
  });

  describe('findAll', () => {
    const query = {
      page: 1,
      limit: 10,
      responseType: TournamentResponsesEnum.BASE,
    };

    it('should return tournaments with metadata', async () => {
      service.findAll.mockResolvedValue([mockTournament]);

      const result = await controller.findAll(query, {
        url: 'test-url',
      } as any);

      expect(result).toEqual({
        results: [mockTournament],
        metadata: expect.any(Object),
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single tournament', async () => {
      service.findOne.mockResolvedValue(mockTournament);

      const result = await controller.findOne(1, TournamentResponsesEnum.BASE);

      expect(result).toEqual(mockTournament);
      expect(service.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.BASE,
      );
    });
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
    it('should create a tournament', async () => {
      service.create.mockResolvedValue(mockTournament);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTournament);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    const updateDto: UpdateTournamentRequest = {
      name: 'Updated Tournament',
    };

    it('should update a tournament', async () => {
      const updatedTournament = { ...mockTournament, ...updateDto };
      service.update.mockResolvedValue(updatedTournament);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedTournament);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a tournament', async () => {
      service.remove.mockResolvedValue(mockTournament);

      const result = await controller.remove(1);

      expect(result).toEqual(mockTournament);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  // Testing guard combinations
  describe('guard combinations', () => {
    let module: TestingModule;
    let conditionalGuard: jest.Mocked<ConditionalAdminGuard>;

    beforeEach(async () => {
      const mockService = {
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      };

      module = await Test.createTestingModule({
        controllers: [TournamentController],
        providers: [
          {
            provide: TournamentService,
            useValue: mockService,
          },
        ],
      })
        .overrideGuard(ConditionalAdminGuard)
        .useValue({ canActivate: jest.fn() })
        .overrideGuard(TournamentAdminGuard)
        .useValue({ canActivate: jest.fn() })
        .overrideGuard(AdminAuthGuard)
        .useValue({ canActivate: jest.fn() })
        .compile();

      controller = module.get<TournamentController>(TournamentController);
      conditionalGuard = module.get(ConditionalAdminGuard);
    });

    describe('create endpoint guards', () => {
      it('should require ConditionalAdminGuard', () => {
        conditionalGuard.canActivate.mockResolvedValueOnce(false);

        expect(
          Reflect.getMetadata(
            '__guards__',
            TournamentController.prototype.create,
          ),
        ).toBeDefined();
      });
    });

    describe('update endpoint guards', () => {
      it('should require both ConditionalAdminGuard and TournamentAdminGuard', () => {
        const guards = Reflect.getMetadata(
          '__guards__',
          TournamentController.prototype.update,
        );
        expect(guards).toBeDefined();
        expect(guards.length).toBe(2);
      });
    });

    describe('remove endpoint guards', () => {
      it('should require AdminAuthGuard and ConditionalAdminGuard', () => {
        const guards = Reflect.getMetadata(
          '__guards__',
          TournamentController.prototype.remove,
        );
        expect(guards).toBeDefined();
        expect(guards.length).toBe(2);
      });
    });
  });
});
