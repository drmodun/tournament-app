import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserDrizzleRepository } from '../user.repository';
import { UserResponsesEnum, userRoleEnum } from '@tournament-app/types';
import {
  CreateUserRequest,
  UpdateUserInfo,
  UserQuery,
} from '../dto/requests.dto';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { BlobService } from 'src/infrastructure/blob/blob.service';

describe('UsersController', () => {
  let controller: UsersController;
  const blobService = {
    uploadImage: jest.fn(),
    deleteFile: jest.fn(),
  };

  jest.mock('../users.service');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        UserDrizzleRepository,
        { provide: BlobService, useValue: blobService },
      ],
      imports: [EmailModule],
    }).compile();

    blobService.uploadImage.mockReset();
    blobService.deleteFile.mockReset().mockResolvedValue(undefined);

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
          { id: 1, username: 'john_doe', isFake: false },
          { id: 2, username: 'jane_doe', isFake: false },
        ];
      });

    const request: UserQuery = {
      page: 1,
      pageSize: 10,
      username: 'john_doe',
      country: 'USA',
      field: 'username',
      order: 'asc',
      responseType: UserResponsesEnum.MINI,
    };

    const req = new Request('https://example.com/api/users');

    const result = await controller.findAll(request, req);

    expect(result.results).toEqual([
      { id: 1, username: 'john_doe', isFake: false },
      { id: 2, username: 'jane_doe', isFake: false },
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
      query: request,
    });
  });

  it('should return a user', async () => {
    jest
      .spyOn(UsersService.prototype, 'findOne')
      .mockImplementation(async () => {
        return { id: 1, username: 'john_doe', isFake: false };
      });

    const result = await controller.findOne(1, UserResponsesEnum.MINI);

    expect(result).toEqual({ id: 1, username: 'john_doe', isFake: false });
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
      dateOfBirth: new Date(),
      password: 'password',
      name: 'John Doe',
      profilePicture: 'https://example.com/john_doe.jpg',
    };

    const result = await controller.create(request, undefined, {} as any);

    expect(result).toEqual({ id: 1 });
    expect(blobService.uploadImage).not.toHaveBeenCalled();
  });

  describe('signing up with a profile picture', () => {
    const request = {
      username: 'john_doe',
      country: 'US',
      email: 'john@doe.com',
      dateOfBirth: new Date(),
      password: 'password',
      name: 'John Doe',
    } as CreateUserRequest;
    const file = { buffer: Buffer.from('image') };
    const httpRequest = {} as any;

    beforeEach(() => {
      blobService.uploadImage.mockResolvedValue({
        key: 'avatar/1.png',
        url: 'http://api/files/avatar/1.png',
      });
    });

    it('stores the picture and saves its URL', async () => {
      const create = jest
        .spyOn(UsersService.prototype, 'create')
        .mockResolvedValue({ id: 1 });

      await expect(
        controller.create(request, file, httpRequest),
      ).resolves.toEqual({ id: 1 });
      expect(blobService.uploadImage).toHaveBeenCalledWith(
        file,
        'avatar',
        httpRequest,
      );
      expect(create).toHaveBeenCalledWith({
        ...request,
        profilePicture: 'http://api/files/avatar/1.png',
      });
    });

    it('removes the picture again when the user cannot be created', async () => {
      jest
        .spyOn(UsersService.prototype, 'create')
        .mockRejectedValue(new Error('duplicate email'));

      await expect(
        controller.create(request, file, httpRequest),
      ).rejects.toThrow('duplicate email');
      expect(blobService.deleteFile).toHaveBeenCalledWith('avatar/1.png');
    });
  });

  it('should update a user', async () => {
    jest
      .spyOn(UsersService.prototype, 'update')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const request: CreateUserRequest = {
      username: 'john_doe',
      bio: 'I am a user',
      country: 'USA',
      email: 'john@doe.com',
      dateOfBirth: new Date(),
      password: 'password',
      name: 'John Doe',
      profilePicture: 'https://example.com/john_doe.jpg',
    };

    const result = await controller.update(1, request);

    expect(result).toEqual({ id: 1 });
  });

  it('should delete a user', async () => {
    jest
      .spyOn(UsersService.prototype, 'remove')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const result = await controller.remove(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should delete me', async () => {
    jest
      .spyOn(UsersService.prototype, 'remove')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const user = {
      id: 1,
      email: 'john@doe.com',
      role: userRoleEnum.USER,
    } satisfies ValidatedUserDto;

    const result = await controller.deleteMe(user);

    expect(result).toEqual({ id: 1 });
  });

  it('should update me', async () => {
    jest
      .spyOn(UsersService.prototype, 'update')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const user = {
      id: 1,
      email: 'john@doe.com',
      role: userRoleEnum.USER,
    } satisfies ValidatedUserDto;

    const request: UpdateUserInfo = {
      username: 'john_doe',
      bio: 'I am a user',
      country: 'USA',
      location: 'New York',
      name: 'John Doe',
      profilePicture: 'https://example.com/john_doe.jpg',
    };

    const result = await controller.updateMe(user, request);

    expect(result).toEqual({ id: 1 });
  });
});
