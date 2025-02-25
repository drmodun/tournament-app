import { Module } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { LfgController } from './lfg.controller';

@Module({
  controllers: [LfgController],
  providers: [LfgService],
})
export class LfgModule {}
