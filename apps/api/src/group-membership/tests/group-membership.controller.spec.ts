import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipController } from '../group-membership.controller';
import { GroupMembershipService } from '../group-membership.service';
import {
  CreateGroupMembershipRequest,
  UpdateGroupMembershipRequest,
} from '../dto/requests.dto';
import {
  GroupMembershipResponsesEnum,
  GroupMembershipRoleEnum,
} from '@tournament-app/types';

describe('GroupMembershipController', () => {
  let controller: GroupMembershipController;
  let service: GroupMembershipService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMembershipController],
      providers: [
        {
          provide: GroupMembershipService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<GroupMembershipController>(
      GroupMembershipController,
    );
    service = module.get<GroupMembershipService>(GroupMembershipService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateGroupMembershipRequest = {
      userId: 1,
      groupId: 1,
      role: GroupMembershipRoleEnum.MEMBER,
    };
    const userId = 1;

    it('should create a group membership', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, {
        user: { id: userId },
        
      });
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const query = { groupId: 1, role: GroupMembershipRoleEnum.MEMBER };

    it('should return array of group memberships', async () => {
      const expectedResult = [
        { id: 1, userId: 1, groupId: 1, role: GroupMembershipRoleEnum.MEMBER },
      ];
      mockService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const id = 1;
    const responseType = GroupMembershipResponsesEnum.BASE;

    it('should return a group membership', async () => {
      const expectedResult = {
        id: 1,
        userId: 1,
        groupId: 1,
        role: GroupMembershipRoleEnum.MEMBER,
      };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, responseType);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id, responseType);
    });
  });

  describe('update', () => {
    const id = 1;
    const userId = 1;
    const updateDto: UpdateGroupMembershipRequest = {
      role: GroupMembershipRoleEnum.ADMIN,
    };

    it('should update a group membership', async () => {
      const expectedResult = { id, ...updateDto };
      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto, {
        user: { id: userId },
      });
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    const id = 1;
    const userId = 1;

    it('should remove a group membership', async () => {
      const expectedResult = {
        id,
        userId: 1,
        groupId: 1,
        role: GroupMembershipRoleEnum.MEMBER,
      };
      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id, { user: { id: userId } });
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
