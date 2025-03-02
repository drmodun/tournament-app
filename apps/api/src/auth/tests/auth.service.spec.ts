import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/infrastructure/email/email.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mailService: EmailService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    findOne: jest.fn(),
    updateUser: jest.fn(),
    createEntity: jest.fn(),
    updateUserPassword: jest.fn(),
    confirmUserEmail: jest.fn(),
    setPasswordResetTokenAndSendEmail: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
    sendEmailConfirmation: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
        {
          provide: EmailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<EmailService>(EmailService);

    // Default mock implementations
    (bcrypt.compare as jest.Mock).mockImplementation((password, hash) => {
      return password === 'correctPassword';
    });

    mockConfigService.get.mockImplementation((key) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_EXPIRATION') return '1h';
      if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
      if (key === 'PASSWORD_RESET_EXPIRATION') return '1h';
      if (key === 'EMAIL_CONFIRMATION_EXPIRATION') return '24h';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    });
  });

  describe('verifyAsyncWithCredentials', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.verifyWithCredentials('nonexistent@example.com', 'password'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyWithCredentials('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if credentials are valid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockReturnValueOnce('accessToken');
      mockJwtService.signAsync.mockReturnValueOnce('refreshToken');

      const result = await service.verifyWithCredentials(
        'test@example.com',
        'correctPassword',
      );

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('getTokens', () => {
    it('should generate access and refresh tokens', async () => {
      mockJwtService.signAsync.mockReturnValueOnce('accessToken');
      mockJwtService.signAsync.mockReturnValueOnce('refreshToken');

      const result = await service.getTokens(1, 'test@example.com');

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockJwtService.verifyAsync.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalidToken')).rejects.toThrow(
        Error,
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      mockJwtService.verifyAsync.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
      });
      mockUsersService.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });
      mockJwtService.signAsync.mockReturnValueOnce('newAccessToken');
      mockJwtService.signAsync.mockReturnValueOnce('newRefreshToken');

      const result = await service.refreshTokens('validToken');

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if found by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser({
        id: 1,
        email: 'test@example.com',
      });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('passwordResetRequest', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.passwordResetRequest('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should generate reset token and send email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockUsersService.setPasswordResetTokenAndSendEmail.mockResolvedValue(
        mockUser,
      );

      await service.passwordResetRequest('test@example.com');

      expect(
        mockUsersService.setPasswordResetTokenAndSendEmail,
      ).toHaveBeenCalledWith(mockUser.email);
    });
  });

  describe('passwordReset', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verifyAsync.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.passwordReset('invalidToken', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token type is not password-reset', async () => {
      mockJwtService.verifyAsync.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
        type: 'wrong-type',
      });

      await expect(
        service.passwordReset('invalidToken', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockJwtService.verifyAsync.mockReturnValue({
        sub: 999,
        email: 'test@example.com',
        type: 'password-reset',
      });
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.passwordReset('validToken', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update user password if token is valid', async () => {
      mockJwtService.verifyAsync.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
        type: 'password-reset',
      });
      mockUsersService.resetPassword.mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.passwordReset('validToken', 'newPassword');

      expect(mockUsersService.resetPassword).toHaveBeenCalledWith(
        'validToken',
        'hashedPassword',
      );
    });
  });

  describe('emailConfirmation', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verifyAsync.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.emailConfirmation('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token type is not email-confirmation', async () => {
      mockJwtService.verifyAsync.mockReturnValue({
        sub: 1,
        email: 'test@example.com',
        type: 'wrong-type',
      });

      await expect(service.emailConfirmation('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockJwtService.verifyAsync.mockReturnValue({
        sub: 999,
        email: 'test@example.com',
        type: 'email-confirmation',
      });
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.emailConfirmation('validToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should confirm user email if token is valid', async () => {
      mockUsersService.confirmUserEmail.mockResolvedValue(true);
      await service.emailConfirmation('validToken');

      expect(mockUsersService.confirmUserEmail).toHaveBeenCalledWith(
        'validToken',
      );
    });
  });
});
