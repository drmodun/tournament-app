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
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { tournamentQueryExamples, tournamentResponses } from './dto/examples';
import { TournamentResponsesEnum, IQueryMetadata } from '@tournament-app/types';
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
    description:
      'Returns a list of tournaments that can be auto-completed based on the search term.',
  })
  @ApiOperation({
    summary: 'Auto-complete tournaments based on search term',
    description:
      'Returns a list of tournaments that can be auto-completed based on the search term.',
  })
  async autoComplete(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.tournamentService.autoComplete(search, query);
  }

  @Get()
  @ApiOkResponse({
    description:
      'Retrieves a list of tournaments based on the provided query parameters.',
    content: {
      'application/json': {
        examples: tournamentQueryExamples.responses,
      },
    },
  })
  @ApiOperation({
    summary: 'Retrieve all tournaments',
    description:
      'Retrieves a list of tournaments based on the provided query parameters.',
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

  @Get('managed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Retrieves a list of tournaments managed by the current user.',
  })
  @ApiOperation({
    summary: 'Retrieve all tournaments managed by the current user',
    description: 'Retrieves a list of tournaments managed by the current user.',
  })
  async getManagedTournaments(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: PaginationOnly,
  ) {
    return await this.tournamentService.getManagedTournaments(user.id, query);
  }

  @Get(':tournamentId')
  @ApiOkResponse({
    description:
      'Returns details of a single tournament specified by the tournament ID.',
    schema: { examples: tournamentResponses },
  })
  @ApiOperation({
    summary: 'Retrieve a single tournament by ID',
    description:
      'Returns details of a single tournament specified by the tournament ID.',
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
    description: 'Creates a new tournament with the provided details.',
    type: ActionResponsePrimary,
  })
  @ApiOperation({
    summary: 'Create a new tournament',
    description: 'Creates a new tournament with the provided details.',
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
    description:
      'Updates the details of an existing tournament specified by the tournament ID.',
    type: ActionResponsePrimary,
  })
  @ApiOperation({
    summary: 'Update an existing tournament',
    description:
      'Updates the details of an existing tournament specified by the tournament ID.',
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
    description: 'Deletes a tournament specified by the tournament ID.',
    type: ActionResponsePrimary,
  })
  @ApiOperation({
    summary: 'Delete a tournament',
    description: 'Deletes a tournament specified by the tournament ID.',
  })
  async remove(@Param('tournamentId', ParseIntPipe) id: number) {
    return await this.tournamentService.remove(id);
  }
}
