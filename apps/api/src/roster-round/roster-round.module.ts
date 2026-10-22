import { Module } from '@nestjs/common';
import { RosterRoundController } from './roster-round.controller';
import { RosterRoundDrizzleRepository } from './roster-round.repository';
import { RosterRoundService } from './roster-round.service';

@Module({
  controllers: [RosterRoundController],
  providers: [RosterRoundService, RosterRoundDrizzleRepository],
})
export class RosterRoundModule {}
