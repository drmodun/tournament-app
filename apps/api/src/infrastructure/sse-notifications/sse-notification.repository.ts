import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  ColumnBaseConfig,
  ColumnDataType,
  desc,
  eq,
  InferSelectModel,
  SQL,
} from 'drizzle-orm';
import { notification } from 'src/db/schema';
import { PrimaryRepository } from 'src/base/repository/primaryRepository';
import { NotificationQueryDto } from './dto/requests';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';

@Injectable()
export class SseNotificationRepository extends PrimaryRepository<
  typeof notification,
  NotificationQueryDto,
  Partial<InferSelectModel<typeof notification>>
> {
  constructor() {
    super(notification);
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
    read: notification.read,
    createdAt: notification.createdAt,
  };

  public getMappingObject(responseType: string) {
    switch (responseType) {
      case 'base':
        return {
          id: notification.id,
          userId: notification.userId,
          message: notification.message,
          link: notification.link,
          image: notification.image,
          type: notification.type,
          createdAt: notification.createdAt,
          read: notification.read,
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
          return eq(notification.userId, +parsed);
        case 'type':
          return eq(notification.type, parsed);
        case 'isRead':
          return eq(notification.read, parsed);
        default:
          return;
      }
    });
  }

  async getReadTimeSorted(
    query: NotificationQueryDto,
  ): Promise<Partial<InferSelectModel<typeof notification>>[]> {
    return db
      .select(this.getMappingObject('base'))
      .from(notification)
      .where(and(...this.getValidWhereClause(query)))
      .orderBy(
        query.order === 'desc'
          ? asc(notification.read)
          : desc(notification.read),
        query.order === 'desc'
          ? desc(notification.createdAt)
          : asc(notification.createdAt),
      )
      .offset((query.page - 1) * (query.pageSize || 24))
      .limit(query.pageSize || 24)
      .$dynamic();
  }
}
