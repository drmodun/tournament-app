import { Module } from '@nestjs/common';
import { SseNotificationsModule } from 'src/infrastructure/sse-notifications/sse-notifications.module';
import { ApiTokenRateLimiter } from './api-token-rate-limiter';
import { ApiTokensController } from './api-tokens.controller';
import { ApiTokensRepository } from './api-tokens.repository';
import { ApiTokensService } from './api-tokens.service';

@Module({
  imports: [SseNotificationsModule],
  controllers: [ApiTokensController],
  providers: [
    ApiTokensService,
    ApiTokensRepository,
    // One counter per process for every request
    { provide: ApiTokenRateLimiter, useValue: new ApiTokenRateLimiter() },
  ],
  exports: [ApiTokensService, ApiTokenRateLimiter],
})
export class ApiTokensModule {}
