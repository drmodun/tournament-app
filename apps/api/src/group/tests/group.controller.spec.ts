import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from '../group.controller';
import { GroupService } from '../group.service';
import {
  CreateGroupRequest,
  GroupQuery,
  UpdateGroupRequest,
} from '../dto/requests.dto';
import {
  GroupResponsesEnum,
  groupTypeEnum,
  groupFocusEnum,
  userRoleEnum,
} from '^tournament-app/types';

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getGroupMembers: jest.fn(),
    getGroupTournaments: jest.fn(),
    getGroupFollowers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateGroupRequest = {
      name: 'Test Group',
      abbreviation: 'TG',
      description: 'Test Description',
      type: groupTypeEnum.PRIVATE,
      focus: groupFocusEnum.HYBRID,
      logo: 'logo.png',
      locationId: 1,
      country: 'Test Country',
    };
    const userId = 1;

    it('should create a group', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, {
        email: 'test@example.com',
        id: userId,
        role: userRoleEnum.USER,
      });
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto, userId);
    });
  });

  describe('findAll', () => {
    const query: GroupQuery = { type: groupTypeEnum.PRIVATE };

    it('should return array of groups with metadata', async () => {
      const groups = [{ id: 1, name: 'Test Group' }];
      mockService.findAll.mockResolvedValue(groups);

      const mockRequest = new Request('http://test.com/groups');

      const result = await controller.findAll(query, mockRequest);
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('metadata');
      expect(result.results).toEqual(groups);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const id = 1;

    it('should return a group with BASE response type', async () => {
      const expectedResult = { id: 1, name: 'Test Group' };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, GroupResponsesEnum.BASE);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id, GroupResponsesEnum.BASE);
    });

    it('should return a group with MINI response type', async () => {
      const expectedResult = { id: 1, name: 'Test Group' };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, GroupResponsesEnum.MINI);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id, GroupResponsesEnum.MINI);
    });

    it('should return a group with MINI_WITH_LOGO response type', async () => {
      const expectedResult = { id: 1, name: 'Test Group', logo: 'logo.png' };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(
        id,
        GroupResponsesEnum.MINI_WITH_LOGO,
      );
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(
        id,
        GroupResponsesEnum.MINI_WITH_LOGO,
      );
    });

    it('should return a group with MINI_WITH_COUNTRY response type', async () => {
      const expectedResult = {
        id: 1,
        name: 'Test Group',
        country: 'Test Country',
      };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(
        id,
        GroupResponsesEnum.MINI_WITH_COUNTRY,
      );
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(
        id,
        GroupResponsesEnum.MINI_WITH_COUNTRY,
      );
    });

    it('should return a group with EXTENDED response type', async () => {
      const expectedResult = {
        id: 1,
        name: 'Test Group',
        description: 'Test Description',
        type: groupTypeEnum.PRIVATE,
        focus: groupFocusEnum.HYBRID,
        logo: 'logo.png',
        location: 'Test Location',
        country: 'Test Country',
      };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, GroupResponsesEnum.EXTENDED);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(
        id,
        GroupResponsesEnum.EXTENDED,
      );
    });
  });

  describe('update', () => {
    const id = 1;
    const updateDto: UpdateGroupRequest = { name: 'Updated Group Name' };

    it('should update a group', async () => {
      const expectedResult = { id, ...updateDto };
      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    const id = 1;

    it('should remove a group', async () => {
      const expectedResult = { id, name: 'Test Group' };
      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('getGroupMembers', () => {
    const id = 1;

    it('should return group members', async () => {
      const expectedResult = {
        group: { id: 1, name: 'Test Group' },
        members: [{ id: 1, userId: 1, role: 'admin' }],
      };
      mockService.getGroupMembers.mockResolvedValue(expectedResult);

      const result = await controller.getGroupMembers(id);
      expect(result).toEqual(expectedResult);
      expect(service.getGroupMembers).toHaveBeenCalledWith(id);
    });
  });

  describe('getGroupTournaments', () => {
    const id = 1;

    it('should return group tournaments', async () => {
      const expectedResult = {
        group: { id: 1, name: 'Test Group' },
        tournaments: [{ id: 1, name: 'Tournament 1' }],
      };
      mockService.getGroupTournaments.mockResolvedValue(expectedResult);

      const result = await controller.getGroupTournaments(id);
      expect(result).toEqual(expectedResult);
      expect(service.getGroupTournaments).toHaveBeenCalledWith(id);
    });
  });

  describe('getGroupFollowers', () => {
    const id = 1;

    it('should return group followers', async () => {
      const expectedResult = {
        group: { id: 1, name: 'Test Group' },
        followers: [{ id: 1, name: 'Follower 1' }],
      };
      mockService.getGroupFollowers.mockResolvedValue(expectedResult);

      const result = await controller.getGroupFollowers(id);
      expect(result).toEqual(expectedResult);
      expect(service.getGroupFollowers).toHaveBeenCalledWith(id);
    });
  });
});
