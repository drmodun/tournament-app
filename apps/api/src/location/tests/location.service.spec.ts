import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from '../location.service';
import { LocationDrizzleRepository } from '../location.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PostgresError } from 'postgres';
import { CreateLocationDto, UpdateLocationDto } from '../dto/requests';
import { LocationResponsesEnum } from '@tournament-app/types';

describe('LocationService', () => {
  let service: LocationService;
  let repository: LocationDrizzleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: LocationDrizzleRepository,
          useValue: {
            createEntity: jest.fn(),
            getQuery: jest.fn(),
            getSingleQuery: jest.fn(),
            updateEntity: jest.fn(),
            deleteEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    repository = module.get<LocationDrizzleRepository>(
      LocationDrizzleRepository,
    );
  });

  describe('getLocationByApiId', () => {
    it('should return location when found', async () => {
      const mockLocation = { id: 1, apiId: 'test123' };
      jest.spyOn(repository, 'getQuery').mockResolvedValue([mockLocation]);

      const result = await service.getLocationByApiId('test123');
      expect(result).toEqual(mockLocation);
    });

    it('should return undefined when location not found', async () => {
      jest.spyOn(repository, 'getQuery').mockResolvedValue([]);

      const result = await service.getLocationByApiId('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    const createDto: CreateLocationDto = {
      name: 'Test Location',
      apiId: 'location123',
      lat: 40.7128,
      lng: -74.006,
    };

    it('should return existing location if found by apiId', async () => {
      const existingLocation = { id: 1, apiId: 'location123' };
      jest.spyOn(repository, 'getQuery').mockResolvedValue([existingLocation]);

      const result = await service.create(createDto);
      expect(result).toEqual(existingLocation);
      expect(repository.createEntity).not.toHaveBeenCalled();
    });

    it('should create new location if not exists', async () => {
      const newLocation = { id: 1, ...createDto };
      jest.spyOn(repository, 'getQuery').mockResolvedValue([]);
      jest.spyOn(repository, 'createEntity').mockResolvedValue([newLocation]);

      const result = await service.create(createDto);
      expect(result).toEqual(newLocation);
      expect(repository.createEntity).toHaveBeenCalledWith({
        ...createDto,
        coordinates: [createDto.lng, createDto.lat],
      });
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      jest.spyOn(repository, 'getQuery').mockResolvedValue([]);
      jest.spyOn(repository, 'createEntity').mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all locations with default response type', async () => {
      const mockLocations = [{ id: 1 }, { id: 2 }];
      jest.spyOn(repository, 'getQuery').mockResolvedValue(mockLocations);

      const result = await service.findAll({});
      expect(result).toEqual(mockLocations);
      expect(repository.getQuery).toHaveBeenCalledWith({
        responseType: LocationResponsesEnum.BASE,
      });
    });

    it('should return locations with specified response type', async () => {
      const mockLocations = [{ id: 1, createdAt: new Date() }];
      jest.spyOn(repository, 'getQuery').mockResolvedValue(mockLocations);

      const result = await service.findAll({
        responseType: LocationResponsesEnum.EXTENDED,
      });
      expect(result).toEqual(mockLocations);
    });
  });

  describe('findOne', () => {
    it('should return a single location', async () => {
      const mockLocation = { id: 1 };
      jest
        .spyOn(repository, 'getSingleQuery')
        .mockResolvedValue([mockLocation]);

      const result = await service.findOne(1);
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException when location not found', async () => {
      jest.spyOn(repository, 'getSingleQuery').mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateLocationDto = {
      name: 'Updated Location',
      lat: 40.7128,
      lng: -74.006,
    };

    it('should update location successfully', async () => {
      const mockLocation = { id: 1 };
      jest
        .spyOn(repository, 'getSingleQuery')
        .mockResolvedValue([mockLocation]);
      jest.spyOn(repository, 'updateEntity').mockResolvedValue([mockLocation]);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException when location not found', async () => {
      jest.spyOn(repository, 'getSingleQuery').mockResolvedValue([]);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update with coordinates when lat and lng provided', async () => {
      const mockLocation = { id: 1 };
      jest
        .spyOn(repository, 'getSingleQuery')
        .mockResolvedValue([mockLocation]);
      jest.spyOn(repository, 'updateEntity').mockResolvedValue([mockLocation]);

      await service.update(1, updateDto);
      expect(repository.updateEntity).toHaveBeenCalledWith(1, {
        ...updateDto,
        coordinates: [updateDto.lng, updateDto.lat],
      });
    });
  });

  describe('remove', () => {
    it('should remove location successfully', async () => {
      const mockLocation = { id: 1 };
      jest.spyOn(repository, 'deleteEntity').mockResolvedValue([mockLocation]);

      const result = await service.remove(1);
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException when location not found', async () => {
      jest.spyOn(repository, 'deleteEntity').mockResolvedValue([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
