import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchesDrizzleRepository } from './matches.repository';
import { ChallongeModule } from '../challonge/challonge.module';

@Module({
  imports: [ChallongeModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesDrizzleRepository],
  exports: [MatchesService],
})
export class MatchesModule {}
