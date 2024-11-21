import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../accessToken.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { userRole } from 'src/db/schema';
import { userRoleEnum } from '@tournament-app/types';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get<UsersService>(UsersService);
  });

  describe('validate', () => {
    it('should return validated user when user exists', async () => {
      const payload = { id: 1 };
      const authUser = {
        id: 1,
        email: 'test@example.com',
        role: userRoleEnum.USER,
      } satisfies ValidatedUserDto;

      jest.spyOn(userService, 'findOne').mockResolvedValue(authUser);

      const result = await jwtStrategy.validate(payload);

      expect(userService.findOne).toHaveBeenCalledWith(1, 'ValidatedUserDto');
      expect(result).toEqual(authUser);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload = { id: 1 };
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findOne).toHaveBeenCalledWith(1, 'ValidatedUserDto');
    });
  });
});
