import { ForbiddenException } from '@nestjs/common';
import { tournamentTeamTypeEnum } from '^tournament-app/types';

export class TeamTypeExtractor {
  public static getTeamTypeFromUrl(
    originalUrl: string,
  ): tournamentTeamTypeEnum {
    if (originalUrl.includes('/apply-solo')) {
      return tournamentTeamTypeEnum.SOLO;
    }
    if (originalUrl.includes('/apply-group')) {
      return tournamentTeamTypeEnum.TEAM;
    }
    throw new ForbiddenException('Invalid team type URL');
  }
}
