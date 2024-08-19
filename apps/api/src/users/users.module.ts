import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleRepository } from './repository';
import { TestingModule } from '@nestjs/testing';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleRepository],
  imports: [UserDrizzleRepository, TestingModule],
})
export class UsersModule {}
