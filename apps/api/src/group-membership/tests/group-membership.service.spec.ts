import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipService } from '../group-membership.service';
import { GroupMembershipDrizzleRepository } from '../group-membership.repository';
import {
  GroupMembershipResponsesEnum,
  groupRoleEnum,
} from '@tournament-app/types';
import {
  GroupMembershipUpdateRequest,
  GroupMembershipQuery,
} from '../dto/requests.dto';
import {
  GroupMembershipResponse,
  MinimalMembershipResponse,
} from '../dto/responses.dto';
import { NotFoundException } from '@nestjs/common';
import { SseNotificationsService } from '../../infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from '../../infrastructure/firebase-notifications/templates';
import { GroupService } from '../../group/group.service';

describe('GroupMembershipService', () => {
  let service: GroupMembershipService;
  let sseNotificationsService: SseNotificationsService;
  let templatesFiller: NotificationTemplatesFiller;
  let groupService: GroupService;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
  };

  const mockSseNotificationsService = {
    createWithUsers: jest.fn(),
  };

  const mockTemplatesFiller = {
    fill: jest.fn(),
  };

  const mockGroupService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMembershipService,
        {
          provide: GroupMembershipDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: SseNotificationsService,
          useValue: mockSseNotificationsService,
        },
        {
          provide: NotificationTemplatesFiller,
          useValue: mockTemplatesFiller,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    service = module.get<GroupMembershipService>(GroupMembershipService);
    sseNotificationsService = module.get<SseNotificationsService>(
      SseNotificationsService,
    );
    templatesFiller = module.get<NotificationTemplatesFiller>(
      NotificationTemplatesFiller,
    );
    groupService = module.get<GroupService>(GroupService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group membership', async () => {
      mockRepository.createEntity.mockResolvedValue(undefined);

      await service.create(1, 1);

      expect(mockRepository.createEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
      });
    });
  });

  describe('findAll', () => {
    const query: GroupMembershipQuery = {
      userId: 1,
      groupId: 1,
      role: groupRoleEnum.MEMBER,
    };

    const mockResponse: GroupMembershipResponse[] = [
      {
        groupId: 1,
        userId: 1,
        role: groupRoleEnum.MEMBER,
        user: {
          id: 1,
          username: 'test',
          profilePicture: 'test.jpg',
          isFake: false,
        },
        group: {
          id: 1,
          name: 'test',
          abbreviation: 'TST',
          logo: 'test.jpg',
        },
        createdAt: new Date().toISOString(),
      },
    ];

    it('should return all group memberships', async () => {
      mockRepository.getQuery.mockResolvedValue(mockResponse);

      const result = await service.findAll(query);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const mockResponse: GroupMembershipResponse[] = [
      {
        groupId: 1,
        userId: 1,
        role: groupRoleEnum.MEMBER,
        user: {
          id: 1,
          username: 'test',
          profilePicture: 'test.jpg',
          isFake: false,
        },
        group: {
          id: 1,
          name: 'test',
          abbreviation: 'TST',
          logo: 'test.jpg',
        },
        createdAt: new Date().toISOString(),
      },
    ];

    it('should return a single group membership', async () => {
      mockRepository.getSingleQuery.mockResolvedValue(mockResponse);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockResponse[0]);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(
        { groupId: 1, userId: 1 },
        GroupMembershipResponsesEnum.BASE,
      );
    });

    it('should return a single group membership with custom response type', async () => {
      mockRepository.getSingleQuery.mockResolvedValue(mockResponse);

      const result = await service.findOne(
        1,
        1,
        GroupMembershipResponsesEnum.MINI,
      );

      expect(result).toEqual(mockResponse[0]);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(
        { groupId: 1, userId: 1 },
        GroupMembershipResponsesEnum.MINI,
      );
    });
  });

  describe('update', () => {
    const updateDto: GroupMembershipUpdateRequest = {
      role: groupRoleEnum.ADMIN,
    };

    it('should update a group membership', async () => {
      mockRepository.updateEntity.mockResolvedValue(undefined);
      mockRepository.getSingleQuery.mockResolvedValue([
        { role: groupRoleEnum.MEMBER },
      ]);

      jest
        .spyOn(service, 'sendNotificationAboutPromotion')
        .mockResolvedValue({} as any);

      await service.update(1, 1, updateDto);

      expect(mockRepository.updateEntity).toHaveBeenCalledWith(
        { groupId: 1, userId: 1 },
        updateDto,
      );
    });

    it('should update and send admin promotion notification', async () => {
      mockRepository.updateEntity.mockResolvedValue(undefined);
      mockRepository.getSingleQuery.mockResolvedValue([
        { role: groupRoleEnum.MEMBER },
      ]);

      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been promoted to admin in Test Group',
      );

      await service.update(1, 1, { role: groupRoleEnum.ADMIN });

      expect(mockRepository.updateEntity).toHaveBeenCalledWith(
        { groupId: 1, userId: 1 },
        { role: groupRoleEnum.ADMIN },
      );
      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });

    it('should update and send admin demotion notification', async () => {
      mockRepository.updateEntity.mockResolvedValue(undefined);
      mockRepository.getSingleQuery.mockResolvedValue([
        { role: groupRoleEnum.ADMIN },
      ]);

      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been demoted from admin in Test Group',
      );

      await service.update(1, 1, { role: groupRoleEnum.MEMBER });

      expect(mockRepository.updateEntity).toHaveBeenCalledWith(
        { groupId: 1, userId: 1 },
        { role: groupRoleEnum.MEMBER },
      );
      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a group membership and send notification', async () => {
      mockRepository.deleteEntity.mockResolvedValue(undefined);
      mockRepository.getSingleQuery.mockResolvedValue([
        { role: groupRoleEnum.MEMBER },
      ]);

      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been removed from Test Group',
      );

      await service.remove(1, 1);

      expect(mockRepository.deleteEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
      });
      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('sendNotificationAboutPromotion', () => {
    it('should send notification about admin promotion', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been promoted to admin in Test Group',
      );

      await service.sendNotificationAboutPromotion(1, 1);

      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('sendNotificationAboutDemotion', () => {
    it('should send notification about admin demotion', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'You have been demoted from admin in Test Group',
      );

      await service.sendNotificationAboutDemotion(1, 1);

      expect(mockGroupService.findOne).toHaveBeenCalledWith(1);
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
      expect(mockSseNotificationsService.createWithUsers).toHaveBeenCalled();
    });
  });

  describe('role checks', () => {
    const mockMemberResponse: MinimalMembershipResponse[] = [
      {
        groupId: 1,
        userId: 1,
        role: groupRoleEnum.MEMBER,
      },
    ];

    const mockAdminResponse: MinimalMembershipResponse[] = [
      {
        groupId: 1,
        userId: 1,
        role: groupRoleEnum.ADMIN,
      },
    ];

    const mockOwnerResponse: MinimalMembershipResponse[] = [
      {
        groupId: 1,
        userId: 1,
        role: groupRoleEnum.OWNER,
      },
    ];

    describe('isAdmin', () => {
      it('should return true for admin role', async () => {
        mockRepository.getSingleQuery.mockResolvedValue(mockAdminResponse);
        const result = await service.isAdmin(1, 1);
        expect(result).toBe(true);
      });

      it('should return true for owner role', async () => {
        mockRepository.getSingleQuery.mockResolvedValue(mockOwnerResponse);
        const result = await service.isAdmin(1, 1);
        expect(result).toBe(true);
      });

      it('should return false for member role', async () => {
        mockRepository.getSingleQuery.mockResolvedValue(mockMemberResponse);
        const result = await service.isAdmin(1, 1);
        expect(result).toBe(false);
      });
    });

    describe('isMember', () => {
      it('should return true when membership exists', async () => {
        mockRepository.getSingleQuery.mockResolvedValue(mockMemberResponse);
        const result = await service.isMember(1, 1);
        expect(result).toBe(true);
      });

      it('should return false when membership does not exist', async () => {
        mockRepository.getSingleQuery.mockResolvedValue([]);
        try {
          await service.isMember(1, 1);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });

    describe('isOwner', () => {
      it('should return true for owner role', async () => {
        mockRepository.getSingleQuery.mockResolvedValue(mockOwnerResponse);
        const result = await service.isOwner(1, 1);
        expect(result).toBe(true);
      });

      it('should return false for non-owner roles', async () => {
        mockRepository.getSingleQuery.mockResolvedValue(mockAdminResponse);
        const result = await service.isOwner(1, 1);
        expect(result).toBe(false);
      });
    });
  });
});
