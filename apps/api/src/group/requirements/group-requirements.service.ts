import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupRequirementsRepository } from './group-requirements.repository';
import {
  ICreateGroupRequirementsRequest,
  IUpdateGroupRequirementsRequest,
} from '@tournament-app/types';

@Injectable()
export class GroupRequirementsService {
  constructor(
    private readonly groupRequirementsRepository: GroupRequirementsRepository,
  ) {}

  async createRequirements(
    groupId: number,
    data: ICreateGroupRequirementsRequest,
  ) {
    return await this.groupRequirementsRepository.createRequirements(
      groupId,
      data,
    );
  }

  async updateRequirements(
    groupId: number,
    data: IUpdateGroupRequirementsRequest,
  ) {
    const requirements =
      await this.groupRequirementsRepository.getRequirementsWithElo(groupId);
    if (!requirements) {
      throw new NotFoundException('Group requirements not found');
    }
    return this.groupRequirementsRepository.updateRequirements(groupId, data);
  }

  async getRequirements(groupId: number) {
    const requirements =
      await this.groupRequirementsRepository.getRequirementsWithElo(groupId);
    if (!requirements) {
      throw new NotFoundException('Group requirements not found');
    }
    return requirements;
  }

  async deleteRequirements(groupId: number) {
    const requirements =
      await this.groupRequirementsRepository.deleteRequirements(groupId);

    if (!requirements) {
      throw new NotFoundException('Group requirements not found');
    }
    return requirements;
  }
}
