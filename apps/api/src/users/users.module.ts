import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleRepository } from './user.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleRepository],
  exports: [UsersService, UserDrizzleRepository],
})
export class UsersModule {}
