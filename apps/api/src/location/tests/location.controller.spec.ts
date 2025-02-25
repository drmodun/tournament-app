import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from '../location.controller';
import { LocationService } from '../location.service';
import { LocationDrizzleRepository } from '../location.repository';
import {
  LocationResponsesEnum,
  IMiniLocationResponse,
} from '@tournament-app/types';
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationQuery,
} from '../dto/requests';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('LocationController', () => {
  let controller: LocationController;

  jest.mock('../location.service');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [LocationService, LocationDrizzleRepository],
    }).compile();

    controller = module.get<LocationController>(LocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a valid query', async () => {
    jest
      .spyOn(LocationService.prototype, 'findAll')
      .mockImplementation(async () => {
        return [
          {
            id: 1,
            apiId: 'location1',
          },
          {
            id: 2,
            apiId: 'location2',
          },
        ] satisfies IMiniLocationResponse[];
      });

    const request: LocationQuery = {
      page: 1,
      pageSize: 10,
      name: 'Location',
      field: 'name',
      order: 'asc',
      responseType: LocationResponsesEnum.BASE,
    };

    const req = new Request('https://example.com/api/locations');

    const result = await controller.findAll(request, req);

    expect(result.results).toEqual([
      { id: 1, apiId: 'location1' },
      { id: 2, apiId: 'location2' },
    ]);

    expect(result.metadata).toEqual({
      pagination: {
        page: 1,
        pageSize: 10,
      },
      links: {
        first: 'https://example.com/api/locations?page=1',
        prev: 'https://example.com/api/locations?page=0',
        next: 'https://example.com/api/locations?page=2',
      },
      query: request,
    });
  });

  it('should return a location', async () => {
    jest
      .spyOn(LocationService.prototype, 'findOne')
      .mockImplementation(async () => {
        return {
          id: 1,
          apiId: 'location1',
          name: 'New York',
          coordinates: [40.7128, -74.006],
        };
      });

    const result = await controller.findOne(1, LocationResponsesEnum.BASE);

    expect(result).toEqual({
      id: 1,
      apiId: 'location1',
      name: 'New York',
      coordinates: [40.7128, -74.006],
    });
  });

  it('should create a location', async () => {
    jest
      .spyOn(LocationService.prototype, 'create')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const request: CreateLocationDto = {
      name: 'New Location',
      apiId: 'newLocation123',
      lat: 40.7128,
      lng: -74.006,
    };

    const result = await controller.create(request);

    expect(result).toEqual({ id: 1 });
  });

  it('should update a location', async () => {
    jest
      .spyOn(LocationService.prototype, 'update')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const request: UpdateLocationDto = {
      name: 'Updated Location',
      apiId: 'updatedLocation123',
      lat: 40.7128,
      lng: -74.006,
    };

    const result = await controller.update(1, request);

    expect(result).toEqual({ id: 1 });
  });

  it('should remove a location', async () => {
    jest
      .spyOn(LocationService.prototype, 'remove')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const result = await controller.remove(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw NotFoundException when location is not found', async () => {
    jest
      .spyOn(LocationService.prototype, 'findOne')
      .mockRejectedValue(new NotFoundException('Location not found'));

    await expect(
      controller.findOne(999, LocationResponsesEnum.BASE),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw UnprocessableEntityException when location creation fails', async () => {
    jest
      .spyOn(LocationService.prototype, 'create')
      .mockRejectedValue(
        new UnprocessableEntityException('Location creation failed'),
      );

    const request: CreateLocationDto = {
      name: 'New Location',
      apiId: 'newLocation123',
      lat: 40.7128,
      lng: -74.006,
    };

    await expect(controller.create(request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw NotFoundException when updating non-existent location', async () => {
    jest
      .spyOn(LocationService.prototype, 'update')
      .mockRejectedValue(new NotFoundException('Location not found'));

    const request: UpdateLocationDto = {
      name: 'Updated Location',
      apiId: 'updatedLocation123',
    };

    await expect(controller.update(999, request)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when removing non-existent location', async () => {
    jest
      .spyOn(LocationService.prototype, 'remove')
      .mockRejectedValue(new NotFoundException('Location not found'));

    await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
  });
});
