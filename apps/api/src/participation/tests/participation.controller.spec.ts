import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationController } from '../participation.controller';
import { ParticipationService } from '../participation.service';
import {
  ParticipationResponsesEnum,
  userRoleEnum,
} from '@tournament-app/types';
import { QueryParticipationDto } from '../dto/requests.dto';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { TournamentService } from 'src/tournament/tournament.service';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { GroupModule } from 'src/group/group.module';

describe('ParticipationController', () => {
  let controller: ParticipationController;
  let service: jest.Mocked<ParticipationService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tournamentService: jest.Mocked<TournamentService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let groupMembershipService: jest.Mocked<GroupMembershipService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: jest.Mocked<UsersService>;

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
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const mockGroupMembershipService = {
      findOne: jest.fn(),
    };

    const mockUserService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipationController],
      providers: [
        {
          provide: ParticipationService,
          useValue: mockService,
        },
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
      imports: [UsersModule, GroupModule],
    }).compile();

    controller = module.get<ParticipationController>(ParticipationController);
    service = module.get(ParticipationService);
    tournamentService = module.get(TournamentService);
    groupMembershipService = module.get(GroupMembershipService);
    userService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const query: QueryParticipationDto = {
      tournamentId: 1,
      page: 1,
      pageSize: 10,
    };

    it('should return participations with metadata', async () => {
      service.findAll.mockResolvedValue([mockParticipation]);
      jest.spyOn(MetadataMaker, 'makeMetadataFromQuery').mockReturnValue({
        pagination: { page: 1, pageSize: 10 },
        links: undefined,
        query: query,
      });

      const result = await controller.findAll(query, {
        url: '/participations',
      } as any);

      expect(result).toEqual({
        results: [mockParticipation],
        metadata: {
          pagination: { page: 1, pageSize: 10 },
          links: undefined,
          query: query,
        },
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single participation', async () => {
      service.findOne.mockResolvedValue(mockParticipation);

      const result = await controller.findOne(
        1,
        ParticipationResponsesEnum.BASE,
      );

      expect(result).toEqual(mockParticipation);
      expect(service.findOne).toHaveBeenCalledWith(
        1,
        ParticipationResponsesEnum.BASE,
      );
    });
  });

  describe('createSolo', () => {
    const mockUser: ValidatedUserDto = {
      id: 1,
      role: userRoleEnum.USER,
      email: 'test@example.com',
    };

    it('should create a solo participation', async () => {
      service.create.mockResolvedValue(mockParticipation);

      const result = await controller.createSolo(1, mockUser);

      expect(result).toEqual(mockParticipation);
      expect(service.create).toHaveBeenCalledWith(1, { userId: mockUser.id });
    });
  });

  describe('createTeam', () => {
    it('should create a team participation', async () => {
      const mockTeamParticipation = {
        ...mockParticipation,
        userId: null,
        groupId: 1,
      };
      service.create.mockResolvedValue(mockTeamParticipation);

      const result = await controller.createTeam(1, 1);

      expect(result).toEqual(mockTeamParticipation);
      expect(service.create).toHaveBeenCalledWith(1, { groupId: 1 });
    });
  });

  describe('createForFakePlayer', () => {
    it('should create a participation for a fake player', async () => {
      service.create.mockResolvedValue(mockParticipation);

      const result = await controller.createForFakePlayer(1, 1);

      expect(result).toEqual(mockParticipation);
      expect(service.create).toHaveBeenCalledWith(1, { userId: 1 });
    });
  });

  describe('createForFakeTeam', () => {
    it('should create a participation for a fake team', async () => {
      const mockTeamParticipation = {
        ...mockParticipation,
        userId: null,
        groupId: 1,
      };
      service.create.mockResolvedValue(mockTeamParticipation);

      const result = await controller.createForFakeTeam(1, 1);

      expect(result).toEqual(mockTeamParticipation);
      expect(service.create).toHaveBeenCalledWith(1, { groupId: 1 });
    });
  });

  describe('remove', () => {
    it('should remove a participation', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toEqual({ message: 'Participation removed successfully' });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
