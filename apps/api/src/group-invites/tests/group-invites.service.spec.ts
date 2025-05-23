import { Test, TestingModule } from '@nestjs/testing';
import { GroupInvitesService } from '../group-invites.service';
import { GroupInviteDrizzleRepository } from '../group-invites.repository';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { GroupInviteResponsesEnum } from '^tournament-app/types';
import { BadRequestException } from '@nestjs/common';
import { GroupService } from '../../group/group.service';
import { SseNotificationsService } from '../../infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from '../../infrastructure/firebase-notifications/templates';

describe('GroupInvitesService', () => {
  let service: GroupInvitesService;
  let repository: GroupInviteDrizzleRepository;
  let sseNotificationsService: SseNotificationsService;
  let templatesFiller: NotificationTemplatesFiller;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
  };

  const mockGroupMembershipService = {
    entityExists: jest.fn(),
    create: jest.fn(),
  };

  const mockGroupService = {
    checkIfGroupIsReal: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSseNotificationsService = {
    createWithUsers: jest.fn(),
  };

  const mockTemplatesFiller = {
    fill: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupInvitesService,
        {
          provide: GroupInviteDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
        {
          provide: SseNotificationsService,
          useValue: mockSseNotificationsService,
        },
        {
          provide: NotificationTemplatesFiller,
          useValue: mockTemplatesFiller,
        },
      ],
    }).compile();

    service = module.get<GroupInvitesService>(GroupInvitesService);
    repository = module.get<GroupInviteDrizzleRepository>(
      GroupInviteDrizzleRepository,
    );
    sseNotificationsService = module.get<SseNotificationsService>(
      SseNotificationsService,
    );
    templatesFiller = module.get<NotificationTemplatesFiller>(
      NotificationTemplatesFiller,
    );

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group invite and send notification', async () => {
      const createDto = {
        message: 'test message',
      };
      const groupData = { name: 'Test Group', id: 1 };

      mockGroupService.checkIfGroupIsReal.mockResolvedValue(undefined);
      mockGroupMembershipService.entityExists.mockResolvedValue(false);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been invited to join the group Test Group',
      );

      await service.create(1, 1, createDto);

      expect(mockGroupService.checkIfGroupIsReal).toHaveBeenCalledWith(1);
      expect(repository.createEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
        message: createDto.message,
      });
      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is already a member', async () => {
      mockGroupService.checkIfGroupIsReal.mockResolvedValue(undefined);
      mockGroupMembershipService.entityExists.mockResolvedValue(true);

      await expect(service.create(1, 1, { message: 'test' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('sendNotificationToInvitedUser', () => {
    it('should send notification to invited user', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been invited to join the group Test Group',
      );

      await service.sendNotificationToInvitedUser(1, 1);

      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of group invites', async () => {
      const result = [{ id: 1, message: 'test' }];
      mockRepository.getQuery.mockResolvedValue(result);

      expect(await service.findAll({})).toBe(result);
      expect(repository.getQuery).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a group invite', async () => {
      const result = { id: 1, message: 'test' };
      mockRepository.getSingleQuery.mockResolvedValue([result]);

      expect(
        await service.findOne(1, 1, GroupInviteResponsesEnum.WITH_USER),
      ).toBe(result);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        {
          userId: 1,
          groupId: 1,
        },
        GroupInviteResponsesEnum.WITH_USER,
      );
    });
  });

  describe('update', () => {
    it('should update a group invite', async () => {
      const updateDto = {
        message: 'updated message',
      };

      await service.update(1, 1, updateDto);

      expect(repository.updateEntity).toHaveBeenCalledWith(
        {
          userId: 1,
          groupId: 1,
        },
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a group invite', async () => {
      await service.remove(1, 1);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
      });
    });
  });

  describe('accept', () => {
    it('should accept invite, create membership, remove invite and send notification', async () => {
      const mockInvite = { id: 1, message: 'test' };
      const groupData = { name: 'Test Group', id: 1 };

      mockRepository.getSingleQuery.mockResolvedValue([mockInvite]);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been approved',
      );

      await service.accept(1, 1);

      expect(mockGroupMembershipService.create).toHaveBeenCalledWith(1, 1);
      expect(repository.deleteEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
      });
      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should reject invite, remove invite and send notification', async () => {
      const mockInvite = { id: 1, message: 'test' };
      const groupData = { name: 'Test Group', id: 1 };

      mockRepository.getSingleQuery.mockResolvedValue([mockInvite]);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been rejected',
      );

      await service.reject(1, 1);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
      });
      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('sendNotificationAboutAcceptance', () => {
    it('should send notification about acceptance', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been approved',
      );

      await service.sendNotificationAboutAcceptance(1, 1);

      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('sendNotificationAboutRejection', () => {
    it('should send notification about rejection', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been rejected',
      );

      await service.sendNotificationAboutRejection(1, 1);

      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('checkIfUserIsAlreadyMember', () => {
    it('should throw BadRequestException if user is already a member', async () => {
      mockGroupMembershipService.entityExists.mockResolvedValue(true);

      await expect(service.checkIfUserIsAlreadyMember(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if user is not a member', async () => {
      mockGroupMembershipService.entityExists.mockResolvedValue(false);

      await expect(
        service.checkIfUserIsAlreadyMember(1, 1),
      ).resolves.not.toThrow();
    });
  });

  describe('checkIfInviteExists', () => {
    it('should throw BadRequestException if invite already exists', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([{ id: 1 }]);

      await expect(service.checkIfInviteExists(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if invite does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.checkIfInviteExists(1, 1)).resolves.not.toThrow();
    });
  });
});
