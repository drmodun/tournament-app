import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipController } from '../group-membership.controller';
import { GroupMembershipService } from '../group-membership.service';
import {
  GroupMembershipQuery,
  GroupMembershipUpdateRequest,
} from '../dto/requests.dto';
import {
  GroupMembershipResponsesEnum,
  groupRoleEnum,
  IQueryMetadata,
  Links,
  Pagination,
} from '^tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';

jest.mock('src/base/static/makeMetadata');

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const query: GroupMembershipQuery = {
      userId: 1,
      groupId: 1,
      role: groupRoleEnum.MEMBER,
    };
    const mockRequest = {
      url: 'http://test.com/group-membership',
      method: 'GET',
      protocol: 'http',
      get: jest.fn(),
      headers: {},
      path: '/group-membership',
      query: {},
      params: {},
      body: {},
    };

    it('should return paginated group memberships with metadata', async () => {
      const mockResults = [
        { id: 1, userId: 1, groupId: 1, role: groupRoleEnum.MEMBER },
      ];
      const mockPagination: Pagination = {
        page: 1,
        pageSize: 10,
        total: 1,
      };
      const mockLinks: Links = {
        first: 'http://test.com/group-membership?page=1',
        prev: 'http://test.com/group-membership?page=1',
        next: 'http://test.com/group-membership?page=2',
      };
      const mockMetadata: IQueryMetadata = {
        pagination: mockPagination,
        links: mockLinks,
      };

      mockService.findAll.mockResolvedValue(mockResults);
      (MetadataMaker.makeMetadataFromQuery as jest.Mock).mockReturnValue(
        mockMetadata,
      );

      const req = new Request('http://test.com/group-membership');

      const result = await controller.findAll(query, req);

      expect(result).toEqual({
        results: mockResults,
        metadata: mockMetadata,
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(MetadataMaker.makeMetadataFromQuery).toHaveBeenCalledWith(
        query,
        mockResults,
        mockRequest.url,
      );
    });
  });

  describe('findOne', () => {
    const groupId = 1;
    const userId = 1;
    const responseType = GroupMembershipResponsesEnum.BASE;

    it('should return a specific group membership', async () => {
      const expectedResult = {
        id: 1,
        userId: 1,
        groupId: 1,
        role: groupRoleEnum.MEMBER,
      };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(groupId, userId, responseType);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(
        groupId,
        userId,
        responseType,
      );
    });

    it('should handle missing responseType', async () => {
      const expectedResult = {
        id: 1,
        userId: 1,
        groupId: 1,
        role: groupRoleEnum.MEMBER,
      };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(groupId, userId);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(groupId, userId, undefined);
    });
  });

  describe('create', () => {
    const groupId = 1;
    const userId = 1;

    it('should create a group membership', async () => {
      const expectedResult = {
        id: 1,
        groupId,
        userId,
        role: groupRoleEnum.MEMBER,
      };
      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(groupId, userId);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(groupId, userId);
    });
  });

  describe('update', () => {
    const groupId = 1;
    const userId = 1;
    const updateDto: GroupMembershipUpdateRequest = {
      role: groupRoleEnum.ADMIN,
    };

    it('should update a group membership', async () => {
      const expectedResult = {
        id: 1,
        groupId,
        userId,
        role: groupRoleEnum.ADMIN,
      };
      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(groupId, userId, updateDto);
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(groupId, userId, updateDto);
    });
  });

  describe('remove', () => {
    const groupId = 1;
    const userId = 1;

    it('should remove a group membership', async () => {
      const expectedResult = { success: true };
      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(groupId, userId);
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(groupId, userId);
    });
  });
});
