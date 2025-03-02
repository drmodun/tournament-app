import { Injectable } from '@nestjs/common';
import { ICareerUserResponse } from '@tournament-app/types';
import { UserDrizzleRepository } from 'src/users/user.repository';

@Injectable()
export class CareerService {
  constructor(private readonly userRepository: UserDrizzleRepository) {}

  async getMultipleCareers(
    userIds: number[],
    categoryId,
  ): Promise<ICareerUserResponse[]> {
    return await this.userRepository.getMultipleCareers(userIds, categoryId);
  }
}
