import { ApiProperty } from '@nestjs/swagger';
import { MiniRosterDto, RosterDto } from '../../roster/dto/responses';

export class BracketParticipantDto {
  @ApiProperty({ description: 'Participant ID (roster ID)' })
  id: number;

  @ApiProperty({ description: 'Participant name (team or user name)' })
  name: string;

  @ApiProperty({ description: 'Participant logo URL', required: false })
  logo?: string;

  @ApiProperty({ description: 'Whether this participant is the winner' })
  isWinner: boolean;

  @ApiProperty({ description: 'Score text to display', required: false })
  resultText?: string;

  @ApiProperty({ description: 'Participant status', required: false })
  status?: string;

  @ApiProperty({ description: 'Number of wins in the tournament' })
  wins: number;
}

export class BracketMatchDto {
  @ApiProperty({ description: 'Match ID' })
  id: string;

  @ApiProperty({ description: 'Match name' })
  name?: string;

  @ApiProperty({
    description: 'Next match ID (parent matchup)',
    required: false,
  })
  nextMatchId?: string;

  @ApiProperty({ description: 'Tournament round text' })
  tournamentRoundText: string;

  @ApiProperty({ description: 'Match start time' })
  startTime: string;

  @ApiProperty({ description: 'Match state (SCHEDULED, ACTIVE, DONE)' })
  state: 'SCHEDULED' | 'ACTIVE' | 'DONE';

  @ApiProperty({
    description: 'Match participants',
    type: [BracketParticipantDto],
  })
  participants: BracketParticipantDto[];
}

export class BracketDataResponseDto {
  @ApiProperty({ description: 'Stage ID' })
  stageId: number;

  @ApiProperty({ description: 'Stage name' })
  stageName: string;

  @ApiProperty({ description: 'Stage type' })
  stageType: string;

  @ApiProperty({ description: 'Tournament ID' })
  tournamentId: number;

  @ApiProperty({
    description: 'Matches in the bracket',
    type: [BracketMatchDto],
  })
  matches: BracketMatchDto[];
}

export class ReactBracketsTeamDto {
  @ApiProperty({ description: 'Team ID' })
  id?: number;

  @ApiProperty({ description: 'Team name' })
  name: string;

  @ApiProperty({
    description: 'Team score (e.g., "2" for 2 wins)',
    required: false,
  })
  score?: string;
}

export class ReactBracketsSeedDto {
  @ApiProperty({ description: 'Seed/Match ID' })
  id: string | number;

  @ApiProperty({ description: 'Match date' })
  date: string;

  @ApiProperty({
    description: 'Teams in the match',
    type: [ReactBracketsTeamDto],
  })
  teams: [ReactBracketsTeamDto, ReactBracketsTeamDto];

  @ApiProperty({ description: 'Winner team ID', required: false })
  winner?: number;

  @ApiProperty({ description: 'Match score (e.g., "2-1")', required: false })
  score?: string;
}

export class ReactBracketsRoundDto {
  @ApiProperty({ description: 'Round title' })
  title: string;

  @ApiProperty({
    description: 'Seeds/Matches in the round',
    type: [ReactBracketsSeedDto],
  })
  seeds: ReactBracketsSeedDto[];
}

export class ReactBracketsResponseDto {
  @ApiProperty({ description: 'Stage ID' })
  stageId: number;

  @ApiProperty({ description: 'Stage name' })
  stageName: string;

  @ApiProperty({
    description: 'Tournament rounds',
    type: [ReactBracketsRoundDto],
  })
  rounds: ReactBracketsRoundDto[];
}

export class ScoreResponseDto {
  @ApiProperty({ description: 'The ID of the matchup' })
  matchupId: number;

  @ApiProperty({ description: 'The round number' })
  roundNumber: number;

  @ApiProperty({ description: 'The number of points scored' })
  points: number;

  @ApiProperty({ description: 'Whether this score represents a winner' })
  isWinner: boolean;
}

export class MatchupResponseDto {
  @ApiProperty({ description: 'The ID of the matchup' })
  id: number;

  @ApiProperty({ description: 'The ID of the stage' })
  stageId: number;

  @ApiProperty({ description: 'The round number' })
  round: number;

  @ApiProperty({ description: 'The type of matchup' })
  matchupType: string;

  @ApiProperty({ description: 'The start date of the matchup' })
  startDate: Date;

  @ApiProperty({ description: 'Whether the matchup is finished' })
  isFinished: boolean;
}

export class MatchupResponseWithChallongeIdDto extends MatchupResponseDto {
  @ApiProperty({ description: 'The Challonge ID of the matchup' })
  challongeId: string;
}

export class MatchupResponseWithRostersDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'The rosters participating in this matchup',
    type: [RosterDto],
  })
  rosters: RosterDto[];
}

export class MatchupsWithMiniRostersResponseDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'The mini rosters participating in this matchup',
    type: [MiniRosterDto],
  })
  rosters: MiniRosterDto[];
}

export class ResultsResponseDto {
  @ApiProperty({ description: 'The ID of the result' })
  id: number;

  @ApiProperty({ description: 'The ID of the matchup' })
  matchupId: number;

  @ApiProperty({ description: 'The score' })
  score: number;

  @ApiProperty({ description: 'Whether this result represents a winner' })
  isWinner: boolean;

  @ApiProperty({
    description: 'The roster associated with this result',
    type: MiniRosterDto,
  })
  roster: MiniRosterDto;
}

export class ResultsResponseWithScoresDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'The scores for this matchup',
    type: [ScoreResponseDto],
  })
  scores: ScoreResponseDto[];
}

export class MatchupResponseWithResultsDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'The results for this matchup',
    type: [ResultsResponseDto],
  })
  results: ResultsResponseDto[];
}

export class MatchupResponseWithResultsAndScoresDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'The results with scores for this matchup',
    type: [ResultsResponseWithScoresDto],
  })
  results: ResultsResponseWithScoresDto[];

  @ApiProperty({
    description: 'The rosters participating in this matchup',
    type: [RosterDto],
  })
  rosters: RosterDto[];
}
