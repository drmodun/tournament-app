import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleQueryManager } from './queryManager';
import { TestingModule } from '@nestjs/testing';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleQueryManager],
  imports: [UserDrizzleQueryManager, TestingModule],
})
export class UsersModule {}
