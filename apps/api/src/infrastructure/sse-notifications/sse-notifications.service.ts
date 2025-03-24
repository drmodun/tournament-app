import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, Subject, interval } from 'rxjs';
import { db } from 'src/db/db';
import { notification } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SseNotificationsService {
  private notificationSubjects: Map<number, Subject<MessageEvent>> = new Map();

  create(dto: CreateSseNotificationDto) {
    return 'This action adds a new sseNotification';
  }

  findAll() {
    return `This action returns all sseNotifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sseNotification`;
  }

  update(id: number, dto: UpdateSseNotificationDto) {
    return `This action updates a #${id} sseNotification`;
  }

  remove(id: number) {
    return `This action removes a #${id} sseNotification`;
  }

  /**
   * Validates the token and returns a stream of notifications for the user
   * @param token Authentication token for the user
   * @returns Observable of notification events
   */
  getNotificationStream(token: string): Observable<MessageEvent> {
    // Here you would validate the token and get the userId
    // This is a placeholder implementation - replace with your actual token validation
    const userId = this.validateTokenAndGetUserId(token);
    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    // Create a new subject for this user if it doesn't exist
    if (!this.notificationSubjects.has(userId)) {
      const subject = new Subject<MessageEvent<NotificationResponseDto>>();
      this.notificationSubjects.set(userId, subject);

      // Set up polling for new notifications
      this.setupNotificationPolling(userId, subject);
    }

    return this.notificationSubjects.get(userId)!.asObservable();
  }

  /**
   * Validates the token and returns the associated user ID
   * @param token Authentication token
   * @returns User ID if token is valid, null otherwise
   */
  private validateTokenAndGetUserId(token: string): number | null {
    // This is a placeholder - implement your actual token validation logic
    // For example, you might verify a JWT token and extract the user ID
    try {
      // Placeholder: In a real implementation, you would decode and verify the token
      // For now, let's assume the token is the userId for simplicity
      const userId = parseInt(token, 10);
      return isNaN(userId) ? null : userId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sets up polling for new notifications for a specific user
   * @param userId User ID to poll notifications for
   * @param subject Subject to emit notifications to
   */
  private setupNotificationPolling(
    userId: number,
    subject: Subject<MessageEvent>,
  ): void {
    // Poll for new notifications every 5 seconds
    interval(5000).subscribe(async () => {
      try {
        // Get the user's notifications from the database
        const notifications = await db
          .select()
          .from(notification)
          .where(eq(notification.userId, userId))
          .orderBy(notification.createdAt);

        // Emit each notification as an event
        for (const notif of notifications) {
          const notificationDto: NotificationResponseDto = {
            id: notif.id,
            userId: notif.userId,
            message: notif.message,
            link: notif.link,
            image: notif.image,
            type: notif.type,
            createdAt: notif.createdAt,
            read: notif.read,
          };

          subject.next({
            data: notificationDto,
            type: 'notification',
            lastEventId: notif.id.toString(),
          } as MessageEvent);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  /**
   * Sends a notification to a specific user
   * @param userId User ID to send the notification to
   * @param notification Notification to send
   */
  async sendNotification(
    userId: number,
    notificationData: Partial<NotificationResponseDto>,
  ): Promise<void> {
    // Insert the notification into the database with all required fields
    const [insertedNotification] = await db
      .insert(notification)
      .values({
        userId,
        message: notificationData.message || '',
        type: notificationData.type || 'system',
        // Optional fields
        ...(notificationData.link ? { link: notificationData.link } : {}),
        ...(notificationData.image ? { image: notificationData.image } : {}),
        read: false,
      })
      .returning();

    // If the user has an active SSE connection, send the notification
    if (this.notificationSubjects.has(userId)) {
      const subject = this.notificationSubjects.get(userId)!;
      const notificationDto: NotificationResponseDto = {
        id: insertedNotification.id,
        userId: insertedNotification.userId,
        message: insertedNotification.message,
        link: insertedNotification.link,
        image: insertedNotification.image,
        type: insertedNotification.type,
        createdAt: insertedNotification.createdAt,
        read: insertedNotification.read,
      };

      subject.next({
        data: notificationDto,
        type: 'notification',
        lastEventId: insertedNotification.id.toString(),
      } as MessageEvent);
    }
  }
}
