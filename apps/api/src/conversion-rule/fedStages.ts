import { pointConversionStrategyEnum } from '@tournament-app/types';
import { and, AnyColumn, eq, exists, inArray, or } from 'drizzle-orm';
import { db } from 'src/db/db';
import { pointConversionRule } from 'src/db/schema';

// Strategies that give entries in a destination stage. A stage they feed gets its entrants from its rules,
// so solo players are not entered into it by themselves.
export const ENTRY_STRATEGIES: string[] = [
  pointConversionStrategyEnum.QUALIFICATION,
  pointConversionStrategyEnum.SEED,
  pointConversionStrategyEnum.HYBRID,
  pointConversionStrategyEnum.TIE_BREAKER,
  pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
];

/** Whether a stage_to_stage rule enters rosters into this stage. */
export const isFedByRules = (stageId: AnyColumn | number) =>
  exists(
    db
      .select({ id: pointConversionRule.id })
      .from(pointConversionRule)
      .where(
        and(
          eq(pointConversionRule.type, 'stage_to_stage'),
          inArray(pointConversionRule.strategy, ENTRY_STRATEGIES as never[]),
          or(
            eq(pointConversionRule.destination, stageId),
            eq(pointConversionRule.lastChanceDestination, stageId),
          ),
        ),
      ),
  );
