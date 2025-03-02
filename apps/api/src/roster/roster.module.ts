import { Module } from '@nestjs/common';
import { RosterService } from './roster.service';
import { RosterController } from './roster.controller';
import { RosterDrizzleRepository } from './roster.repository';
import { GroupModule } from 'src/group/group.module';
import { ParticipationModule } from 'src/participation/participation.module';
import { UsersModule } from 'src/users/users.module';
import { CareerModule } from 'src/career/career.module';
import { StageModule } from 'src/stage/stage.module';
import { TournamentModule } from 'src/tournament/tournament.module';
@Module({
  controllers: [RosterController],
  providers: [RosterService, RosterDrizzleRepository],
  exports: [RosterService, RosterDrizzleRepository],
  imports: [
    UsersModule,
    GroupModule,
    ParticipationModule,
    CareerModule,
    StageModule,
    TournamentModule,
  ],
})
export class RosterModule {}
