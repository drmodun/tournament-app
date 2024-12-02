import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { CreateGroupRequest, UpdateGroupRequest } from './dto/requests.dto';
import { GroupResponsesEnum } from '@tournament-app/types';

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      type: 'public',
      focus: 'hybrid',
      logo: 'logo.png',
      location: 'Test Location',
      country: 'Test Country',
    };
    const userId = 1;

    it('should create a group', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, {
        user: { id: userId },
      });
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto, userId);
    });
  });

  describe('findAll', () => {
    const query = { type: 'public' };

    it('should return array of groups', async () => {
      const expectedResult = [{ id: 1, name: 'Test Group' }];
      mockService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const id = 1;
    const responseType = GroupResponsesEnum.BASE;

    it('should return a group', async () => {
      const expectedResult = { id: 1, name: 'Test Group' };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, responseType);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id, responseType);
    });
  });

  describe('update', () => {
    const id = 1;
    const userId = 1;
    const updateDto: UpdateGroupRequest = { name: 'Updated Group Name' };

    it('should update a group', async () => {
      const expectedResult = { id, ...updateDto };
      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto, {
        user: { id: userId },
      });
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto, userId);
    });
  });

  describe('remove', () => {
    const id = 1;
    const userId = 1;

    it('should remove a group', async () => {
      const expectedResult = { id, name: 'Test Group' };
      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id, { user: { id: userId } });
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id, userId);
    });
  });
});
