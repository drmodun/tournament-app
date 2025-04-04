import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Put,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CanEditMatchupGuard } from './guards/can-edit-matchup.guard';
import { EndMatchupRequestDto, QueryMatchupRequestDto } from './dto/requests';
import {
  ApiParam,
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  MatchupResponseWithResultsDto,
  MatchupResponseWithResultsAndScoresDto,
  ResultsResponseDto,
  ScoreResponseDto,
} from './dto/responses';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiExtraModels(
    MatchupResponseWithResultsDto,
    MatchupResponseWithResultsAndScoresDto,
    ResultsResponseDto,
    ScoreResponseDto,
  )
  @Post('/:matchupId/score')
  @UseGuards(JwtAuthGuard, CanEditMatchupGuard)
  @ApiBearerAuth()
  async createScore(
    @Param('matchupId', ParseIntPipe) matchupId: number,
    @Body() createScoreDto: EndMatchupRequestDto,
  ) {
    return await this.matchesService.createMatchScore(
      matchupId,
      createScoreDto,
    );
  }

  @Put('/:matchupId/update-score')
  @UseGuards(JwtAuthGuard, CanEditMatchupGuard)
  @ApiBearerAuth()
  async updateScore(
    @Param('matchupId', ParseIntPipe) matchupId: number,
    @Body() updateScoreDto: EndMatchupRequestDto,
  ) {
    return await this.matchesService.updateMatchScore(
      matchupId,
      updateScoreDto,
    );
  }

  @Delete('/:matchupId/delete-score')
  @UseGuards(JwtAuthGuard, CanEditMatchupGuard)
  @ApiBearerAuth()
  async deleteMatchScore(@Param('matchupId', ParseIntPipe) matchupId: number) {
    return await this.matchesService.deleteMatchScore(matchupId);
  }

  @Get('results')
  @ApiOkResponse({
    description: 'Returns matchups with results',
    type: [MatchupResponseWithResultsDto],
  })
  async getMatchupsWithResults(@Query() query: QueryMatchupRequestDto) {
    return await this.matchesService.getMatchupsWithResults(query);
  }

  @Get('matchup/:matchupId/results')
  @ApiOkResponse({
    description: 'Returns a matchup with results and scores',
    type: MatchupResponseWithResultsAndScoresDto,
  })
  async getMatchupWithResultsAndScores(
    @Param('matchupId', ParseIntPipe) matchupId: number,
  ) {
    return await this.matchesService.getMatchupWithResultsAndScores(matchupId);
  } //TODO: check as any assertions

  @Get('user/:userId/results')
  @ApiOkResponse({
    description: 'Returns matchups with results for a user',
    type: [MatchupResponseWithResultsDto],
  })
  async getResultsForUser(@Param('userId', ParseIntPipe) userId: number) {
    return await this.matchesService.getResultsForUser(userId);
  }

  @Get('roster/:rosterId/results')
  @ApiParam({ name: 'rosterId', description: 'Roster ID' })
  @ApiOkResponse({
    description: 'Returns matchups with results for a roster',
    type: [MatchupResponseWithResultsDto],
  })
  async getResultsForRoster(@Param('rosterId', ParseIntPipe) rosterId: number) {
    return await this.matchesService.getResultsForRoster(rosterId);
  }

  @Get('managed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Returns matchups that a user is managing',
    type: [MatchupResponseWithResultsDto],
  })
  async getManagedMatchups(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: PaginationOnly,
  ) {
    return await this.matchesService.getManagedMatchups(user.id, query);
  }

  @Get('group/:groupId/results')
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiOkResponse({
    description: 'Returns matchups with results for a group',
    type: [MatchupResponseWithResultsDto],
  })
  async getResultsForGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.matchesService.getResultsForGroup(groupId);
  }
}
