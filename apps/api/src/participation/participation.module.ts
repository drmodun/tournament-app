import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { UsersModule } from 'src/users/users.module';
import { GroupModule } from 'src/group/group.module';
import { ParticipationDrizzleRepository } from './participation.repository';
import { TournamentModule } from 'src/tournament/tournament.module';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService, ParticipationDrizzleRepository],
  imports: [UsersModule, GroupModule, TournamentModule, GroupMembershipModule],
})
export class ParticipationModule {}
