import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TournamentDrizzleRepository } from './tournament.repository';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { ConditionalAdminGuard } from './guards/conditional-admin.guard';
import { TournamentAdminGuard } from './guards/tournament-admin.guard';

@Module({
  controllers: [TournamentController],
  imports: [GroupMembershipModule],
  providers: [
    TournamentService,
    TournamentDrizzleRepository,
    ConditionalAdminGuard,
    TournamentAdminGuard,
  ],
  exports: [
    TournamentService,
    TournamentDrizzleRepository,
    ConditionalAdminGuard,
    TournamentAdminGuard,
  ],
})
export class TournamentModule {}
