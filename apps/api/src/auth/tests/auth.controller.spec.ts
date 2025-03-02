import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ValidatedUserDto } from '../dto/validatedUser.dto';
import { IUserLoginResponse, userRoleEnum } from '@tournament-app/types';
import { UsersService } from 'src/users/users.service';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { PasswordResetRequest } from '../dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    verifyWithCredentials: jest.fn(),
    refreshTokens: jest.fn(),
    getTokens: jest.fn(),
    passwordResetRequest: jest.fn(),
    passwordReset: jest.fn(),
    emailConfirmation: jest.fn(),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    resetPassword: jest.fn(),
    confirmUserEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        UserDrizzleRepository,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    const mockLoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockTokens: IUserLoginResponse = {
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    };

    it('should return tokens on successful login', async () => {
      mockAuthService.verifyWithCredentials.mockResolvedValue(mockTokens);

      const result = await controller.login(mockLoginRequest);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.verifyWithCredentials).toHaveBeenCalledWith(
        mockLoginRequest.email,
        mockLoginRequest.password,
      );
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Login failed');
      mockAuthService.verifyWithCredentials.mockRejectedValue(error);

      await expect(controller.login(mockLoginRequest)).rejects.toThrow(error);
    });
  });

  describe('refresh', () => {
    const mockRefreshToken = 'validRefreshToken';
    const mockTokens: IUserLoginResponse = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    };

    it('should return new tokens on successful refresh', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockTokens);

      const result = await controller.refresh(mockRefreshToken);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        mockRefreshToken,
      );
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Refresh failed');
      mockAuthService.refreshTokens.mockRejectedValue(error);

      await expect(controller.refresh(mockRefreshToken)).rejects.toThrow(error);
    });
  });

  describe('authCallback', () => {
    const mockUser: ValidatedUserDto = {
      id: 1,
      email: 'test@example.com',
      role: userRoleEnum.USER,
    };

    const mockTokens: IUserLoginResponse = {
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
    };

    it('should return tokens for Google OAuth callback', async () => {
      mockAuthService.getTokens.mockResolvedValue(mockTokens);

      const result = await controller.authCallback(mockUser);

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.getTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
      );
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Token generation failed');
      mockAuthService.getTokens.mockRejectedValue(error);

      await expect(controller.authCallback(mockUser)).rejects.toThrow(error);
    });
  });

  describe('passwordResetRequest', () => {
    const mockEmail = 'test@example.com';

    it('should call auth service with correct email', async () => {
      mockAuthService.passwordResetRequest.mockResolvedValue(undefined);

      await controller.passwordResetRequest(mockEmail);

      expect(mockAuthService.passwordResetRequest).toHaveBeenCalledWith(
        mockEmail,
      );
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Password reset request failed');
      mockAuthService.passwordResetRequest.mockRejectedValue(error);

      await expect(controller.passwordResetRequest(mockEmail)).rejects.toThrow(
        error,
      );
    });
  });

  describe('passwordReset', () => {
    const mockToken = 'validResetToken';
    const mockPasswordResetRequest: PasswordResetRequest = {
      password: 'newPassword123',
    };

    it('should call auth service with correct token and password', async () => {
      mockAuthService.passwordReset.mockResolvedValue(undefined);

      await controller.passwordReset(mockToken, mockPasswordResetRequest);

      expect(mockAuthService.passwordReset).toHaveBeenCalledWith(
        mockToken,
        mockPasswordResetRequest.password,
      );
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Password reset failed');
      mockAuthService.passwordReset.mockRejectedValue(error);

      await expect(
        controller.passwordReset(mockToken, mockPasswordResetRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('emailConfirmation', () => {
    const mockToken = 'validConfirmationToken';

    it('should call auth service with correct token', async () => {
      mockAuthService.emailConfirmation.mockResolvedValue(undefined);

      await controller.emailConfirmation(mockToken);

      expect(mockAuthService.emailConfirmation).toHaveBeenCalledWith(mockToken);
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Email confirmation failed');
      mockAuthService.emailConfirmation.mockRejectedValue(error);

      await expect(controller.emailConfirmation(mockToken)).rejects.toThrow(
        error,
      );
    });
  });
});
