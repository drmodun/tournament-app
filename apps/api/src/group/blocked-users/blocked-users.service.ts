import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDrizzleRepository } from 'src/users/user.repository';

@Injectable()
export class BlockedUsersService {
  constructor(private readonly userRepository: UserDrizzleRepository) {}

  async checkIfUserIsBlocked(groupId: number, userId: number) {
    const results = await this.userRepository.checkIfUserIsBlocked(
      groupId,
      userId,
    );
    return results;
  }

  async blockUser(groupId: number, userId: number) {
    const isBlocked = await this.checkIfUserIsBlocked(groupId, userId);

    if (isBlocked) {
      throw new BadRequestException('User is already blocked from this group');
    }

    await this.userRepository.blockUser(groupId, userId);
  }

  async unblockUser(groupId: number, userId: number) {
    const isBlocked = await this.checkIfUserIsBlocked(groupId, userId);

    if (!isBlocked) {
      throw new BadRequestException('User is not blocked from this group');
    }

    await this.userRepository.unblockUser(groupId, userId);
  }

  async getBlockedUsers(groupId: number, page: number, pageSize: number) {
    const results = await this.userRepository.getBlockedUsers(
      groupId,
      page,
      pageSize,
    );

    return results;
  }
}
