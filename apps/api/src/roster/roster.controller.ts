import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { RosterService } from './roster.service';
import { CreateRosterDto, QueryRosterDto } from './dto/requests';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CanCreateRosterGuard } from './guards/can-create-roster.guard';
import { CanRosterBeUsedGuard } from './guards/roster-check.guard';
import { CanUpdateRosterGuard } from './guards/can-update-roster.guard';
import { RosterDto, MiniRosterDto, PlayerDto } from './dto/responses';
import {
  rosterResponses,
  rosterQueryResponses,
  rosterResponseSchema,
} from './dto/examples';
import { RosterResponsesEnum, IQueryMetadata } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { MiniUserResponseWithCountry } from 'src/users/dto/responses.dto';
import { MiniGroupResponseWithLogo } from 'src/group/dto/responses.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';

@ApiTags('roster')
@ApiExtraModels(
  MiniRosterDto,
  RosterDto,
  PlayerDto,
  MiniUserResponseWithCountry,
  MiniGroupResponseWithLogo,
)
@Controller('roster')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Get('managed-by-user/:stageId')
  @ApiOperation({ summary: 'Get all managed rosters for a specific user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getManagedRostersForStage(
    @Param('stageId', ParseIntPipe) stageId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.rosterService.getManagedRostersForPlayer(
      stageId,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all rosters with optional filtering' })
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: rosterQueryResponses.responses,
      },
    },
  })
  async findAll(@Query() query: QueryRosterDto, @Req() req: Request) {
    const results = await this.rosterService.findAll(query);

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific roster by ID' })
  @ApiOkResponse({
    description: 'Returns a specific roster',
    content: {
      'application/json': {
        examples: rosterResponses,
        schema: rosterResponseSchema,
      },
    },
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('responseType') responseType?: RosterResponsesEnum,
  ) {
    return await this.rosterService.findOne(id, responseType);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, CanRosterBeUsedGuard, CanUpdateRosterGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a roster' })
  @ApiOkResponse({
    description: 'The roster has been successfully updated',
    content: {
      'application/json': {
        example: rosterResponses[RosterResponsesEnum.BASE].value,
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRosterDto: CreateRosterDto,
  ) {
    return await this.rosterService.update(id, updateRosterDto);
  }

  @Get('stage/:stageId')
  @ApiOperation({ summary: 'Get all rosters for a specific stage' })
  @ApiOkResponse({
    description: 'Returns all rosters for a specific stage',
    content: {
      'application/json': {
        examples: rosterQueryResponses.responses,
      },
    },
  })
  async findByStage(
    @Param('stageId', ParseIntPipe) stageId: number,
    @Query() query: QueryRosterDto,
    @Req() req: Request,
  ) {
    const results = await this.rosterService.findByStage(stageId, query);

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

  @Get('participation/:participationId')
  @ApiOperation({ summary: 'Get all rosters for a specific participation' })
  @ApiOkResponse({
    description: 'Returns all rosters for a specific participation',
    content: {
      'application/json': {
        examples: rosterQueryResponses.responses,
      },
    },
  })
  async findByParticipation(
    @Param('participationId', ParseIntPipe) participationId: number,
    @Query() query: QueryRosterDto,
    @Req() req: Request,
  ) {
    const results = await this.rosterService.findByParticipation(
      participationId,
      query,
    );

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

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all rosters for a specific user' })
  @ApiOkResponse({
    description: 'Returns all rosters that include a specific user',
    content: {
      'application/json': {
        examples: rosterQueryResponses.responses,
      },
    },
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryRosterDto,
    @Req() req: Request,
  ) {
    const results = await this.rosterService.findByPlayer(userId, query);

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

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get all rosters for a specific group' })
  @ApiOkResponse({
    description: 'Returns all rosters for a specific group',
    content: {
      'application/json': {
        examples: rosterQueryResponses.responses,
      },
    },
  })
  async findByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: QueryRosterDto,
    @Req() req: Request,
  ) {
    const results = await this.rosterService.findByGroup(groupId, query);

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

  @Post(':participationId/:stageId')
  @UseGuards(JwtAuthGuard, CanRosterBeUsedGuard, CanCreateRosterGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new roster' })
  @ApiCreatedResponse({
    description: 'The roster has been successfully created',
    content: {
      'application/json': {
        example: rosterResponses[RosterResponsesEnum.BASE].value,
      },
    },
  })
  async create(
    @Body() createRosterDto: CreateRosterDto,
    @Param('participationId', ParseIntPipe) participationId: number,
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return await this.rosterService.create(
      createRosterDto,
      participationId,
      stageId,
    );
  }
}
