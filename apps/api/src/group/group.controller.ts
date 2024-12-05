import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
  Patch,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupAdminGuard } from './guards/group-admin.guard';
import {
  CreateGroupRequest,
  GroupQuery,
  UpdateGroupRequest,
} from './dto/requests.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GroupResponse,
  GroupResponseExtended,
  MiniGroupResponse,
  MiniGroupResponseWithCountry,
  MiniGroupResponseWithLogo,
} from './dto/responses.dto';
import {
  groupExamples,
  groupQueryResponses,
  groupResponseSchema,
} from './dto/examples';
import { GroupResponsesEnum, IQueryMetadata } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GroupOwnerGuard } from './guards/group-owner.guard';

@ApiTags('groups')
@ApiExtraModels(
  MiniGroupResponse,
  MiniGroupResponseWithLogo,
  MiniGroupResponseWithCountry,
  GroupResponse,
  GroupResponseExtended,
)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupQueryResponses.responses,
      },
    },
  })
  async findAll(@Query() query: GroupQuery, @Req() req: Request) {
    const results = await this.groupService.findAll(query);

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

  @Get(':groupId')
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupExamples,
        schema: groupResponseSchema,
      },
    },
  })
  async findOne(
    @Param('groupId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: GroupResponsesEnum,
  ) {
    return await this.groupService.findOne(id, responseType);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    content: {
      'application/json': {
        example: groupExamples[GroupResponsesEnum.BASE].value,
      },
    },
  })
  async create(
    @Body() createGroupDto: CreateGroupRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupService.create(createGroupDto, user.id);
  }

  @Patch(':groupId')
  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    content: {
      'application/json': {
        example: groupExamples[GroupResponsesEnum.BASE].value,
      },
    },
  })
  async update(
    @Param('groupId', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupRequest,
  ) {
    return await this.groupService.update(id, updateGroupDto);
  }

  @Delete(':groupId')
  @UseGuards(GroupOwnerGuard)
  @ApiBearerAuth()
  async remove(@Param('groupId', ParseIntPipe) id: number) {
    return await this.groupService.remove(id);
  }

  @Get(':groupId/members')
  @ApiOkResponse({
    content: {
      'application/json': {
        example: {
          group: groupExamples[GroupResponsesEnum.BASE].value,
          members: [],
        },
      },
    },
  })
  async getGroupMembers(@Param('groupId', ParseIntPipe) id: number) {
    return await this.groupService.getGroupMembers(id);
  }

  @Get(':groupId/tournaments')
  @ApiOkResponse({
    content: {
      'application/json': {
        example: {
          group: groupExamples[GroupResponsesEnum.BASE].value,
          tournaments: [],
        },
      },
    },
  })
  async getGroupTournaments(@Param('groupId', ParseIntPipe) id: number) {
    return await this.groupService.getGroupTournaments(id);
  }

  @Get(':groupId/followers')
  @ApiOkResponse({
    content: {
      'application/json': {
        example: {
          group: groupExamples[GroupResponsesEnum.BASE].value,
          followers: [],
        },
      },
    },
  })
  async getGroupFollowers(@Param('groupId', ParseIntPipe) id: number) {
    return await this.groupService.getGroupFollowers(id);
  }
}
