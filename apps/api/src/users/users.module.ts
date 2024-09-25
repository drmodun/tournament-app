import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleRepository } from './user.repository';
import { TestingModule } from '@nestjs/testing';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleRepository],
  imports: [TestingModule],
})
export class UsersModule {}
