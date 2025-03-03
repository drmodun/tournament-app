import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CanEditMatchupGuard } from './guards/can-edit-matchup.guard';
import { EndMatchupRequestDto } from './dto/requests';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { BracketDataResponseDto } from './dto/responses';
import { ReactBracketsResponseDto } from './dto/responses';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post(':tournamentId/:matchupId/score')
  @UseGuards(JwtAuthGuard, CanEditMatchupGuard)
  @ApiOperation({ summary: 'Create a score for a matchup' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament ID' })
  @ApiParam({ name: 'matchupId', description: 'Matchup ID' })
  async createScore(
    @Param('matchupId', ParseIntPipe) matchupId: number,
    @Body() createScoreDto: EndMatchupRequestDto,
  ) {
    return this.matchesService.createMatchScore(matchupId, createScoreDto);
  }

  @Post(':tournamentId/:matchupId/update-score')
  @UseGuards(JwtAuthGuard, CanEditMatchupGuard)
  @ApiOperation({ summary: 'Update a score for a matchup' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament ID' })
  @ApiParam({ name: 'matchupId', description: 'Matchup ID' })
  async updateScore(
    @Param('matchupId', ParseIntPipe) matchupId: number,
    @Body() updateScoreDto: EndMatchupRequestDto,
  ) {
    return this.matchesService.updateMatchScore(matchupId, updateScoreDto);
  }

  @Delete(':tournamentId/:matchupId/delete-score')
  @UseGuards(JwtAuthGuard, CanEditMatchupGuard)
  @ApiOperation({ summary: 'Delete all scores for a matchup' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament ID' })
  @ApiParam({ name: 'matchupId', description: 'Matchup ID' })
  async deleteMatchScore(@Param('matchupId', ParseIntPipe) matchupId: number) {
    return this.matchesService.deleteMatchScore(matchupId);
  }

  @Get('stage/:stageId/bracket')
  @ApiOperation({ summary: 'Get bracket data for a stage' })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({
    status: 200,
    description:
      'Returns bracket data in the format required by @g-loot/react-tournament-brackets',
  })
  @ApiOkResponse({
    type: BracketDataResponseDto,
  })
  async getBracketDataForStage(
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.matchesService.getBracketDataForStage(stageId);
  }

  @Get('stage/:stageId/bracket/original')
  @ApiOperation({
    summary:
      'Get bracket data for a stage in original format (without Challonge data)',
  })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({
    status: 200,
    description:
      'Returns bracket data in the original format for @g-loot/react-tournament-brackets',
  })
  @ApiOkResponse({
    type: BracketDataResponseDto,
  })
  async getOriginalBracketDataForStage(
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.matchesService.getOriginalBracketDataForStage(stageId);
  }

  @Get('stage/:stageId/bracket/react')
  @ApiOperation({
    summary: 'Get bracket data for a stage in react-brackets format',
  })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({
    status: 200,
    description:
      'Returns bracket data in the format required by react-brackets library',
  })
  @ApiOkResponse({
    type: ReactBracketsResponseDto,
  })
  async getReactBracketDataForStage(
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.matchesService.getReactBracketDataForStage(stageId);
  }

  @Get('stage/:stageId/bracket/challonge')
  @ApiOperation({
    summary: 'Get bracket data directly from Challonge',
  })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns bracket data from Challonge in react-brackets format',
  })
  @ApiOkResponse({
    type: ReactBracketsResponseDto,
  })
  async getChallongeBracketData(
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.matchesService.getChallongeBracketData(stageId);
  }
}
