import { Test, TestingModule } from '@nestjs/testing';
import { SseNotificationsService } from './sse-notifications.service';

describe('SseNotificationsService', () => {
  let service: SseNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SseNotificationsService],
    }).compile();

    service = module.get<SseNotificationsService>(SseNotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
