import { Injectable, NotFoundException } from '@nestjs/common';
import { LFPDrizzleRepository } from './lfp.repository';
import { CreateLFPDto, LFPQueryDto, UpdateLFPDto } from './dto/requests';

@Injectable()
export class LFPService {
  constructor(private readonly lfpRepository: LFPDrizzleRepository) {}

  async createLFP(createDto: CreateLFPDto, groupId: number) {
    const lfp = await this.lfpRepository.createEntity({
      ...createDto,
      groupId,
    });

    return lfp?.[0];
  }

  async updateLFP(id: number, groupId: number, updateDto: UpdateLFPDto) {
    await this.checkLFPBelongsToGroup(id, groupId);

    const result = await this.lfpRepository.updateEntity(id, updateDto);

    return result?.[0];
  }

  async getForGroup(groupId: number) {
    return await this.lfpRepository.getQuery({
      groupId,
      responseType: 'mini',
    });
  }

  async getGroups(userId: number, query: LFPQueryDto) {
    return await this.lfpRepository.getGroups(userId, query);
  }

  async deleteLFP(id: number, groupId: number) {
    await this.checkLFPBelongsToGroup(id, groupId);

    return this.lfpRepository.deleteLFP(id);
  }

  // The route guard only proves the caller administers groupId, so the post must belong to that group
  private async checkLFPBelongsToGroup(id: number, groupId: number) {
    const lfp = await this.lfpRepository.getSingleQuery(id, 'mini');

    if (!(lfp?.length > 0) || lfp[0].groupId !== groupId) {
      throw new NotFoundException('LFP not found');
    }
  }
}
