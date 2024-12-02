import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { BaseRepository } from '../base/repository/baseRepository';
import { GroupMembershipResponsesEnum } from '@tournament-app/types';
import { groupMemberships } from '../db/schema';
import { CompositeRepository } from 'src/base/repository/compositeRepository';
import { BaseQuery } from 'src/base/query/baseQuery';

@Injectable()
export class GroupMembershipDrizzleRepository extends CompositeRepository<
  typeof groupMemberships,
  BaseQuery,
  
  { groupId: number; userId: number }
> {
  constructor(drizzleService: DrizzleService) {
    super(groupMemberships, ['groupId', 'userId'], drizzleService);
  }
}
