import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationDrizzleRepository } from './location.repository';

@Module({
  controllers: [LocationController],
  providers: [LocationService, LocationDrizzleRepository],
})
export class LocationModule {}
