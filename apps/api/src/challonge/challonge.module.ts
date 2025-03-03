import { Module } from '@nestjs/common';
import { ChallongeService } from './challonge.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ChallongeService],
  exports: [ChallongeService],
})
export class ChallongeModule {}
