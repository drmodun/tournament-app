import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { FollowerDrizzleRepository } from './followers.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [FollowersController],
  providers: [FollowersService, FollowerDrizzleRepository],
  exports: [FollowersService],
})
export class FollowersModule {}
