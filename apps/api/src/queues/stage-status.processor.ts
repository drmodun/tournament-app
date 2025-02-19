import { Processor, WorkerHost, Job } from '@nestjs/bullmq';
import { db } from '../db';
import { stage } from '../db/schema';
import { eq } from 'drizzle-orm';

interface StageStatusUpdateJob {
  stageId: number;
  newStatus: 'ongoing' | 'finished';
}

@Processor('stage-status')
export class StageStatusProcessor extends WorkerHost {
  async process(job: Job<StageStatusUpdateJob>) {
    const { stageId, newStatus } = job.data;

    await db
      .update(stage)
      .set({ stageStatus: newStatus })
      .where(eq(stage.id, stageId));
  }
}
