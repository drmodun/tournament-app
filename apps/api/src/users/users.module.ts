import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleQueryManager } from './drizzle';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleQueryManager],
})
export class UsersModule {}
