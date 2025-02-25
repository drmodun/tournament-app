import { Module } from '@nestjs/common';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [InterestController],
  providers: [InterestService, UserDrizzleRepository],
  imports: [UsersModule],
})
export class InterestModule {}
