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
  ApiOperation,
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
  @ApiOperation({
    summary: 'Creates a score for a specific matchup.',
  })
  @ApiOkResponse({
    description: 'Creates a score for a specific matchup.',
    type: MatchupResponseWithResultsDto,
  })
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
  @ApiOperation({
    summary: 'Updates the score for a specific matchup.',
  })
  @ApiOkResponse({
    description: 'Updates the score for a specific matchup.',
    type: MatchupResponseWithResultsDto,
  })
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
  @ApiOperation({
    summary: 'Deletes the score for a specific matchup.',
  })
  @ApiOkResponse({
    description: 'Deletes the score for a specific matchup.',
    type: MatchupResponseWithResultsDto,
  })
  async deleteMatchScore(@Param('matchupId', ParseIntPipe) matchupId: number) {
    return await this.matchesService.deleteMatchScore(matchupId);
  }

  @Get('results')
  @ApiOperation({
    summary: 'Retrieves matchups with results based on the query parameters.',
  })
  @ApiOkResponse({
    description:
      'Retrieves matchups with results based on the query parameters.',
    type: [MatchupResponseWithResultsDto],
  })
  async getMatchupsWithResults(@Query() query: QueryMatchupRequestDto) {
    return await this.matchesService.getMatchupsWithResults(query);
  }

  @Get('matchup/:matchupId/results')
  @ApiOkResponse({
    description: 'Retrieves a specific matchup with its results and scores.',
    type: MatchupResponseWithResultsAndScoresDto,
  })
  async getMatchupWithResultsAndScores(
    @Param('matchupId', ParseIntPipe) matchupId: number,
  ) {
    return await this.matchesService.getMatchupWithResultsAndScores(matchupId);
  }

  @Get('user/:userId/results')
  @ApiOkResponse({
    description: 'Retrieves matchups with results for a specific user.',
    type: [MatchupResponseWithResultsDto],
  })
  async getResultsForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PaginationOnly,
  ) {
    return await this.matchesService.getResultsForUser(userId, query);
  }

  @Get('roster/:rosterId/results')
  @ApiOperation({
    summary: 'Retrieves matchups with results for a specific roster.',
  })
  @ApiParam({ name: 'rosterId', description: 'Roster ID' })
  @ApiOkResponse({
    description: 'Retrieves matchups with results for a specific roster.',
    type: [MatchupResponseWithResultsDto],
  })
  async getResultsForRoster(
    @Param('rosterId', ParseIntPipe) rosterId: number,
    @Query() query: PaginationOnly,
  ) {
    return await this.matchesService.getResultsForRoster(rosterId, query);
  }

  @Get('managed')
  @ApiOperation({
    summary: 'Retrieves matchups that the current user is managing.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Retrieves matchups that the current user is managing.',
    type: [MatchupResponseWithResultsDto],
  })
  async getManagedMatchups(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: QueryMatchupRequestDto,
  ) {
    return await this.matchesService.getManagedMatchups(user.id, query);
  }

  @Get('group/:groupId/results')
  @ApiOperation({
    summary: 'Retrieves matchups with results for a specific group.',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiOkResponse({
    description: 'Retrieves matchups with results for a specific group.',
    type: [MatchupResponseWithResultsDto],
  })
  async getResultsForGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: PaginationOnly,
  ) {
    return await this.matchesService.getResultsForGroup(groupId, query);
  }
}
