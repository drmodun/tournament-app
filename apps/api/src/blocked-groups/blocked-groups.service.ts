import { BadRequestException, Injectable } from '@nestjs/common';
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
}
