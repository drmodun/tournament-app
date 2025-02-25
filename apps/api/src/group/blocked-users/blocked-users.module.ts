import { Module } from '@nestjs/common';
import { BlockedUsersController } from './blocked-users.controller';
import { UsersModule } from 'src/users/users.module';
import { BlockedUsersService } from './blocked-users.service';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupAdminGuard } from '../guards/group-admin.guard';
import { GroupModule } from '../group.module';

@Module({
  controllers: [BlockedUsersController],
  providers: [BlockedUsersService, UserDrizzleRepository, GroupAdminGuard],
  imports: [UsersModule, GroupModule],
})
export class BlockedUsersModule {}
