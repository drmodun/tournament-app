import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TournamentDrizzleRepository } from './tournament.repository';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';

@Module({
  controllers: [TournamentController],
  imports: [GroupMembershipModule],
  providers: [TournamentService, TournamentDrizzleRepository],
  exports: [TournamentService, TournamentDrizzleRepository],
})
export class TournamentModule {}
