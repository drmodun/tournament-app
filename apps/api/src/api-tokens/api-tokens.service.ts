import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { notificationTypeEnum } from '@tournament-app/types';
import { SseNotificationsService } from 'src/infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from 'src/infrastructure/sse-notifications/templates';
import { TemplatesEnum } from 'src/infrastructure/types';
import {
  daysAgo,
  DEFAULT_EXPIRY_DAYS,
  expiryFrom,
  generateApiToken,
  hashApiToken,
  MAX_ACTIVE_TOKENS,
  normaliseScopes,
  USAGE_HISTORY_DAYS,
  usageDay,
} from './api-token';
import {
  ApiTokensRepository,
  RateLimitNoticeField,
} from './api-tokens.repository';
import { CreateApiTokenRequest } from './dto/requests.dto';

export type RateLimitEvent = 'warning' | 'reached';

const RATE_LIMIT_NOTICES: Record<
  RateLimitEvent,
  {
    field: RateLimitNoticeField;
    template: TemplatesEnum;
    type: notificationTypeEnum;
  }
> = {
  warning: {
    field: 'rateLimitWarnedAt',
    template: TemplatesEnum.API_TOKEN_RATE_LIMIT_WARNING,
    type: notificationTypeEnum.API_TOKEN_RATE_LIMIT_WARNING,
  },
  reached: {
    field: 'rateLimitReachedAt',
    template: TemplatesEnum.API_TOKEN_RATE_LIMIT_REACHED,
    type: notificationTypeEnum.API_TOKEN_RATE_LIMIT_REACHED,
  },
};
const RATE_LIMIT_NOTICE_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ApiTokensService {
  private readonly logger = new Logger(ApiTokensService.name);

  constructor(
    private readonly repository: ApiTokensRepository,
    private readonly notificationService: SseNotificationsService,
    private readonly notificationTemplatesFiller: NotificationTemplatesFiller,
  ) {}

  async create(userId: number, request: CreateApiTokenRequest) {
    const name = request.name.trim();
    if (!name) {
      throw new BadRequestException('name should not be empty');
    }

    const active = await this.repository.countActive(userId);
    if (active >= MAX_ACTIVE_TOKENS) {
      throw new BadRequestException(
        `You can have at most ${MAX_ACTIVE_TOKENS} active API tokens`,
      );
    }

    const { token, tokenHash, prefix } = generateApiToken();
    const created = await this.repository.create({
      userId,
      name,
      tokenHash,
      prefix,
      scopes: normaliseScopes(request.scopes),
      expiresAt: expiryFrom(
        new Date(),
        request.expiresInDays === undefined
          ? DEFAULT_EXPIRY_DAYS
          : request.expiresInDays,
      ),
    });

    // The only time the token itself leaves the API
    return { ...created, token };
  }

  async findAll(userId: number) {
    return await this.repository.findAllForUser(userId);
  }

  async revoke(userId: number, id: number) {
    const token = await this.findOwn(userId, id);
    if (token.revokedAt) {
      return token;
    }

    return await this.repository.revoke(id);
  }

  async revokeAll(userId: number) {
    return { revoked: await this.repository.revokeAllActive(userId) };
  }

  // Requests per day over the last USAGE_HISTORY_DAYS days, oldest first; days without requests
  // are left out
  async usage(userId: number, id: number) {
    await this.findOwn(userId, id);

    return await this.repository.usageSince(
      id,
      daysAgo(new Date(), USAGE_HISTORY_DAYS - 1),
    );
  }

  // The token a request presents, with the user it acts for
  async findByToken(token: string) {
    return await this.repository.findByHash(hashApiToken(token));
  }

  // Counts a request. It runs alongside the request, so a failure is only logged.
  async recordUse(tokenId: number, now = new Date()) {
    try {
      await this.repository.recordUse(tokenId, usageDay(now), now);
    } catch (error) {
      this.logger.error(`Could not record use of API token ${tokenId}`, error);
    }
  }

  // Tells the user that a token used 80% or all of its rate limit, at most once a day per token
  // and kind. Like recordUse it only logs failures.
  async notifyRateLimit(
    token: { id: number; userId: number; name: string },
    event: RateLimitEvent,
    { used, limit }: { used: number; limit: number },
    now = new Date(),
  ) {
    const notice = RATE_LIMIT_NOTICES[event];

    try {
      const claimed = await this.repository.claimRateLimitNotice(
        token.id,
        notice.field,
        now,
        new Date(now.getTime() - RATE_LIMIT_NOTICE_INTERVAL_MS),
      );
      if (!claimed) {
        return;
      }

      await this.notificationService.createWithUsers(
        {
          type: notice.type,
          message: this.notificationTemplatesFiller.fill(notice.template, {
            name: token.name,
            used: String(used),
            limit: String(limit),
          }),
          link: '/user',
        },
        [token.userId],
      );
    } catch (error) {
      this.logger.error(
        `Could not send the rate limit notice for API token ${token.id}`,
        error,
      );
    }
  }

  private async findOwn(userId: number, id: number) {
    const token = await this.repository.findOwn(userId, id);

    // Someone else's token is answered like a missing one
    if (!token) {
      throw new NotFoundException('API token not found');
    }

    return token;
  }
}
