import { EventEmitter2 } from '@nestjs/event-emitter';
import { notificationTypeEnum } from '@tournament-app/types';

const listen = jest.fn();
const notify = jest.fn();

jest.mock('src/db/db', () => ({
  pgClient: {
    listen: (...args: unknown[]) => listen(...args),
    notify: (...args: unknown[]) => notify(...args),
  },
}));

import { NOTIFICATION_CHANNEL, NotificationBus } from '../notification-bus';

describe('NotificationBus', () => {
  const notification = {
    type: notificationTypeEnum.TOURNAMENT_START,
    message: 'Started',
    image: null,
  };
  let emitter: EventEmitter2;
  let bus: NotificationBus;

  beforeEach(() => {
    jest.clearAllMocks();
    emitter = new EventEmitter2();
    jest.spyOn(emitter, 'emit');
    bus = new NotificationBus(emitter);
  });

  it('publishes through Postgres once it is listening', async () => {
    listen.mockResolvedValue({ unlisten: jest.fn() });
    await bus.onModuleInit();

    await bus.publish(7, notification);

    expect(listen).toHaveBeenCalledWith(
      NOTIFICATION_CHANNEL,
      expect.any(Function),
    );
    expect(notify).toHaveBeenCalledWith(
      NOTIFICATION_CHANNEL,
      JSON.stringify({ userId: 7, notification }),
    );
    expect(emitter.emit).not.toHaveBeenCalled();
  });

  it('hands notifications from any instance to the local streams', async () => {
    let onMessage: (payload: string) => void = () => undefined;
    listen.mockImplementation(async (_channel, callback) => {
      onMessage = callback;
      return { unlisten: jest.fn() };
    });
    await bus.onModuleInit();

    onMessage(JSON.stringify({ userId: 7, notification }));

    expect(emitter.emit).toHaveBeenCalledWith('7', notification);
  });

  it('falls back to local delivery when listening fails', async () => {
    listen.mockRejectedValue(new Error('no connection'));
    jest.spyOn(bus['logger'], 'error').mockImplementation();
    await bus.onModuleInit();

    await bus.publish(7, notification);

    expect(notify).not.toHaveBeenCalled();
    expect(emitter.emit).toHaveBeenCalledWith('7', notification);
  });

  it('ignores malformed messages', () => {
    jest.spyOn(bus['logger'], 'error').mockImplementation();

    expect(() => bus.deliverLocally('not json')).not.toThrow();
    expect(emitter.emit).not.toHaveBeenCalled();
  });
});
