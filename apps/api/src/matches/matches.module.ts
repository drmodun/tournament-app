import { forwardRef, Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchesDrizzleRepository } from './matches.repository';
import { ChallongeModule } from '../challonge/challonge.module';
import { RosterModule } from '../roster/roster.module';
import { CareerModule } from '../career/career.module';
@Module({
  imports: [ChallongeModule, forwardRef(() => RosterModule), CareerModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesDrizzleRepository],
  exports: [MatchesService],
})
export class MatchesModule {}
