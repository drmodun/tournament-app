import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserDrizzleRepository } from './user.repository';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { BlobModule } from 'src/infrastructure/blob/blob.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserDrizzleRepository],
  exports: [UsersService, UserDrizzleRepository],
  imports: [EmailModule, BlobModule],
})
export class UsersModule {}
