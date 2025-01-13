import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConditionalAdminGuard } from '../guards/conditional-admin.guard';
import { GroupAdminGuard } from '../../group/guards/group-admin.guard';

jest.mock('../../group/guards/group-admin.guard');

describe('ConditionalAdminGuard', () => {
  let guard: ConditionalAdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConditionalAdminGuard],
    }).compile();

    guard = module.get<ConditionalAdminGuard>(ConditionalAdminGuard);

    // Mock GroupAdminGuard's canActivate to return true by default
    (GroupAdminGuard.prototype.canActivate as jest.Mock).mockResolvedValue(
      true,
    );

    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    body: Record<string, any> = {},
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          body,
        }),
      }),
    } as ExecutionContext;
  };

  describe('when affiliatedGroupId is provided', () => {
    it('should check group admin permissions', async () => {
      const context = createMockExecutionContext({ affiliatedGroupId: 1 });

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(GroupAdminGuard.prototype.canActivate).toHaveBeenCalledWith(
        context,
      );
    });

    it('should deny access when group admin check fails', async () => {
      const context = createMockExecutionContext({ affiliatedGroupId: 1 });
      (GroupAdminGuard.prototype.canActivate as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await guard.canActivate(context);

      expect(result).toBeFalsy();
      expect(GroupAdminGuard.prototype.canActivate).toHaveBeenCalledWith(
        context,
      );
    });
  });

  describe('when affiliatedGroupId is not provided', () => {
    it('should allow access without group admin check', async () => {
      const context = createMockExecutionContext();

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(GroupAdminGuard.prototype.canActivate).not.toHaveBeenCalled();
    });

    it('should allow access with empty request body', async () => {
      const context = createMockExecutionContext({});

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(GroupAdminGuard.prototype.canActivate).not.toHaveBeenCalled();
    });

    it('should allow access with null affiliatedGroupId', async () => {
      const context = createMockExecutionContext({ affiliatedGroupId: null });

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(GroupAdminGuard.prototype.canActivate).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined request', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => undefined,
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(GroupAdminGuard.prototype.canActivate).not.toHaveBeenCalled();
    });

    it('should handle request without body', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(GroupAdminGuard.prototype.canActivate).not.toHaveBeenCalled();
    });
  });
});
