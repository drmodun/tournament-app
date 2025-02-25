import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDrizzleRepository } from 'src/users/user.repository';

@Injectable()
export class InterestService {
  constructor(private readonly userRepository: UserDrizzleRepository) {}

  async createInterest(categoryId: number, userId: number) {
    const interestExists = await this.checkIfInterestExists(categoryId, userId);

    if (interestExists) {
      throw new BadRequestException('Interest already exists');
    }

    const interest = await this.userRepository.createInterest(
      categoryId,
      userId,
    );
    return interest;
  }

  async deleteInterest(categoryId: number, userId: number) {
    const interestExists = await this.checkIfInterestExists(categoryId, userId);

    if (!interestExists) {
      throw new BadRequestException('Interest does not exist');
    }

    await this.userRepository.deleteInterest(categoryId, userId);
  }

  async getInterestCategories(userId: number, page: number, pageSize: number) {
    return await this.userRepository.getInterestCategories(
      userId,
      page,
      pageSize,
    );
  }

  async checkIfInterestExists(categoryId: number, userId: number) {
    return await this.userRepository.checkIfInterestExists(categoryId, userId);
  }
}
