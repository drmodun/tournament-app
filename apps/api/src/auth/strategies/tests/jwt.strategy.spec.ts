import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { userRoleEnum } from '@tournament-app/types';
import { AccessTokenStrategy } from '../accessToken.strategy';
import { UserDrizzleRepository } from 'src/users/user.repository';

describe('AccessTokenStrategy', () => {
  let jwtStrategy: AccessTokenStrategy;

  jest.mock('@nestjs/passport', () => ({
    PassportStrategy: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, AccessTokenStrategy, UserDrizzleRepository],
    }).compile();

    jwtStrategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);

    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return validated user when user exists', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'USER' };
      const authUser = {
        id: 1,
        email: 'test@example.com',
        role: userRoleEnum.USER,
      } satisfies ValidatedUserDto;

      jest.spyOn(UsersService.prototype, 'findOne').mockResolvedValue(authUser);

      const result = await jwtStrategy.validate(payload);

      expect(UsersService.prototype.findOne).toHaveBeenCalledWith(1, 'auth');
      expect(result).toEqual(authUser);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'USER' };
      jest.spyOn(UsersService.prototype, 'findOne').mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(UsersService.prototype.findOne).toHaveBeenCalledWith(1, 'auth');
    });
  });
});
