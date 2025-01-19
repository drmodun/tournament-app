import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { StageDrizzleRepository } from './stage.repository';

@Module({
  controllers: [StageController],
  providers: [StageService, StageDrizzleRepository],
})
export class StageModule {}
