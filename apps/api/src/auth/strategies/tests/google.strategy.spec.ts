import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from '../google.strategy';
import { UsersService } from '../../../users/users.service';
import { ValidatedUserDto } from '../../dto/validatedUser.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { UserDtosEnum } from '../../../users/types';
import { userRoleEnum } from '@tournament-app/types';

// Mock the passport-google-oauth20 Strategy

// Mock @nestjs/passport

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockProfile = {
      emails: [{ value: 'test@example.com' }],
      name: { givenName: 'Test' },
      photos: [{ value: 'photo-url' }],
    };

    const mockValidatedUser: ValidatedUserDto = {
      id: 1,
      email: 'test@example.com',
      role: userRoleEnum.USER,
    };

    it('should return existing user if found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockValidatedUser);
      const done = jest.fn();

      await strategy.validate(mockProfile, done);

      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
        UserDtosEnum.VALIDATED,
      );
      expect(done).toHaveBeenCalledWith(null, mockValidatedUser);
    });

    it('should create new user if not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const mockCreatedUser = { id: 2 };
      mockUsersService.create.mockResolvedValue(mockCreatedUser);
      mockUsersService.findOne.mockResolvedValue(mockValidatedUser);

      const done = jest.fn();
      await strategy.validate(mockProfile, done);

      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'Test',
        isFake: false,
        profilePicture: 'photo-url',
        country: 'None',
        name: 'Test',
        location: 'None',
        password: expect.any(String),
      });
      expect(done).toHaveBeenCalledWith(null, mockValidatedUser);
    });

    it('should throw InternalServerErrorException if user creation fails', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(null);

      const done = jest.fn();
      await expect(strategy.validate(mockProfile, done)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if created user cannot be found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 2 });
      mockUsersService.findOne.mockResolvedValue(null);

      const done = jest.fn();
      await expect(strategy.validate(mockProfile, done)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
