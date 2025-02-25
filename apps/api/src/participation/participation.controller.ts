import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParticipationService } from './participation.service';
import { QueryParticipationDto } from './dto/requests.dto';
import {
  ExtendedParticipationResponse,
  MiniParticipationResponse,
  ParticipationResponse,
} from './dto/responses.dto';
import {
  IQueryMetadata,
  ParticipationResponsesEnum,
} from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { TournamentAdminGuard } from 'src/tournament/guards/tournament-admin.guard';
import { DoubleParticipationGuard } from './guards/double-participation.guard';
import { PublicTournamentParticipationGuard } from './guards/public-tournament-participation.guard';
import { TeamTypeTournamentParticipationGuard } from './guards/team-type-tournament-participation.guard';
import { TournamentIsFakePlayersAllowedGuard } from './guards/tournament-fake-participation.guard';
import { TournamentMaximumParticipantsGuard } from './guards/tournament-max-participants.guard';
import { TournamentStartDateGuard } from './guards/tournament-start-date.guard';
import { participationQueryExamples } from './dto/examples';
import { GroupAdminGuard } from 'src/group/guards/group-admin.guard';
import { CanCancelParticipationGuard } from './guards/can-cancel-participation.guard';

@ApiTags('participations')
@ApiExtraModels(
  MiniParticipationResponse,
  ParticipationResponse,
  ExtendedParticipationResponse,
)
@Controller('participations')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: participationQueryExamples.responses,
      },
    },
  })
  async findAll(@Query() query: QueryParticipationDto, @Req() req: Request) {
    const results = await this.participationService.findAll(query);

    const metadata: IQueryMetadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      data: results,
      metadata,
    };
  }
  @Get(':participationId')
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: participationQueryExamples.responses,
      },
    },
  })
  async findOne(
    @Param('participationId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: ParticipationResponsesEnum,
  ) {
    return await this.participationService.findOne(id, responseType);
  }

  @UseGuards(
    JwtAuthGuard,
    TournamentMaximumParticipantsGuard,
    PublicTournamentParticipationGuard,
    TeamTypeTournamentParticipationGuard,
    TournamentStartDateGuard,
    DoubleParticipationGuard,
  )
  @ApiBearerAuth()
  @Post('/apply-solo/:tournamentId')
  @ApiOkResponse({
    type: ActionResponsePrimary,
  })
  async createSolo(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.participationService.create(tournamentId, {
      userId: user.id,
    });
  }

  @UseGuards(
    JwtAuthGuard,
    GroupAdminGuard,
    TournamentMaximumParticipantsGuard,
    PublicTournamentParticipationGuard,
    TeamTypeTournamentParticipationGuard,
    TournamentStartDateGuard,
    DoubleParticipationGuard,
  )
  @ApiBearerAuth()
  @Post('/apply-group/:tournamentId/:groupId')
  @ApiOkResponse({
    type: ActionResponsePrimary,
  })
  async createTeam(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return await this.participationService.create(tournamentId, {
      groupId,
    });
  }
  @UseGuards(
    JwtAuthGuard,
    TournamentMaximumParticipantsGuard,
    TournamentAdminGuard,
    TournamentIsFakePlayersAllowedGuard,
    TeamTypeTournamentParticipationGuard,
    TournamentStartDateGuard,
    DoubleParticipationGuard,
  )
  @ApiBearerAuth()
  @Post('/admin/apply-solo/:tournamentId/:userId')
  @ApiOkResponse({
    type: ActionResponsePrimary,
  })
  async createForFakePlayer(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.participationService.create(tournamentId, {
      userId,
    });
  }

  @UseGuards(
    JwtAuthGuard,
    TournamentMaximumParticipantsGuard,
    TournamentAdminGuard,
    TournamentIsFakePlayersAllowedGuard,
    TeamTypeTournamentParticipationGuard,
    TournamentStartDateGuard,
    DoubleParticipationGuard,
  )
  @ApiBearerAuth()
  @Post('/admin/apply-group/:tournamentId/:groupId')
  @ApiOkResponse({
    type: ActionResponsePrimary,
  })
  async createForFakeTeam(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return await this.participationService.create(tournamentId, {
      groupId,
    });
  }

  // TODO: see if a put / patch is even necessary
  // TODO: check if other functions in other controllers are puts or patches and standardize

  @UseGuards(JwtAuthGuard, CanCancelParticipationGuard)
  @ApiBearerAuth()
  @Delete(':participationId')
  async remove(@Param('participationId', ParseIntPipe) id: number) {
    await this.participationService.remove(id);
    return { message: 'Participation removed successfully' };
  }
}
