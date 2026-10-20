import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { pgClient } from 'src/db/db';
import { NotificationCreateDto } from '../types';

export const NOTIFICATION_CHANNEL = 'notifications';

interface BusMessage {
  userId: number;
  notification: NotificationCreateDto;
}

/**
 * Delivers live notifications to every API instance through Postgres LISTEN/NOTIFY. Each instance
 * listens on one channel and hands what arrives to its own SSE streams, so a user gets a
 * notification whichever instance their stream is connected to. If listening fails, delivery
 * falls back to this instance only.
 */
@Injectable()
export class NotificationBus implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationBus.name);
  private subscription: { unlisten: () => Promise<void> } | null = null;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    try {
      this.subscription = await pgClient.listen(
        NOTIFICATION_CHANNEL,
        (payload) => this.deliverLocally(payload),
      );
    } catch (error) {
      this.logger.error(
        'Could not listen for notifications; live delivery is limited to this instance',
        error,
      );
    }
  }

  async onModuleDestroy() {
    await this.subscription?.unlisten().catch(() => undefined);
  }

  get isListening() {
    return this.subscription !== null;
  }

  async publish(userId: number, notification: NotificationCreateDto) {
    if (!this.isListening) {
      this.eventEmitter.emit(userId.toString(), notification);
      return;
    }

    const message: BusMessage = { userId, notification };
    await pgClient.notify(NOTIFICATION_CHANNEL, JSON.stringify(message));
  }

  deliverLocally(payload: string) {
    try {
      const { userId, notification } = JSON.parse(payload) as BusMessage;
      this.eventEmitter.emit(userId.toString(), notification);
    } catch (error) {
      this.logger.error('Ignoring a malformed notification message', error);
    }
  }
}
