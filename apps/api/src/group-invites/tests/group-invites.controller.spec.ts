import { Test, TestingModule } from '@nestjs/testing';
import { GroupInvitesController } from '../group-invites.controller';
import { GroupInvitesService } from '../group-invites.service';
import { GroupInviteResponsesEnum } from '@tournament-app/types';

describe('GroupInvitesController', () => {
  let controller: GroupInvitesController;
  let service: GroupInvitesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupInvitesController],
      providers: [
        {
          provide: GroupInvitesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<GroupInvitesController>(GroupInvitesController);
    service = module.get<GroupInvitesService>(GroupInvitesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a group invite', async () => {
      const createDto = {
        message: 'test message',
      };

      await controller.create(1, 1, createDto);

      expect(service.create).toHaveBeenCalledWith(1, 1, createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of group invites', async () => {
      const result = [{ id: 1, message: 'test' }];
      mockService.findAll.mockResolvedValue(result);
      const query = {};

      const req = new Request('http://test.com/group-invites');

      expect((await controller.findAll(query, req)).results).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a group invite', async () => {
      const result = { id: 1, message: 'test' };
      mockService.findOne.mockResolvedValue(result);

      expect(
        await controller.findOne(1, 1, GroupInviteResponsesEnum.WITH_USER),
      ).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(
        1,
        1,
        GroupInviteResponsesEnum.WITH_USER,
      );
    });
  });

  describe('update', () => {
    it('should update a group invite', async () => {
      const updateDto = {
        message: 'updated message',
      };

      await controller.update(1, 1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, 1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a group invite', async () => {
      await controller.remove(1, 1);

      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });
});
