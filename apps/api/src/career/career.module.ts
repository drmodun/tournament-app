import { Module } from '@nestjs/common';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [CareerController],
  providers: [CareerService],
  exports: [CareerService],
  imports: [UsersModule],
})
export class CareerModule {}
