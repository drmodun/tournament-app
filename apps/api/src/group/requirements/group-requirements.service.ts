import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupRequirementsRepository } from './group-requirements.repository';
import {
  BASE_ELO,
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

  // Throws when the user does not meet the group's requirements; groups without requirements accept anyone
  async checkUserMeetsRequirements(groupId: number, userId: number) {
    const requirements =
      await this.groupRequirementsRepository.getRequirementsWithElo(groupId);

    if (!requirements) {
      return;
    }

    const subject =
      await this.groupRequirementsRepository.getRequirementSubject(userId);

    if (!subject) {
      throw new NotFoundException('User not found');
    }

    if (requirements.isSameCountry) {
      const groupCountry =
        await this.groupRequirementsRepository.getGroupCountry(groupId);

      if (!groupCountry || subject.country !== groupCountry) {
        throw new ForbiddenException(
          'This group only accepts players from its own country',
        );
      }
    }

    if (
      requirements.minimumAge != null &&
      subject.age < requirements.minimumAge
    ) {
      throw new ForbiddenException(
        `This group requires players to be at least ${requirements.minimumAge}`,
      );
    }

    if (
      requirements.maximumAge != null &&
      subject.age > requirements.maximumAge
    ) {
      throw new ForbiddenException(
        `This group requires players to be at most ${requirements.maximumAge}`,
      );
    }

    for (const eloRequirement of requirements.eloRequirements) {
      // A player without a rating in the category starts at the base rating
      const elo =
        subject.careers.find((c) => c.categoryId === eloRequirement.categoryId)
          ?.elo ?? BASE_ELO;

      const isTooLow =
        eloRequirement.minimumElo != null && elo < eloRequirement.minimumElo;
      const isTooHigh =
        eloRequirement.maximumElo != null && elo > eloRequirement.maximumElo;

      if (isTooLow || isTooHigh) {
        throw new ForbiddenException(
          `Your rating in ${eloRequirement.category?.name ?? 'a required category'} does not meet this group's requirements`,
        );
      }
    }
  }
}
