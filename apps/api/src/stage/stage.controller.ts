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
  ApiOperation,
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
import { PaginationOnly } from 'src/base/query/baseQuery';
import { StageAdminGuard } from './guards/stage-admin.guard';

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
  @ApiOperation({
    summary: 'Retrieves a list of stages based on the provided query parameters.',
  })
  @ApiOkResponse({
    description:
      'Retrieves a list of stages based on the provided query parameters.',
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
  @ApiOperation({
    summary: 'Retrieves a list of stages managed by the current user.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Retrieves a list of stages managed by the current user.',
  })
  async getManagedStages(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: PaginationOnly,
  ) {
    return await this.stageService.getManagedStages(user.id, query);
  }

  @Patch('start/:stageId')
  @ApiOperation({
    summary: 'Starts a stage specified by the stage ID.',
  })
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Starts a stage specified by the stage ID.',
    type: ActionResponsePrimary,
  })
  async startStage(@Param('stageId', ParseIntPipe) stageId: number) {
    return await this.stageService.startStage(stageId);
  }

  @Get(':stageId')
  @ApiOperation({
    summary: 'Returns details of a single stage specified by the stage ID.',
  })
  @ApiOkResponse({
    description: 'Returns details of a single stage specified by the stage ID.',
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
  @ApiOperation({
    summary: 'Creates a new stage within the specified tournament.',
  })
  @UseGuards(JwtAuthGuard, TournamentAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new stage within the specified tournament.',
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
  @ApiOperation({
    summary: 'Updates the details of an existing stage specified by the stage ID.',
  })
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Updates the details of an existing stage specified by the stage ID.',
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
  @ApiOperation({
    summary: 'Deletes a stage specified by the stage ID within the specified tournament.',
  })
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Deletes a stage specified by the stage ID within the specified tournament.',
    type: ActionResponsePrimary,
  })
  async remove(@Param('stageId', ParseIntPipe) id: number) {
    return await this.stageService.remove(id);
  }
}
