import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowerDrizzleRepository } from './followers.repository';
import { FollowerQuery } from './dto/request.dto';
import { FollowerResponse } from './dto/responses.dto';
import { FollowerResponsesEnum } from '@tournament-app/types';

@Injectable()
export class FollowersService {
  constructor(private readonly followerRepository: FollowerDrizzleRepository) {}

  async create(userId: number, followerId: number) {
    if (userId === followerId) {
      throw new NotFoundException('Cannot follow yourself');
    }

    await this.followerRepository.createEntity({
      userId,
      followerId,
    });
  }

  async findAll<TResponseType extends FollowerResponse = FollowerResponse>(
    query: FollowerQuery,
  ): Promise<TResponseType[]> {
    const results = await this.followerRepository.getQuery(query);
    return results as TResponseType[];
  }

  async findOne(userId: number, followerId: number): Promise<FollowerResponse> {
    const results = await this.followerRepository.getSingleQuery(
      {
        userId,
        followerId,
      },
      FollowerResponsesEnum.FOLLOWER_MINI,
    );

    if (results.length === 0) {
      throw new NotFoundException('Follower relationship not found');
    }

    return results[0] as FollowerResponse;
  }

  async remove(userId: number, followerId: number): Promise<void> {
    const exists = await this.entityExists(userId, followerId);
    if (!exists) {
      throw new NotFoundException('Follower relationship not found');
    }

    await this.followerRepository.deleteEntity({
      userId,
      followerId,
    });
  }

  async entityExists(userId: number, followerId: number): Promise<boolean> {
    const results = await this.followerRepository.getSingleQuery({
      userId,
      followerId,
    });

    return results.length > 0;
  }
}

//TODO: later add notifications for this kinda stuff
