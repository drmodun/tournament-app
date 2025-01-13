import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentService {
  create(createTournamentDto: CreateTournamentDto) {
    return 'This action adds a new tournament';
  }

  findAll() {
    return `This action returns all tournament`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tournament`;
  }

  update(id: number, updateTournamentDto: UpdateTournamentDto) {
    return `This action updates a #${id} tournament`;
  }

  remove(id: number) {
    return `This action removes a #${id} tournament`;
  }
}
