import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { GroupDrizzleRepository } from 'src/group/group.repository';

@Injectable()
export class BlockedGroupsService {
  constructor(private readonly groupRepository: GroupDrizzleRepository) {}

  async checkIfGroupIsBlocked(userId: number, groupId: number) {
    const results = await this.groupRepository.checkIfGroupIsBlocked(
      userId,
      groupId,
    );
    return results;
  }

  async blockGroup(userId: number, groupId: number) {
    const isBlocked = await this.checkIfGroupIsBlocked(userId, groupId);

    if (isBlocked) {
      throw new BadRequestException('Group is already blocked');
    }

    await this.groupRepository.blockGroup(userId, groupId);
  }

  async unblockGroup(userId: number, groupId: number) {
    const isBlocked = await this.checkIfGroupIsBlocked(userId, groupId);

    if (!isBlocked) {
      throw new BadRequestException('Group is not blocked');
    }

    await this.groupRepository.unblockGroup(userId, groupId);
  }

  async getBlockedGroups(userId: number, page: number, pageSize: number) {
    const results = await this.groupRepository.getBlockedGroups(
      userId,
      page,
      pageSize,
    );

    return results;
  }

  async searchBlockedGroups(
    search: string,
    userId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return await this.groupRepository.searchBlockedGroups(search, userId, {
      pageSize,
      page,
    });
  }
}
