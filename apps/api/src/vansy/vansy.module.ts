import { Module } from '@nestjs/common';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { StageAdminGuard } from 'src/stage/guards/stage-admin.guard';
import { StageModule } from 'src/stage/stage.module';
import { TournamentModule } from 'src/tournament/tournament.module';
import { VansyClient } from './vansy.client';
import { VANSY_CONFIG, readVansyConfig } from './vansy.config';
import { VansyController, VansyWebhookController } from './vansy.controller';
import { VansyRepository } from './vansy.repository';
import { VansyService } from './vansy.service';

@Module({
  imports: [StageModule, TournamentModule, GroupMembershipModule],
  controllers: [VansyController, VansyWebhookController],
  providers: [
    { provide: VANSY_CONFIG, useFactory: () => readVansyConfig() },
    VansyClient,
    VansyRepository,
    VansyService,
    StageAdminGuard,
  ],
  exports: [VansyService, VansyRepository],
})
export class VansyModule {}
