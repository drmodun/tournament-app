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
  Patch,
  Req,
} from '@nestjs/common';
import { GroupJoinRequestsService } from './group-join-requests.service';
import { GroupAdminGuard } from '../group/guards/group-admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../base/decorators/currentUser.decorator';
import { ValidatedUserDto } from '../auth/dto/validatedUser.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GroupJoinRequestQuery,
  CreateGroupJoinRequestDto,
  UpdateGroupJoinRequestDto,
} from './dto/requests.dto';
import {
  GroupJoinRequestWithUserResponse,
  GroupJoinRequestWithMiniUserResponse,
  GroupJoinRequestWithGroupResponse,
  GroupJoinRequestWithMiniGroupResponse,
} from './dto/responses.dto';
import {
  groupJoinRequestQueryResponses,
  groupJoinRequestQueryResponseSchemaList,
  groupJoinRequestsExamples,
} from './dto/examples';
import {
  GroupJoinRequestResponsesEnum,
  IQueryMetadata,
} from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { GroupNonMemberGuard } from 'src/group/guards/group-non-member.guard';

@ApiTags('group-join-requests')
@Controller('group-join-requests')
@ApiBearerAuth()
@ApiExtraModels(
  GroupJoinRequestWithUserResponse,
  GroupJoinRequestWithMiniUserResponse,
  GroupJoinRequestWithGroupResponse,
  GroupJoinRequestWithMiniGroupResponse,
)
export class GroupJoinRequestsController {
  constructor(
    private readonly groupJoinRequestsService: GroupJoinRequestsService,
  ) {}

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupJoinRequestsExamples.responses,
      },
    },
  })
  async findAll(@Query() query: GroupJoinRequestQuery, @Req() req: Request) {
    const results = await this.groupJoinRequestsService.findAll(query);

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

  @UseGuards(JwtAuthGuard, GroupNonMemberGuard)
  @Post(':groupId')
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user: ValidatedUserDto,
    @Body() createGroupJoinRequestDto: CreateGroupJoinRequestDto,
  ) {
    return await this.groupJoinRequestsService.create(
      groupId,
      user.id,
      createGroupJoinRequestDto,
    );
  }

  @Get(':groupId/:userId')
  @ApiOkResponse({
    description: 'Returns a specific group join request',
    content: {
      'application/json': {
        examples: groupJoinRequestQueryResponses,
        schema: groupJoinRequestQueryResponseSchemaList,
      },
    },
  })
  async findOne(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('responseType') responseType?: GroupJoinRequestResponsesEnum,
  ) {
    return await this.groupJoinRequestsService.findOne(
      groupId,
      userId,
      responseType,
    );
  }

  @UseGuards(JwtAuthGuard, GroupNonMemberGuard)
  @Patch(':groupId')
  async update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user: ValidatedUserDto,
    @Body() updateGroupJoinRequestDto: UpdateGroupJoinRequestDto,
  ) {
    return await this.groupJoinRequestsService.update(
      groupId,
      user.id,
      updateGroupJoinRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard, GroupNonMemberGuard)
  @Delete(':groupId')
  async remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupJoinRequestsService.remove(groupId, user.id);
  }

  @Post(':groupId/:userId/accept')
  @UseGuards(GroupAdminGuard)
  async accept(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupJoinRequestsService.accept(groupId, userId);
  }

  @Delete(':groupId/:userId/reject')
  @UseGuards(GroupAdminGuard)
  async reject(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupJoinRequestsService.reject(groupId, userId);
  }
}
