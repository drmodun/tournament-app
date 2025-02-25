import { BadRequestException, Injectable } from '@nestjs/common';
import { GroupDrizzleRepository } from '../group.repository';

@Injectable()
export class GroupInterestsService {
  constructor(private readonly groupRepository: GroupDrizzleRepository) {}

  async checkIfInterestExists(groupId: number, categoryId: number) {
    return await this.groupRepository.checkIfGroupInterestExists(
      groupId,
      categoryId,
    );
  }

  async createGroupInterest(groupId: number, categoryId: number) {
    const interestExists = await this.checkIfInterestExists(
      groupId,
      categoryId,
    );

    if (interestExists) {
      throw new BadRequestException('Group interest already exists');
    }

    const interest = await this.groupRepository.createGroupInterest(
      groupId,
      categoryId,
    );
    return interest;
  }

  async deleteGroupInterest(groupId: number, categoryId: number) {
    const interestExists = await this.checkIfInterestExists(
      groupId,
      categoryId,
    );

    if (!interestExists) {
      throw new BadRequestException('Group interest does not exist');
    }

    await this.groupRepository.deleteGroupInterest(groupId, categoryId);
  }

  async getGroupInterests(groupId: number, page: number, pageSize: number) {
    return await this.groupRepository.getGroupInterests(
      groupId,
      page,
      pageSize,
    );
  }
}
