import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CanEditMatchupGuard } from '../guards/can-edit-matchup.guard';
import { MatchesService } from '../matches.service';

describe('CanEditMatchupGuard', () => {
  let guard: CanEditMatchupGuard;
  let matchesService: jest.Mocked<MatchesService>;

  beforeEach(async () => {
    const mockMatchesService = {
      canUserEditMatchup: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanEditMatchupGuard,
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
      ],
    }).compile();

    guard = module.get<CanEditMatchupGuard>(CanEditMatchupGuard);
    matchesService = module.get(MatchesService) as jest.Mocked<MatchesService>;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when user can edit the matchup', async () => {
      // Arrange
      const matchupId = 1;
      const userId = 5;
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { matchupId: matchupId.toString() },
            user: { id: userId },
          }),
        }),
      } as unknown as ExecutionContext;

      matchesService.canUserEditMatchup.mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(matchesService.canUserEditMatchup).toHaveBeenCalledWith(
        matchupId,
        userId,
      );
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user cannot edit the matchup', async () => {
      // Arrange
      const matchupId = 1;
      const userId = 5;
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { matchupId: matchupId.toString() },
            user: { id: userId },
          }),
        }),
      } as unknown as ExecutionContext;

      matchesService.canUserEditMatchup.mockResolvedValue(false);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(matchesService.canUserEditMatchup).toHaveBeenCalledWith(
        matchupId,
        userId,
      );
    });

    it('should properly parse numeric matchupId', async () => {
      // Arrange
      const matchupId = '123';
      const userId = 5;
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { matchupId },
            user: { id: userId },
          }),
        }),
      } as unknown as ExecutionContext;

      matchesService.canUserEditMatchup.mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(matchesService.canUserEditMatchup).toHaveBeenCalledWith(
        123,
        userId,
      );
      expect(result).toBe(true);
    });

    it('should handle missing user information', async () => {
      // Arrange
      const matchupId = 1;
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { matchupId: matchupId.toString() },
            user: null,
          }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('should handle missing matchupId parameter', async () => {
      // Arrange
      const userId = 5;
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: {},
            user: { id: userId },
          }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });
  });
});
