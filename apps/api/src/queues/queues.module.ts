import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { StageStatusProcessor } from './stage-status.processor';
import { StageStatusService } from './stage-status.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'stage-status',
    }),
  ],
  providers: [StageStatusProcessor, StageStatusService],
  exports: [StageStatusService],
})
export class QueuesModule {}
