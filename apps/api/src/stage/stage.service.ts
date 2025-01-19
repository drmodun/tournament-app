import { Injectable } from '@nestjs/common';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Injectable()
export class StageService {
  create(createStageDto: CreateStageDto) {
    return 'This action adds a new stage';
  }

  findAll() {
    return `This action returns all stage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stage`;
  }

  update(id: number, updateStageDto: UpdateStageDto) {
    return `This action updates a #${id} stage`;
  }

  remove(id: number) {
    return `This action removes a #${id} stage`;
  }
}
