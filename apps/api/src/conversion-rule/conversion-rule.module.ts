import { Module } from '@nestjs/common';
import { MatchesModule } from 'src/matches/matches.module';
import { ParticipationModule } from 'src/participation/participation.module';
import { ConversionRuleController } from './conversion-rule.controller';
import { ConversionRuleDrizzleRepository } from './conversion-rule.repository';
import { ConversionRuleService } from './conversion-rule.service';

@Module({
  imports: [MatchesModule, ParticipationModule],
  controllers: [ConversionRuleController],
  providers: [ConversionRuleService, ConversionRuleDrizzleRepository],
})
export class ConversionRuleModule {}
