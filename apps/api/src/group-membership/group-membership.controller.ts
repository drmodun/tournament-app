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
  BadRequestException,
} from '@nestjs/common';
import { GroupMembershipService } from './group-membership.service';
import { GroupAdminGuard } from 'src/group/guards/group-admin.guard';
import {
  GroupMembershipQuery,
  GroupMembershipUpdateRequest,
} from './dto/requests.dto';
import { GroupMemberGuard } from 'src/group/guards/group-member.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GroupMembershipKey,
  GroupMembershipResponse,
  GroupMembershipResponseWithDates,
  MinimalMembershipResponse,
  UserMembershipResponseWithDates,
} from './dto/responses.dto';
import {
  MiniUserResponseWithCountry,
  MiniUserResponseWithProfilePicture,
} from 'src/users/dto/responses.dto';
import {
  MiniGroupResponseWithCountry,
  MiniGroupResponseWithLogo,
} from 'src/group/dto/responses.dto';
import {
  groupMembershipExamples,
  groupMembershipQueryResponses,
  groupMembershipResponseSchema,
} from './dto/examples';
import {
  groupRoleEnum,
  GroupMembershipResponsesEnum,
  IQueryMetadata,
} from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('group-membership')
@ApiExtraModels(
  MinimalMembershipResponse,
  GroupMembershipResponse,
  UserMembershipResponseWithDates,
  GroupMembershipResponseWithDates,
  GroupMembershipKey,
  MiniUserResponseWithCountry,
  MiniUserResponseWithProfilePicture,
  MiniGroupResponseWithCountry,
  MiniGroupResponseWithLogo,
)
@Controller('group-membership')
export class GroupMembershipController {
  constructor(
    private readonly groupMembershipService: GroupMembershipService,
  ) {}

  @Get('auto-complete/users/:groupId/:search')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets the users by group ID and search string in an autocomplete manner',
  })
  @ApiOkResponse({ type: [MiniUserResponseWithProfilePicture] })
  async autoComplete(
    @Param('groupId') groupId: number,
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.groupMembershipService.autoComplete(
      groupId,
      search,
      query,
    );
  }

  @Get('auto-complete/groups/:search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets the groups by search string in an autocomplete manner',
  })
  @ApiOkResponse({ type: [MiniGroupResponseWithLogo] })
  async autoCompleteGroups(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupMembershipService.autoCompleteGroups(
      search,
      user.id,
      query,
    );
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupMembershipQueryResponses,
      },
    },
  })
  async findAll(@Query() query: GroupMembershipQuery, @Req() req: Request) {
    const results = await this.groupMembershipService.findAll(query);

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

  @UseGuards(GroupMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Leaves the group',
  })
  @Delete(':groupId/leave')
  async removeMyself(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupMembershipService.remove(groupId, user.id);
  }

  @Get(':groupId/:userId')
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: groupMembershipExamples,
        schema: groupMembershipResponseSchema,
      },
    },
  })
  @ApiOperation({
    summary: 'Gets the group membership by group ID and user ID',
  })
  async findOne(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('responseType')
    responseType?: GroupMembershipResponsesEnum,
  ) {
    return await this.groupMembershipService.findOne(
      groupId,
      userId,
      responseType,
    );
  }

  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates the group membership by group ID and user ID',
  })
  @Post(':groupId/:userId') // No return types
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupMembershipService.create(groupId, userId);
  }

  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletes the group membership by group ID and user ID',
  })
  @Delete(':groupId/:userId')
  async remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupMembershipService.remove(groupId, userId);
  }

  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Updates the group membership by group ID and user ID',
  })
  @Patch(':groupId/:userId')
  async update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateGroupMembershipDto: GroupMembershipUpdateRequest,
  ) {
    if (updateGroupMembershipDto.role === groupRoleEnum.OWNER) {
      throw new BadRequestException('Cannot change owner role');
    }

    return await this.groupMembershipService.update(
      groupId,
      userId,
      updateGroupMembershipDto,
    );
  }
}
