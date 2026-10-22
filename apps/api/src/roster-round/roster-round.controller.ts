import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IQueryMetadata } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { RosterRoundQuery } from './dto/requests.dto';
import { RosterRoundResponse } from './dto/responses.dto';
import { RosterRoundService } from './roster-round.service';

@ApiTags('roster-rounds')
@Controller('roster-rounds')
export class RosterRoundController {
  constructor(private readonly rosterRoundService: RosterRoundService) {}

  @Get()
  @ApiOkResponse({
    description:
      'How rosters did in each round of a stage, kept in step with matchup results. Needs stageId or rosterId.',
    type: [RosterRoundResponse],
  })
  async findAll(@Query() query: RosterRoundQuery, @Req() req: Request) {
    const results = await this.rosterRoundService.findAll(query);

    const metadata: IQueryMetadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      results,
      metadata,
    };
  }
}
