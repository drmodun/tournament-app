import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './infrastructure/email/email.module';
import { BlobModule } from './infrastructure/blob/blob.module';

@Module({
  imports: [UsersModule, EmailModule, BlobModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
