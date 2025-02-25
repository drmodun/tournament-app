import { Injectable } from '@nestjs/common';
import { CreateLfgDto } from './dto/create-lfg.dto';
import { UpdateLfgDto } from './dto/update-lfg.dto';

@Injectable()
export class LfgService {
  create(createLfgDto: CreateLfgDto) {
    return 'This action adds a new lfg';
  }

  findAll() {
    return `This action returns all lfg`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lfg`;
  }

  update(id: number, updateLfgDto: UpdateLfgDto) {
    return `This action updates a #${id} lfg`;
  }

  remove(id: number) {
    return `This action removes a #${id} lfg`;
  }
}
