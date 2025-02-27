import { Test, TestingModule } from '@nestjs/testing';
import { LfgService } from '../lfg.service';
import { LFGDrizzleRepository } from '../lfg.repository';
import { CreateLFGRequest, UpdateLFGRequest } from '../dto/requests';

describe('LfgService', () => {
  let service: LfgService;
  let repository: LFGDrizzleRepository;

  const mockLfgResponse = {
    id: 1,
    userId: 1,
    message: 'Looking for team',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LfgService,
        {
          provide: LFGDrizzleRepository,
          useValue: {
            createWithCareer: jest.fn(),
            updateWithCareer: jest.fn(),
            getForPlayer: jest.fn(),
            deleteLFG: jest.fn(),
            getQuery: jest.fn(),
            getPlayers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LfgService>(LfgService);
    repository = module.get<LFGDrizzleRepository>(LFGDrizzleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an LFG post', async () => {
      const request: CreateLFGRequest = {
        message: 'Looking for team',
        categoryIds: [1, 2],
      };

      jest.spyOn(repository, 'createWithCareer').mockResolvedValue(undefined);

      await service.create(request, 1);
      expect(repository.createWithCareer).toHaveBeenCalledWith(request, 1);
    });
  });

  describe('update', () => {
    it('should update an LFG post', async () => {
      const request: UpdateLFGRequest = {
        message: 'Updated message',
        categoryIds: [1, 2, 3],
      };

      jest.spyOn(repository, 'updateWithCareer').mockResolvedValue(undefined);

      await service.update(1, request, 1);
      expect(repository.updateWithCareer).toHaveBeenCalledWith(1, request, 1);
    });
  });

  describe('delete', () => {
    it('should delete an LFG post', async () => {
      jest.spyOn(repository, 'deleteLFG').mockResolvedValue(undefined);

      await service.delete(1, 1);
      expect(repository.deleteLFG).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('findMyLfg', () => {
    it('should find user LFG posts', async () => {
      const mockLfgs = [mockLfgResponse];
      jest.spyOn(repository, 'getForPlayer').mockResolvedValue(mockLfgs);

      const result = await service.findMyLfg(1);
      expect(result).toEqual(mockLfgs);
      expect(repository.getForPlayer).toHaveBeenCalledWith(1);
    });
  });

  describe('findPlayers', () => {
    it('should find players for a group', async () => {
      jest.spyOn(repository, 'getPlayers').mockResolvedValue([]);

      const result = await service.findPlayers(1);
      expect(result).toEqual([]);
      expect(repository.getPlayers).toHaveBeenCalledWith(1);
    });
  });
});
