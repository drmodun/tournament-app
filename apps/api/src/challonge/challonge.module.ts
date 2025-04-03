import { Module } from '@nestjs/common';
import { ChallongeService } from './challonge.service';
import { HttpModule } from '@nestjs/axios';
import { RosterDrizzleRepository } from 'src/roster/roster.repository';
@Module({
  imports: [HttpModule],
  providers: [ChallongeService, RosterDrizzleRepository],
  exports: [ChallongeService, RosterDrizzleRepository],
})
export class ChallongeModule {}
