import { Injectable } from '@nestjs/common';
import { LFGDrizzleRepository } from './lfg.repository';
import { UpdateLFGRequest } from './dto/requests';
import { CreateLFGRequest } from './dto/requests';
@Injectable()
export class LfgService {
  constructor(private readonly lfgRepository: LFGDrizzleRepository) {}

  async create(lfg: CreateLFGRequest, userId: number) {
    await this.lfgRepository.createWithCareer(lfg, userId);
  } // No point in returning single ids here, user will only getAll the values

  async update(id: number, lfg: UpdateLFGRequest, userId: number) {
    await this.lfgRepository.updateWithCareer(id, lfg, userId);
  }

  async delete(id: number, userId: number) {
    await this.lfgRepository.deleteLFG(id, userId);
  }

  async findMyLfg(userId: number) {
    return await this.lfgRepository.getForPlayer(userId);
  }

  async findPlayers(groupId: number) {
    return await this.lfgRepository.getPlayers(groupId);
  }
}
