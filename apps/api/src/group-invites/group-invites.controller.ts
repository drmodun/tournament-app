import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { GroupInvitesService } from './group-invites.service';
import {
  CreateGroupInviteDto,
  UpdateGroupInviteDto,
  GroupInviteQuery,
} from './dto/requests.dto';
import {
  GroupInviteResponsesEnum,
  IQueryMetadata,
} from '@tournament-app/types';
import { ValidatedUserDto } from '../auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupAdminGuard } from 'src/group/guards/group-admin.guard';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import {
  GroupInviteWithUserResponseDto,
  GroupInviteWithMiniUserResponseDto,
  GroupInviteWithGroupResponseDto,
  GroupInviteWithMiniGroupResponseDto,
} from './dto/responses.dto';
import { groupInviteExamples, groupInviteQueryExamples } from './dto/examples';
import { GroupNonMemberGuard } from 'src/group/guards/group-non-member.guard';

@ApiTags('group-invites')
@Controller('group-invites')
@ApiExtraModels(
  GroupInviteWithUserResponseDto,
  GroupInviteWithMiniUserResponseDto,
  GroupInviteWithGroupResponseDto,
  GroupInviteWithMiniGroupResponseDto,
)
export class GroupInvitesController {
  constructor(private readonly groupInvitesService: GroupInvitesService) {}

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupInviteQueryExamples.responses,
      },
    },
  })
  async findAll(@Query() query: GroupInviteQuery, @Req() req: Request) {
    const results = await this.groupInvitesService.findAll(query);

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

  @UseGuards(GroupNonMemberGuard)
  @Post(':groupId/accept')
  @ApiBearerAuth()
  async accept(
    @Param('groupId', ParseIntPipe) id: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupInvitesService.accept(id, user.id);
  }

  @UseGuards(GroupNonMemberGuard)
  @Delete(':groupId/reject')
  @ApiBearerAuth()
  async reject(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupInvitesService.reject(groupId, user.id);
  }

  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @Post(':groupId/:userId')
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createGroupInviteDto: CreateGroupInviteDto,
  ) {
    return await this.groupInvitesService.create(
      groupId,
      userId,
      createGroupInviteDto,
    );
  }

  //TODO : think if it is necessary to verify the user getting as admin of group or the invited users

  @Get(':groupId/:userId')
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupInviteExamples,
      },
    },
  })
  async findOne(
    @Param('userId', ParseIntPipe) id: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('responseType')
    responseType: GroupInviteResponsesEnum = GroupInviteResponsesEnum.WITH_USER,
  ) {
    return await this.groupInvitesService.findOne(groupId, id, responseType);
  }

  @ApiBearerAuth()
  @Patch(':groupId/:userId')
  @UseGuards(GroupAdminGuard)
  async update(
    @Param('userId', ParseIntPipe) id: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() updateGroupInviteDto: UpdateGroupInviteDto,
  ) {
    return await this.groupInvitesService.update(
      groupId,
      id,
      updateGroupInviteDto,
    );
  }

  @Delete(':groupId/:userId') // TODO: think if somehow we can extract the current group out of this
  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiBearerAuth()
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return await this.groupInvitesService.remove(groupId, userId);
  }
}
