import { Module } from '@nestjs/common';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { UsersModule } from 'src/users/users.module';
import { CareerDrizzleRepository } from './career.repository';

@Module({
  controllers: [CareerController],
  providers: [CareerService, CareerDrizzleRepository],
  exports: [CareerService],
  imports: [UsersModule],
})
export class CareerModule {}
