import { Test, TestingModule } from '@nestjs/testing';
import { SseNotificationsGateway } from './sse-notifications.gateway';
import { SseNotificationsService } from './sse-notifications.service';

describe('SseNotificationsGateway', () => {
  let gateway: SseNotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SseNotificationsGateway, SseNotificationsService],
    }).compile();

    gateway = module.get<SseNotificationsGateway>(SseNotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
