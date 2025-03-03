import { Module } from '@nestjs/common';
import { ChallongeService } from './challonge.service';
import { ChallongeController } from './challonge.controller';

@Module({
  controllers: [ChallongeController],
  providers: [ChallongeService],
})
export class ChallongeModule {}
