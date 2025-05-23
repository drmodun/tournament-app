import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserDrizzleRepository } from '../user.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserRequest, UpdateUserInfo } from '../dto/requests.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/infrastructure/email/email.service';
import { UserResponsesEnum } from '^tournament-app/types';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: UserDrizzleRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    insertEmailConfirmationToken: jest.fn(),
    updatePassword: jest.fn(),
    confirmUserEmail: jest.fn(),
    getQuery: jest.fn(),
    createEntity: jest.fn(),
    resetPassword: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
    sendEmailConfirmationEmail: jest.fn(),
    generateAndSendEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserDrizzleRepository,
          useValue: mockUserRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserDrizzleRepository>(UserDrizzleRepository);

    // Mock bcrypt hash function
    (bcrypt.hash as jest.Mock).mockImplementation((password) => {
      return Promise.resolve(`hashed_${password}`);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    mockUserRepository.createEntity.mockResolvedValue([
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
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
      dateOfBirth: new Date(),
    };

    mockUserRepository.insertEmailConfirmationToken.mockResolvedValue([
      {
        id: 1,
      },
    ]);

    mockEmailService.generateAndSendEmail.mockResolvedValue(null);

    const result = await service.create(request);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an unprocessable entity exception when creating a user fails', async () => {
    mockUserRepository.createEntity.mockResolvedValue([]);
    const request: CreateUserRequest = {
      username: 'john_doe',
      email: 'john@do1e.com',
      password: 'Password123!',
      name: 'John Doe',
      bio: 'I am a person',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
      dateOfBirth: new Date(),
    };

    await expect(service.create(request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw an error when creating a user with an existing email', async () => {
    mockUserRepository.createEntity.mockResolvedValue([]);

    const request: CreateUserRequest = {
      username: 'john_doe',
      email: 'john@do1e.com',
      password: 'Password123!',
      name: 'John Doe',
      bio: 'I am a person',
      profilePicture: 'https://example.com/image.jpg',
      country: 'USA',
      dateOfBirth: new Date(),
    };

    await expect(service.create(request)).rejects.toThrow();
  });

  it('should update a user', async () => {
    mockUserRepository.updateEntity.mockResolvedValue([
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

    expect(result).toEqual({ id: 1 });
  });

  it('should delete a user', async () => {
    mockUserRepository.deleteEntity.mockResolvedValue([
      {
        id: 1,
      },
    ]);

    const result = await service.remove(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an error when deleting a user with a wrong id', async () => {
    mockUserRepository.deleteEntity.mockResolvedValue([]);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should find a user', async () => {
    mockUserRepository.getSingleQuery.mockResolvedValue([
      {
        id: 1,
      },
    ]);

    const result = await service.findOne(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an error when finding a user with a wrong id', async () => {
    mockUserRepository.getSingleQuery.mockResolvedValue([]);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [{ id: 1 }, { id: 2 }];
      mockUserRepository.getQuery = jest.fn().mockResolvedValue(mockUsers);

      const result = await service.findAll({});

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.getQuery).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = { id: 1 };
      mockUserRepository.getQuery.mockResolvedValue([mockUser]);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.getQuery).toHaveBeenCalledWith({
        email: 'test@example.com',
        responseType: UserResponsesEnum.BASE,
      });
    });

    it('should return null if user not found by email', async () => {
      mockUserRepository.getQuery.mockResolvedValue([]);

      await expect(
        service.findOneByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      username: 'updateduser',
    };

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.updateEntity.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.updateEntity).toHaveBeenCalledWith(
        999,
        updateUserDto,
      );
    });

    it('should update and return the user', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUserRepository.getSingleQuery.mockResolvedValue(mockUser);
      mockUserRepository.updateEntity.mockResolvedValue([updatedUser]);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.updateEntity).toHaveBeenCalledWith(
        1,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.getSingleQuery.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.deleteEntity).toHaveBeenCalledWith(999);
    });

    it('should delete the user and return undefined', async () => {
      const mockUser = { id: 1 };
      mockUserRepository.getSingleQuery.mockResolvedValue(mockUser);
      mockUserRepository.deleteEntity.mockResolvedValue([{ id: 1 }]);

      await service.remove(1);

      expect(mockUserRepository.deleteEntity).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserPassword', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('999', 'newPassword')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should update user password with hashed password', async () => {
      const mockUser = { id: 1, password: 'oldHashedPassword' };
      mockUserRepository.resetPassword.mockResolvedValue([mockUser]);

      await service.resetPassword('1', 'newPassword');

      expect(mockUserRepository.resetPassword).toHaveBeenCalledWith(
        '1',
        'newPassword',
      );
    });
  });

  describe('confirmEmail', () => {
    it('should confirm user email', async () => {
      const mockUser = { id: 1, emailConfirmed: false };
      mockUserRepository.getSingleQuery.mockResolvedValue(mockUser);
      mockUserRepository.confirmUserEmail.mockResolvedValue([
        {
          ...mockUser,
          emailConfirmed: true,
        },
      ]);

      await service.confirmUserEmail('1');

      expect(mockUserRepository.confirmUserEmail).toHaveBeenCalledWith('1');
    });
  });
});
