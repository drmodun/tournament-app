import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserDrizzleRepository } from '../user.repository';
import {
  CreateUserRequest,
  FullUserQuery,
  UserResponsesEnum,
} from '@tournament-app/types';

describe('UsersController', () => {
  let controller: UsersController;

  jest.mock('../users.service');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, UserDrizzleRepository],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a valid query', async () => {
    jest
      .spyOn(UsersService.prototype, 'findAll')
      .mockImplementation(async () => {
        return [
          { id: 1, username: 'john_doe' },
          { id: 2, username: 'jane_doe' },
        ];
      });

    const request: FullUserQuery = {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      query: {
        username: 'john_doe',
        country: 'USA',
      },
      sort: {
        field: 'username',
        order: 'asc',
      },
      responseType: UserResponsesEnum.MINI,
    };

    const req = new Request('https://example.com/api/users');

    const result = await controller.findAll(request, req);

    expect(result.results).toEqual([
      { id: 1, username: 'john_doe' },
      { id: 2, username: 'jane_doe' },
    ]);

    expect(result.metadata).toEqual({
      pagination: {
        page: 1,
        pageSize: 10,
      },
      links: {
        first: 'https://example.com/api/users?page=1',
        prev: 'https://example.com/api/users?page=0',
        next: 'https://example.com/api/users?page=2',
      },
      query: {
        username: 'john_doe',
        country: 'USA',
      },
    });
  });

  it('should return a user', async () => {
    jest
      .spyOn(UsersService.prototype, 'findOne')
      .mockImplementation(async () => {
        return { id: 1, username: 'john_doe' };
      });

    const result = await controller.findOne(1, UserResponsesEnum.MINI);

    expect(result).toEqual({ id: 1, username: 'john_doe' });
  });

  it('should create a user', async () => {
    jest
      .spyOn(UsersService.prototype, 'create')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const request: CreateUserRequest = {
      username: 'john_doe',
      bio: 'I am a user',
      country: 'USA',
      email: 'john@doe.com',
      location: 'New York',
      password: 'password',
      name: 'John Doe',
      profilePicture: 'https://example.com/john_doe.jpg',
    };

    const result = await controller.create(request);

    expect(result).toEqual({ id: 1 });
  });
});
