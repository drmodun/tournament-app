import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { db } from '../db';
import { stage } from '../db/schema';
import { and, eq, gt } from 'drizzle-orm';

@Injectable()
export class StageStatusService implements OnModuleInit {
  constructor(
    @InjectQueue('stage-status') private stageStatusQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule all upcoming stages
    await this.scheduleAllStages();
  }

  async scheduleAllStages() {
    const now = new Date();
    
    // Get all upcoming stages
    const stages = await db.query.stage.findMany({
      where: and(
        eq(stage.stageStatus, 'upcoming'),
        gt(stage.startDate, now)
      ),
    });

    // Schedule status updates for each stage
    for (const stage of stages) {
      // Schedule transition to 'ongoing'
      await this.scheduleStatusUpdate({
        stageId: stage.id,
        newStatus: 'ongoing',
        scheduledDate: stage.startDate,
      });

      // Schedule transition to 'finished' if endDate exists
      if (stage.endDate) {
        await this.scheduleStatusUpdate({
          stageId: stage.id,
          newStatus: 'finished',
          scheduledDate: stage.endDate,
        });
      }
    }
  }

  async scheduleStatusUpdate({
    stageId,
    newStatus,
    scheduledDate,
  }: {
    stageId: number;
    newStatus: 'ongoing' | 'finished';
    scheduledDate: Date;
  }) {
    const jobId = `stage-${stageId}-${newStatus}`;
    
    // Remove any existing job with this ID
    await this.stageStatusQueue.remove(jobId);
    
    // Schedule the new job
    await this.stageStatusQueue.add(
      'update-stage-status',
      { stageId, newStatus },
      {
        jobId,
        delay: scheduledDate.getTime() - Date.now(),
        removeOnComplete: true,
      }
    );
  }

  // Call this when a new stage is created
  async scheduleNewStage(stageId: number, startDate: Date, endDate?: Date) {
    await this.scheduleStatusUpdate({
      stageId,
      newStatus: 'ongoing',
      scheduledDate: startDate,
    });

    if (endDate) {
      await this.scheduleStatusUpdate({
        stageId,
        newStatus: 'finished',
        scheduledDate: endDate,
      });
    }
  }
}
