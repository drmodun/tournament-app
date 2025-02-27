import { Test, TestingModule } from '@nestjs/testing';
import { LfgController } from '../lfg.controller';
import { LfgService } from '../lfg.service';
import { CreateLFGRequest, UpdateLFGRequest } from '../dto/requests';
import { userRoleEnum } from '@tournament-app/types';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';

describe('LfgController', () => {
  let controller: LfgController;
  let service: LfgService;

  const mockUser: ValidatedUserDto = {
    id: 1,
    email: 'test@test.com',
    role: userRoleEnum.USER,
  };

  const mockLfgResponse = {
    id: 1,
    userId: 1,
    message: 'Looking for team',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LfgController],
      providers: [
        {
          provide: LfgService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMyLfg: jest.fn(),
            findPlayers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LfgController>(LfgController);
    service = module.get<LfgService>(LfgService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMyLFG', () => {
    it('should return user LFG posts', async () => {
      const mockLfgs = [mockLfgResponse];
      jest.spyOn(service, 'findMyLfg').mockResolvedValue(mockLfgs);

      const result = await controller.findMyLFG(mockUser);
      expect(result).toEqual(mockLfgs);
      expect(service.findMyLfg).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findPlayers', () => {
    it('should return players for a group', async () => {
      const mockPlayers = [
        {
          looking_for_group: {
            id: 1,
            createdAt: new Date(),
            userId: 1,
            message: 'Looking for team',
          },
          user: {
            name: 'Player One',
            id: 1,
            username: 'player1',
            profilePicture: 'pic.jpg',
            bio: 'Bio',
            email: 'test@test.com',
            password: 'hash',
            role: 'user',
            code: 'code',
            isFake: false,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            countryId: 1,
            dateOfBirth: new Date(),
            country: 'Country',
            stripeCustomerId: 'cus_123',
            bettingPoints: 100,
            customerId: 'cust_123',
            level: 1,
          },
          category_lfg: {
            createdAt: new Date(),
            categoryId: 1,
            lfgId: 1,
          },
          category: {
            id: 1,
            name: 'Category',
            createdAt: new Date(),
            updatedAt: new Date(),
            type: 'PROGRAMMING',
            description: 'Category description',
            image: 'category.jpg',
          },
          category_career: {
            createdAt: new Date(),
            userId: 1,
            categoryId: 1,
            elo: 1000,
          },
        },
      ];

      jest.spyOn(service, 'findPlayers').mockResolvedValue(mockPlayers);

      const result = await controller.findPlayers(1);
      expect(result).toEqual(mockPlayers);
      expect(service.findPlayers).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create an LFG post', async () => {
      const createRequest: CreateLFGRequest = {
        message: 'Looking for team',
        categoryIds: [1, 2],
      };

      jest.spyOn(service, 'create').mockResolvedValue(undefined);

      await controller.create(createRequest, mockUser);
      expect(service.create).toHaveBeenCalledWith(createRequest, mockUser.id);
    });
  });

  describe('update', () => {
    it('should update an LFG post', async () => {
      const updateRequest: UpdateLFGRequest = {
        message: 'Updated message',
        categoryIds: [1, 2, 3],
      };

      jest.spyOn(service, 'update').mockResolvedValue(undefined);

      await controller.update(1, updateRequest, mockUser);
      expect(service.update).toHaveBeenCalledWith(
        1,
        updateRequest,
        mockUser.id,
      );
    });
  });

  describe('delete', () => {
    it('should delete an LFG post', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      await controller.delete(1, mockUser);
      expect(service.delete).toHaveBeenCalledWith(1, mockUser.id);
    });
  });
});
