import { forwardRef, Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchesDrizzleRepository } from './matches.repository';
import { ChallongeModule } from '../challonge/challonge.module';
import { RosterModule } from '../roster/roster.module';
@Module({
  imports: [ChallongeModule, forwardRef(() => RosterModule)],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesDrizzleRepository],
  exports: [MatchesService],
})
export class MatchesModule {}
