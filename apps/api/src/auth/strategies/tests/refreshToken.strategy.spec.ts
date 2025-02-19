import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenStrategy } from '../refreshToken.strategy';
import { Request } from 'express';

describe('RefreshTokenStrategy', () => {
  let strategy: RefreshTokenStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenStrategy],
    }).compile();

    strategy = module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return payload with refresh token', () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('Bearer token123'),
      } as unknown as Request;

      const mockPayload = { sub: 1, email: 'test@example.com' };

      const result = strategy.validate(mockRequest, mockPayload);

      expect(result).toEqual({
        ...mockPayload,
        refreshToken: 'token123',
      });
      expect(mockRequest.get).toHaveBeenCalledWith('Authorization');
    });

    it('should handle malformed Authorization header', () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('malformed-token'),
      } as unknown as Request;

      const mockPayload = { sub: 1, email: 'test@example.com' };

      const result = strategy.validate(mockRequest, mockPayload);

      expect(result).toEqual({
        ...mockPayload,
        refreshToken: 'malformed-token',
      });
    });
  });
});
