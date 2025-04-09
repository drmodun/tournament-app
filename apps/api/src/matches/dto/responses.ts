import { ApiProperty } from '@nestjs/swagger';
import { MiniRosterDto, RosterDto } from '../../roster/dto/responses';

export class BracketParticipantDto {
  @ApiProperty({
    description: 'Unique identifier for the participant (roster ID)',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the participant (team or user name)',
    example: 'Team Alpha',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: "URL to the participant's logo",
    example: 'https://example.com/logos/team-alpha.png',
    readOnly: true,
    nullable: true,
  })
  logo?: string;

  @ApiProperty({
    description: 'Whether this participant won their match',
    example: true,
    readOnly: true,
  })
  isWinner: boolean;

  @ApiProperty({
    description: 'Text representation of the match score',
    example: '2-1',
    readOnly: true,
    nullable: true,
  })
  resultText?: string;

  @ApiProperty({
    description: 'Current status of the participant in the tournament',
    example: 'ACTIVE',
    readOnly: true,
    nullable: true,
  })
  status?: string;

  @ApiProperty({
    description: 'Total number of wins in the tournament',
    example: 3,
    readOnly: true,
  })
  wins: number;
}

export class BracketMatchDto {
  @ApiProperty({
    description: 'Unique identifier for the match',
    example: 'match_123',
    readOnly: true,
  })
  id: string;

  @ApiProperty({
    description: 'Name of the match',
    example: 'Quarterfinal 1',
    readOnly: true,
    nullable: true,
  })
  name?: string;

  @ApiProperty({
    description: 'ID of the next match in the bracket (parent matchup)',
    example: 'match_124',
    readOnly: true,
    nullable: true,
  })
  nextMatchId?: string;

  @ApiProperty({
    description: 'Text representation of the tournament round',
    example: 'Quarterfinals',
    readOnly: true,
  })
  tournamentRoundText: string;

  @ApiProperty({
    description: 'Scheduled start time of the match',
    example: '2023-07-01T14:00:00Z',
    readOnly: true,
  })
  startTime: string;

  @ApiProperty({
    description: 'Current state of the match',
    example: 'SCHEDULED',
    readOnly: true,
    enum: ['SCHEDULED', 'ACTIVE', 'DONE'],
  })
  state: 'SCHEDULED' | 'ACTIVE' | 'DONE';

  @ApiProperty({
    description: 'List of participants in the match',
    type: [BracketParticipantDto],
    readOnly: true,
  })
  participants: BracketParticipantDto[];
}

export class BracketDataResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the stage',
    example: 456,
    readOnly: true,
  })
  stageId: number;

  @ApiProperty({
    description: 'Name of the stage',
    example: 'Playoffs',
    readOnly: true,
  })
  stageName: string;

  @ApiProperty({
    description: 'Type of the stage',
    example: 'SINGLE_ELIMINATION',
    readOnly: true,
  })
  stageType: string;

  @ApiProperty({
    description: 'Unique identifier for the tournament',
    example: 789,
    readOnly: true,
  })
  tournamentId: number;

  @ApiProperty({
    description: 'List of matches in the bracket',
    type: [BracketMatchDto],
    readOnly: true,
  })
  matches: BracketMatchDto[];
}

export class ReactBracketsTeamDto {
  @ApiProperty({
    description: 'Unique identifier for the team',
    example: 123,
    readOnly: true,
    nullable: true,
  })
  id?: number;

  @ApiProperty({
    description: 'Name of the team',
    example: 'Team Alpha',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'Score of the team in the match',
    example: '2',
    readOnly: true,
    nullable: true,
  })
  score?: string;
}

export class ReactBracketsSeedDto {
  @ApiProperty({
    description: 'Unique identifier for the seed/match',
    example: 'seed_123',
    readOnly: true,
  })
  id: string | number;

  @ApiProperty({
    description: 'Date of the match',
    example: '2023-07-01',
    readOnly: true,
  })
  date: string;

  @ApiProperty({
    description: 'Teams participating in the match',
    type: [ReactBracketsTeamDto],
    readOnly: true,
  })
  teams: [ReactBracketsTeamDto, ReactBracketsTeamDto];

