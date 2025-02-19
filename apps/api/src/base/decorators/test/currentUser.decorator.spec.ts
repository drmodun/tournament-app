import { ExecutionContext } from '@nestjs/common';
import { userExtractor } from '../currentUser.decorator';

describe('CurrentUser', () => {
  it('should return user from request', () => {
    const user = { id: 1, username: 'john_doe' };
    const request = { user };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(userExtractor(null, ctx)).toEqual(user);
  });

  it('should return null if user is not present in request', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    expect(userExtractor(null, ctx)).toEqual(undefined);
  });
});
