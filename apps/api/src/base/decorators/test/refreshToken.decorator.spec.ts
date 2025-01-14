import { ExecutionContext } from '@nestjs/common';
import { refreshTokenExtractor } from '../refreshToken.decorator';

describe('RefreshToken', () => {
  it('should return refreshToken from request', () => {
    const refreshToken = 'token';
    const request = { user: { refreshToken } };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(refreshTokenExtractor(null, ctx)).toEqual(refreshToken);
  });

  it('should return null if user is not present in request', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    expect(refreshTokenExtractor(null, ctx)).toEqual(null);
  });
});
