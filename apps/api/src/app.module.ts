import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './infrastructure/email/email.module';
import { EmailModule } from './infrastructure/email/email.module';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
