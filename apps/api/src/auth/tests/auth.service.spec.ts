import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserDtosEnum } from '../../users/types';
import { IUserLoginResponse, userRoleEnum } from '@tournament-app/types';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('verifyWithCredentials', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashedPassword';
    const mockUser = {
      id: 1,
      email: mockEmail,
      password: mockHashedPassword,
      role: 'USER',
    };

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.verifyWithCredentials(mockEmail, mockPassword),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        mockEmail,
        UserDtosEnum.CREDENTIALS,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyWithCredentials(mockEmail, mockPassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
    });

    it('should return tokens when credentials are valid', async () => {
      const mockTokens: IUserLoginResponse = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockImplementation((payload, options) => {
        if (options.secret === process.env.JWT_SECRET) {
          return Promise.resolve(mockTokens.accessToken);
        }
        return Promise.resolve(mockTokens.refreshToken);
      });

      const result = await service.verifyWithCredentials(
        mockEmail,
        mockPassword,
      );

      expect(result).toEqual(mockTokens);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTokens', () => {
    const mockUserId = 1;
    const mockEmail = 'test@example.com';
    const mockRole = userRoleEnum.USER;

    it('should generate access and refresh tokens', async () => {
      const mockTokens: IUserLoginResponse = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      mockJwtService.signAsync.mockImplementation((payload, options) => {
        if (options.secret === process.env.JWT_SECRET) {
          return Promise.resolve(mockTokens.accessToken);
        }
        return Promise.resolve(mockTokens.refreshToken);
      });

      const result = await service.getTokens(mockUserId, mockEmail, mockRole);

      expect(result).toEqual(mockTokens);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUserId,
          email: mockEmail,
          role: mockRole,
        },
        expect.any(Object),
      );
    });
  });

  describe('refreshTokens', () => {
    const mockRefreshToken = 'validRefreshToken';
    const mockPayload = {
      sub: 1,
      username: 'testuser',
    };

    it('should return new tokens when refresh token is valid', async () => {
      const mockNewTokens: IUserLoginResponse = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockJwtService.signAsync.mockImplementation((payload, options) => {
        if (options.secret === process.env.JWT_SECRET) {
          return Promise.resolve(mockNewTokens.accessToken);
        }
        return Promise.resolve(mockNewTokens.refreshToken);
      });

      const result = await service.refreshTokens(mockRefreshToken);

      expect(result).toEqual(mockNewTokens);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        mockRefreshToken,
        expect.any(Object),
      );
    });

    it('should throw error when refresh token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshTokens(mockRefreshToken)).rejects.toThrow();
    });
  });

  describe('validateUser', () => {
    const mockPayload = { id: 1 };

    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockPayload);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockPayload.id);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.validateUser(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
