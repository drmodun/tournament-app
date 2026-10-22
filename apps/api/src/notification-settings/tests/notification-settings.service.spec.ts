import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationSettingsService } from '../notification-settings.service';
import { NotificationSettingsRepository } from '../notification-settings.repository';

describe('NotificationSettingsService', () => {
  let service: NotificationSettingsService;
  let repository: jest.Mocked<NotificationSettingsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingsService,
        {
          provide: NotificationSettingsRepository,
          useValue: {
            getOrCreateSettings: jest.fn(),
            upsertSettings: jest.fn(),
            getUsersWithoutInApp: jest.fn(),
            getTokens: jest.fn(),
            upsertToken: jest.fn(),
            deleteToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationSettingsService);
    repository = module.get(NotificationSettingsRepository);
  });

  it('drops users who turned in-app notifications off', async () => {
    repository.getUsersWithoutInApp.mockResolvedValue([2, 4]);

    await expect(service.filterInAppRecipients([1, 2, 3, 4])).resolves.toEqual([
      1, 3,
    ]);
  });

  it('keeps everybody when nobody opted out', async () => {
    repository.getUsersWithoutInApp.mockResolvedValue([]);

    await expect(service.filterInAppRecipients([1, 2])).resolves.toEqual([
      1, 2,
    ]);
  });

  it('throws NotFoundException when removing a token the user does not have', async () => {
    repository.deleteToken.mockResolvedValue([]);

    await expect(service.removeToken(1, 5)).rejects.toThrow(NotFoundException);
  });
});
