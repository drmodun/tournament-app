import { Test, TestingModule } from '@nestjs/testing';
import { GroupJoinRequestsService } from '../group-join-requests.service';
import { GroupJoinRequestDrizzleRepository } from '../group-join-requests.repository';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GroupJoinRequestResponsesEnum } from '@tournament-app/types';
import { GroupService } from 'src/group/group.service';
import { SseNotificationsService } from '../../infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from '../../infrastructure/firebase-notifications/templates';

describe('GroupJoinRequestsService', () => {
  let service: GroupJoinRequestsService;
  let repository: GroupJoinRequestDrizzleRepository;
  let sseNotificationsService: SseNotificationsService;
  let templatesFiller: NotificationTemplatesFiller;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
    checkIfGroupIsPublic: jest.fn(),
    getAdminIds: jest.fn(),
  };

  const mockGroupMembershipService = {
    create: jest.fn(),
    getAllAdmins: jest.fn(),
  };

  const mockGroupService = {
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
        GroupJoinRequestsService,
        {
          provide: GroupJoinRequestDrizzleRepository,
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

    service = module.get<GroupJoinRequestsService>(GroupJoinRequestsService);
    repository = module.get<GroupJoinRequestDrizzleRepository>(
      GroupJoinRequestDrizzleRepository,
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
    it('should create a group join request and send notifications to admins', async () => {
      const createDto = {
        message: 'test message',
        relatedLFPId: 1,
      };
      const groupData = { name: 'Test Group', id: 1 };
      const adminIds = [2, 3];

      service.checkIfGroupIsPublic = jest.fn().mockResolvedValue(false);
      mockGroupMembershipService.getAllAdmins.mockResolvedValue(adminIds);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'User testuser wants to join your group Test Group',
      );

      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);

      await service.create(1, 1, createDto);

      expect(repository.createEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
        message: createDto.message,
        relatedLFPId: createDto.relatedLFPId,
      });
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
    });
  });

  describe('sendNotificationsToAdmins', () => {
    it('should send notifications to all group admins', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      const adminIds = [2, 3];

      mockGroupMembershipService.getAllAdmins.mockResolvedValue(adminIds);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'User testuser wants to join your group Test Group',
      );

      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);

      await service.createNotificationBodyForNewRequest(1, 1);

      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of group join requests', async () => {
      const result = [{ id: 1, message: 'test' }];
      mockRepository.getQuery.mockResolvedValue(result);

      expect(await service.findAll({})).toBe(result);
      expect(repository.getQuery).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a group join request', async () => {
      const result = { id: 1, message: 'test' };
      mockRepository.getSingleQuery.mockResolvedValue([result]);

      expect(
        await service.findOne(1, 1, GroupJoinRequestResponsesEnum.WITH_USER),
      ).toBe(result);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        {
          userId: 1,
          groupId: 1,
        },
        GroupJoinRequestResponsesEnum.WITH_USER,
      );
    });

    it('should throw NotFoundException when group join request not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a group join request', async () => {
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
    it('should remove a group join request', async () => {
      await service.remove(1, 1);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
    });
  });

  describe('accept', () => {
    it('should accept a join request, create membership, delete request and send notification', async () => {
      const mockRequest = { id: 1, message: 'test' };
      const groupData = { name: 'Test Group', id: 1 };

      mockRepository.getSingleQuery.mockResolvedValue([mockRequest]);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been approved',
      );

      await service.accept(1, 1);

      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);

      expect(mockGroupMembershipService.create).toHaveBeenCalledWith(1, 1);
      expect(repository.deleteEntity).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
    });

    it('should throw BadRequestException when request does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.accept(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a join request, delete request and send notification', async () => {
      const mockRequest = { id: 1, message: 'test' };
      const groupData = { name: 'Test Group', id: 1 };

      mockRepository.getSingleQuery.mockResolvedValue([mockRequest]);
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been rejected',
      );

      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);

      await service.reject(1, 1);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.reject(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendAcceptanceNotification', () => {
    it('should send notification about request acceptance', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been approved',
      );

      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);

      await service.createNotificationBodyForApprovedJoin(1, 1);

      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
    });
  });

  describe('sendRejectionNotification', () => {
    it('should send notification about request rejection', async () => {
      const groupData = { name: 'Test Group', id: 1 };
      mockGroupService.findOne.mockResolvedValue(groupData);
      mockTemplatesFiller.fill.mockReturnValue(
        'Your join request for the group Test Group has been rejected',
      );

      jest.spyOn(service, 'findOne').mockResolvedValue({} as any);

      await service.createNotificationBodyForRejectedJoin(1, 1);

      expect(mockTemplatesFiller.fill).toHaveBeenCalled();
    });
  });
});
