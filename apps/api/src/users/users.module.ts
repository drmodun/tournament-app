import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleRepository } from './user.repository';
import { EmailModule } from 'src/infrastructure/email/email.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleRepository],
  exports: [UsersService, UserDrizzleRepository],
  imports: [EmailModule],
})
export class UsersModule {}
