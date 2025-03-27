import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  ColumnBaseConfig,
  ColumnDataType,
  desc,
  eq,
  inArray,
  InferSelectModel,
  SQL,
} from 'drizzle-orm';
import { notification, notificationToUser } from 'src/db/schema';
import { PrimaryRepository } from 'src/base/repository/primaryRepository';
import { NotificationQueryDto } from './dto/requests';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import { NotificationCreateDto } from '../types';

@Injectable()
export class SseNotificationRepository extends PrimaryRepository<
  typeof notification,
  NotificationQueryDto,
  Partial<InferSelectModel<typeof notification>>
> {
  constructor() {
    super(notification);
  }

  createWithUsers(
    createDto: NotificationCreateDto,
    userIds: number[],
  ): Promise<void> {
    const action = db.transaction(async (trx) => {
      const notificationId = await trx
        .insert(notification)
        .values(createDto)
        .returning();

      await trx.insert(notificationToUser).values(
        userIds.map((userId) => ({
          notificationId: notificationId[0].id,
          userId,
        })),
      );
    });

    return action;
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    return query;
  }

  public sortRecord: Record<
    string,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {
    read: notificationToUser.read,
    createdAt: notification.createdAt,
  };

  public getMappingObject(responseType: string) {
    switch (responseType) {
      case 'base':
        return {
          id: notification.id,
          message: notification.message,
          link: notification.link,
          image: notification.image,
          type: notification.type,
          createdAt: notification.createdAt,
        };
      default:
        return this.getMappingObject('base');
    }
  }

  getValidWhereClause(query: NotificationQueryDto): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = notification[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'userId':
          return eq(notificationToUser.userId, +parsed);
        case 'type':
          return eq(notification.type, parsed);
        case 'isRead':
          return eq(notificationToUser.read, parsed);
        default:
          return;
      }
    });
  }

  async updateToRead(id: number) {
    await db
      .update(notificationToUser)
      .set({
        read: true,
      })
      .where(eq(notificationToUser.notificationId, id));
  }

  async updateAllToReadForUser(userId: number) {
    await db
      .update(notificationToUser)
      .set({
        read: true,
      })
      .where(eq(notificationToUser.userId, userId));
  }

  async updateBulkToRead(ids: number[]) {
    await db
      .update(notificationToUser)
      .set({
        read: true,
      })
      .where(inArray(notificationToUser.notificationId, ids));
  }

  async getReadTimeSorted(query: NotificationQueryDto): Promise<
    {
      notification: Partial<InferSelectModel<typeof notification>>;
      isRead: boolean;
    }[]
  > {
    return db
      .select({
        notification: this.getMappingObject('base'),
        isRead: notificationToUser.read,
      })
      .from(notification)
      .leftJoin(
        notificationToUser,
        eq(notification.id, notificationToUser.notificationId),
      )
      .where(and(...this.getValidWhereClause(query)))
      .orderBy(
        query.order === 'desc'
          ? asc(notificationToUser.read)
          : desc(notificationToUser.read),
        query.order === 'desc'
          ? desc(notificationToUser.createdAt)
          : asc(notificationToUser.createdAt),
      )
      .offset((query.page - 1) * (query.pageSize || 24))
      .limit(query.pageSize || 24)
      .$dynamic();
  }
}
