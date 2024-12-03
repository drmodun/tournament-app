import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserDrizzleRepository } from '../user.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PostgresError } from 'postgres';
import { CreateUserRequest, UpdateUserInfo } from '../dto/requests.dto';

describe('UsersService', () => {
  let service: UsersService;

  jest.mock('../user.repository');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UserDrizzleRepository],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'createEntity')
      .mockResolvedValue([
        {
          id: 1,
        },
      ]);

    const request: CreateUserRequest = {
      username: 'john_doe',
      email: 'john@do1e.com',
      password: 'Password123!',
      name: 'John Doe',
      bio: 'I am a person',
      location: 'USA',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
    };

    const result = await service.create(request);
    console.log(result);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an unprocessable entity exception when creating a user fails', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'createEntity')
      .mockResolvedValue([]);

    const request: CreateUserRequest = {
      username: 'john_doe',
      email: 'john@do1e.com',
      password: 'Password123!',
      name: 'John Doe',
      bio: 'I am a person',
      location: 'USA',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
    };

    await expect(service.create(request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw an error when creating a user with an existing email', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'createEntity')
      .mockRejectedValue(new PostgresError('23505'));

    const request: CreateUserRequest = {
      username: 'john_doe',
      email: 'john@do1e.com',
      password: 'Password123!',
      name: 'John Doe',
      bio: 'I am a person',
      location: 'USA',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
    };

    await expect(service.create(request)).rejects.toThrow();
  });

  it('should update a user', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'updateEntity')
      .mockResolvedValue([
        {
          id: 1,
        },
      ]);

    const request: UpdateUserInfo = {
      name: 'John Doe',
      bio: 'I am a person',
      location: 'USA',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
    };

    const result = await service.update(1, request);
    console.log(result);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an error when updating a user with an existing email', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'updateEntity')
      .mockResolvedValue([]);

    const request: UpdateUserInfo = {
      name: 'John Doe',
      bio: 'I am a person',
      location: 'USA',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
    };

    await expect(service.update(1, request)).rejects.toThrow(NotFoundException);
  });

  it('should delete a user', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'deleteEntity')
      .mockResolvedValue([
        {
          id: 1,
        },
      ]);

    const result = await service.remove(1);
    console.log(result);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an error when deleting a user with a wrong id', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'deleteEntity')
      .mockResolvedValue([]);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should find a user', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue([
        {
          id: 1,
        },
      ]);

    const result = await service.findOne(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an error when finding a user with a wrong id', async () => {
    jest
      .spyOn(UserDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue([]);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
