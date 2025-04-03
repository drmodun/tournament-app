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
import { StageService } from './stage.service';
import {
  CreateStageRequest,
  UpdateStageRequest,
  StageQuery,
} from './dto/requests.dto';
import {
  MiniStageResponse,
  StageResponse,
  StageResponseWithTournament,
  ExtendedStageResponse,
  ExtendedStageResponseWithTournament,
} from './dto/responses.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createStageExample,
  updateStageExample,
  miniStageExample,
  stageExample,
  stageWithTournamentExample,
  extendedStageExample,
  extendedStageWithTournamentExample,
} from './dto/examples';
import { StageResponsesEnum, IQueryMetadata } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TournamentAdminGuard } from '../tournament/guards/tournament-admin.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { PaginationInstance } from 'src/base/query/baseResponse';
import { PaginationOnly } from 'src/base/query/baseQuery';

@ApiTags('stages')
@ApiExtraModels(
  MiniStageResponse,
  StageResponse,
  StageResponseWithTournament,
  ExtendedStageResponse,
  ExtendedStageResponseWithTournament,
)
@Controller('stages')
export class StageController {
  constructor(private readonly stageService: StageService) {}

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: {
          mini: {
            value: miniStageExample,
          },
          base: {
            value: stageExample,
          },
          withTournament: {
            value: stageWithTournamentExample,
          },
          extended: {
            value: extendedStageExample,
          },
          withExtendedTournament: {
            value: extendedStageWithTournamentExample,
          },
        },
      },
    },
  })
  async findAll(@Query() query: StageQuery, @Req() req: Request) {
    const results = await this.stageService.findAll(query);

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
  async getManagedStages(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: PaginationOnly,
  ) {
    return await this.stageService.getManagedStages(user.id, query);
  }

  @Get(':stageId')
  @ApiOkResponse({
    description: 'Returns a single stage',
    content: {
      'application/json': {
        examples: {
          mini: {
            value: miniStageExample,
          },
          base: {
            value: stageExample,
          },
          withTournament: {
            value: stageWithTournamentExample,
          },
          extended: {
            value: extendedStageExample,
          },
          withExtendedTournament: {
            value: extendedStageWithTournamentExample,
          },
        },
      },
    },
  })
  async findOne(
    @Param('stageId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: StageResponsesEnum,
  ) {
    return await this.stageService.findOne(id, responseType);
  }

  @Post(':tournamentId')
  @UseGuards(JwtAuthGuard, TournamentAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new stage',
    type: ActionResponsePrimary,
    content: {
      'application/json': {
        example: createStageExample,
      },
    },
  })
  async create(
    @Body() createStageDto: CreateStageRequest,
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return await this.stageService.create({
      ...createStageDto,
      tournamentId,
    });
  }

  @Patch(':tournamentId/:stageId')
  @UseGuards(JwtAuthGuard, TournamentAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates a stage',
    type: ActionResponsePrimary,
    content: {
      'application/json': {
        example: updateStageExample,
      },
    },
  })
  async update(
    @Param('stageId', ParseIntPipe) id: number,
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
    @Body() updateStageDto: UpdateStageRequest,
  ) {
    return await this.stageService.update(id, {
      ...updateStageDto,
      tournamentId,
    });
  }

  @Delete(':tournamentId/:stageId')
  @UseGuards(JwtAuthGuard, TournamentAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes a stage',
    type: ActionResponsePrimary,
  })
  async remove(@Param('stageId', ParseIntPipe) id: number) {
    return await this.stageService.remove(id);
  }
}
