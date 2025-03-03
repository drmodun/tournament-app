import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import {
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentQuery,
} from './dto/requests.dto';
import {
  TournamentResponse,
  ExtendedTournamentResponse,
  MiniTournamentResponse,
  MiniTournamentResponseWithLogo,
} from './dto/responses.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { tournamentQueryExamples, tournamentResponses } from './dto/examples';
import { TournamentResponsesEnum, IQueryMetadata } from '@tournament-app/types';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { ConditionalAdminGuard } from './guards/conditional-admin.guard';
import { TournamentAdminGuard } from './guards/tournament-admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { PaginationOnly } from 'src/base/query/baseQuery';

@ApiTags('tournaments')
@ApiExtraModels(
  MiniTournamentResponse,
  MiniTournamentResponseWithLogo,
  TournamentResponse,
  ExtendedTournamentResponse,
)
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get('auto-complete/:search')
  @ApiOkResponse({
    description: 'Returns a list of tournaments that can be auto-completed',
  })
  async autoComplete(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.tournamentService.autoComplete(search, query);
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: tournamentQueryExamples.responses,
      },
    },
  })
  async findAll(@Query() query: TournamentQuery, @Req() req: Request) {
    const results = await this.tournamentService.findAll(query);

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

  @Get(':tournamentId')
  @ApiOkResponse({
    description: 'Returns a single tournament',
    schema: { examples: tournamentResponses },
  })
  async findOne(
    @Param('tournamentId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: TournamentResponsesEnum,
  ) {
    return await this.tournamentService.findOne(id, responseType);
  }

  @Post()
  @UseGuards(JwtAuthGuard, ConditionalAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new tournament',
    type: ActionResponsePrimary,
  })
  async create(
    @Body() createTournamentDto: CreateTournamentRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.tournamentService.create({
      ...createTournamentDto,
      creatorId: user.id,
    });
  }

  @Patch(':tournamentId')
  @UseGuards(JwtAuthGuard, TournamentAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates a tournament',
    type: ActionResponsePrimary,
  })
  async update(
    @Param('tournamentId', ParseIntPipe) id: number,
    @Body() updateTournamentDto: UpdateTournamentRequest,
  ) {
    return await this.tournamentService.update(id, updateTournamentDto);
  }

  @Delete(':tournamentId')
  @UseGuards(JwtAuthGuard, TournamentAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes a tournament',
    type: ActionResponsePrimary,
  })
  async remove(@Param('tournamentId', ParseIntPipe) id: number) {
    return await this.tournamentService.remove(id);
  }
}
