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

  async updateLFP(id: number, updateDto: UpdateLFPDto) {
    const lfp = await this.lfpRepository.getSingleQuery(id, 'mini');

    if (!(lfp?.length > 0)) {
      throw new NotFoundException('LFP not found');
    }
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

  async deleteLFP(id: number) {
    const lfp = await this.lfpRepository.getSingleQuery(id, 'mini');

    if (!(lfp?.length > 0)) {
      throw new NotFoundException('LFP not found');
    }

    return this.lfpRepository.deleteLFP(id);
  }
}
