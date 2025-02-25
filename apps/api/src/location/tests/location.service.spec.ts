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

  jest.mock('../location.repository');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService, LocationDrizzleRepository],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a location', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'createEntity')
      .mockResolvedValue([{ id: 1 }]);

    const request: CreateLocationDto = {
      name: 'Test Location',
      apiId: 'location123',
      lat: 40.7128,
      lng: -74.006,
    };

    const result = await service.create(request);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an unprocessable entity exception when creating a location fails', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'createEntity')
      .mockResolvedValue([]);

    const request: CreateLocationDto = {
      name: 'Test Location',
      apiId: 'location123',
      lat: 40.7128,
      lng: -74.006,
    };

    await expect(service.create(request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw an error when creating a location with a duplicate apiId', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'createEntity')
      .mockRejectedValue(new PostgresError('23505'));

    const request: CreateLocationDto = {
      name: 'Test Location',
      apiId: 'location123',
      lat: 40.7128,
      lng: -74.006,
    };

    await expect(service.create(request)).rejects.toThrow(PostgresError);
  });

  it('should find all locations', async () => {
    const mockLocations = [
      { id: 1, name: 'Location 1', coordinates: [40.7128, -74.006] },
      { id: 2, name: 'Location 2', coordinates: [34.0522, -118.2437] },
    ];

    jest
      .spyOn(LocationDrizzleRepository.prototype, 'getQuery')
      .mockResolvedValue(mockLocations);

    const result = await service.findAll({
      responseType: LocationResponsesEnum.BASE,
    });

    expect(result).toEqual(mockLocations);
  });

  it('should find one location', async () => {
    const mockLocation = [
      { id: 1, name: 'Location 1', coordinates: [40.7128, -74.006] },
    ];

    jest
      .spyOn(LocationDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue(mockLocation);

    const result = await service.findOne(1, LocationResponsesEnum.BASE);

    expect(result).toEqual(mockLocation[0]);
  });

  it('should throw not found exception when location does not exist', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue(null);

    await expect(
      service.findOne(999, LocationResponsesEnum.BASE),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a location', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'updateEntity')
      .mockResolvedValue([{ id: 1 }]);

    jest
      .spyOn(LocationDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue([{ id: 1 }]);

    const request: UpdateLocationDto = {
      name: 'Updated Location',
      apiId: 'updatedLocation123',
      lat: 40.7128,
      lng: -74.006,
    };

    const result = await service.update(1, request);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw not found exception when updating non-existent location', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'updateEntity')
      .mockResolvedValue(null);

    const request: UpdateLocationDto = {
      name: 'Updated Location',
    };

    await expect(service.update(999, request)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a location', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'deleteEntity')
      .mockResolvedValue([{ id: 1 }]);

    const result = await service.remove(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw not found exception when removing non-existent location', async () => {
    jest
      .spyOn(LocationDrizzleRepository.prototype, 'deleteEntity')
      .mockResolvedValue([]);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
