import { Test, TestingModule } from '@nestjs/testing';
import { GroupJoinRequestsController } from '../group-join-requests.controller';
import { GroupJoinRequestsService } from '../group-join-requests.service';
import {
  GroupJoinRequestResponsesEnum,
  userRoleEnum,
} from '@tournament-app/types';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { GroupService } from 'src/group/group.service';

describe('GroupJoinRequestsController', () => {
  let controller: GroupJoinRequestsController;
  let service: GroupJoinRequestsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    accept: jest.fn(),
    reject: jest.fn(),
    checkIfGroupIsPublic: jest.fn(),
  };

  const mockGroupService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupJoinRequestsController],
      providers: [
        {
          provide: GroupJoinRequestsService,
          useValue: mockService,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    controller = module.get<GroupJoinRequestsController>(
      GroupJoinRequestsController,
    );
    service = module.get<GroupJoinRequestsService>(GroupJoinRequestsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a group join request', async () => {
      const createDto = {
        message: 'test message',
        relatedLFPId: 1,
      };
      const user: ValidatedUserDto = {
        email: 'test@example',
        id: 1,
        role: userRoleEnum.USER,
      };

      await controller.create(1, user, createDto);

      expect(service.create).toHaveBeenCalledWith(1, user.id, createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of group join requests', async () => {
      const result = [{ id: 1, message: 'test' }];
      mockService.findAll.mockResolvedValue(result);
      const query = {};

      const req = new Request('http://test.com/group-join-requests');

      expect((await controller.findAll(query, req)).results).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a group join request', async () => {
      const result = { id: 1, message: 'test' };
      mockService.findOne.mockResolvedValue(result);

      expect(
        await controller.findOne(1, 1, GroupJoinRequestResponsesEnum.WITH_USER),
      ).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(
        1,
        1,
        GroupJoinRequestResponsesEnum.WITH_USER,
      );
    });
  });

  describe('update', () => {
    it('should update a group join request', async () => {
      const updateDto = {
        message: 'updated message',
      };

      const user: ValidatedUserDto = {
        email: 'test@example',
        id: 1,
        role: userRoleEnum.USER,
      };

      await controller.update(1, user, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, 1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a group join request', async () => {
      const user = {
        email: 'test@example',
        id: 1,
        role: userRoleEnum.USER,
      };

      await controller.remove(1, user);

      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('accept', () => {
    it('should accept a group join request', async () => {
      await controller.accept(1, 1);

      expect(service.accept).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('reject', () => {
    it('should reject a group join request', async () => {
      await controller.reject(1, 1);

      expect(service.reject).toHaveBeenCalledWith(1, 1);
    });
  });
});
