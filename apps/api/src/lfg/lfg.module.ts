import { Module } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { LfgController } from './lfg.controller';
import { LFGDrizzleRepository } from './lfg.repository';
import { GroupModule } from 'src/group/group.module';
import { CategoryModule } from 'src/category/category.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [LfgController],
  providers: [LfgService, LFGDrizzleRepository],
  imports: [GroupModule, UsersModule, CategoryModule],
})
export class LfgModule {}