  @ApiProperty({
    description: 'ID of the winning team',
    example: 123,
    readOnly: true,
    nullable: true,
  })
  winner?: number;

  @ApiProperty({
    description: 'Score of the match',
    example: '2-1',
    readOnly: true,
    nullable: true,
  })
  score?: string;
}

export class ReactBracketsRoundDto {
  @ApiProperty({
    description: 'Title of the round',
    example: 'Quarterfinals',
    readOnly: true,
  })
  title: string;

  @ApiProperty({
    description: 'List of seeds/matches in the round',
    type: [ReactBracketsSeedDto],
    readOnly: true,
  })
  seeds: ReactBracketsSeedDto[];
}

export class ReactBracketsResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the stage',
    example: 456,
    readOnly: true,
  })
  stageId: number;

  @ApiProperty({
    description: 'Name of the stage',
    example: 'Playoffs',
    readOnly: true,
  })
  stageName: string;

  @ApiProperty({
    description: 'List of rounds in the tournament',
    type: [ReactBracketsRoundDto],
    readOnly: true,
  })
  rounds: ReactBracketsRoundDto[];
}

export class ScoreResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the matchup',
    example: 123,
    readOnly: true,
  })
  matchupId: number;

  @ApiProperty({
    description: 'Round number in the tournament',
    example: 1,
    readOnly: true,
  })
  roundNumber: number;

  @ApiProperty({
    description: 'Number of points scored',
    example: 2,
    readOnly: true,
  })
  points: number;

  @ApiProperty({
    description: 'Whether this score represents a winning team',
    example: true,
    readOnly: true,
  })
  isWinner: boolean;
}

export class MatchupResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the matchup',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Unique identifier for the stage',
    example: 456,
    readOnly: true,
  })
  stageId: number;

  @ApiProperty({
    description: 'Round number in the tournament',
    example: 1,
    readOnly: true,
  })
  round: number;

  @ApiProperty({
    description: 'Type of the matchup',
    example: 'SINGLE_ELIMINATION',
    readOnly: true,
  })
  matchupType: string;

  @ApiProperty({
    description: 'Start date and time of the matchup',
    example: '2023-07-01T14:00:00Z',
    readOnly: true,
  })
  startDate: Date;

  @ApiProperty({
    description: 'Whether the matchup has been completed',
    example: false,
    readOnly: true,
  })
  isFinished: boolean;
}

export class MatchupResponseWithChallongeIdDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'Challonge ID of the matchup',
    example: '123456789',
    readOnly: true,
  })
  challongeId: string;
}

export class MatchupResponseWithRostersDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'List of rosters participating in the matchup',
    type: [RosterDto],
    readOnly: true,
  })
  rosters: RosterDto[];
}

export class MatchupsWithMiniRostersResponseDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'List of mini rosters participating in the matchup',
    type: [MiniRosterDto],
    readOnly: true,
  })
  rosters: MiniRosterDto[];
}

export class ResultsResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the result',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Unique identifier for the matchup',
    example: 456,
    readOnly: true,
  })
  matchupId: number;

  @ApiProperty({
    description: 'Score achieved',
    example: 2,
    readOnly: true,
  })
  score: number;

  @ApiProperty({
    description: 'Whether this result represents a winning team',
    example: true,
    readOnly: true,
  })
  isWinner: boolean;

  @ApiProperty({
    description: 'Roster associated with this result',
    type: MiniRosterDto,
    readOnly: true,
  })
  roster: MiniRosterDto;
}

export class ResultsResponseWithScoresDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'List of scores for the matchup',
    type: [ScoreResponseDto],
    readOnly: true,
  })
  scores: ScoreResponseDto[];

  @ApiProperty({
    description: 'List of rosters in the matchup',
    type: [RosterDto],
    readOnly: true,
  })
  rosters: RosterDto[];
}

export class MatchupResponseWithResultsDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'List of results for the matchup',
    type: [ResultsResponseDto],
    readOnly: true,
  })
  results: ResultsResponseDto[];
}

export class MatchupResponseWithResultsAndScoresDto extends MatchupResponseDto {
  @ApiProperty({
    description: 'List of results with scores for the matchup',
    type: [ResultsResponseWithScoresDto],
    readOnly: true,
  })
  results: ResultsResponseWithScoresDto[];
}
