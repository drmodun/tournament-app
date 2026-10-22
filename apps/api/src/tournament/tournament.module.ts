import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TournamentDrizzleRepository } from './tournament.repository';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { ConditionalAdminGuard } from './guards/conditional-admin.guard';
import { TournamentAdminGuard } from './guards/tournament-admin.guard';
import { SubcategoryModule } from 'src/subcategory/subcategory.module';

@Module({
  controllers: [TournamentController],
  imports: [GroupMembershipModule, SubcategoryModule],
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
