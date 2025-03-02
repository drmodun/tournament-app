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
      req.url, //TODO: maybe make a url extractor
    );

    return {
      results,
      metadata,
    };
  }

  @UseGuards(GroupMemberGuard)
  @ApiBearerAuth()
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
  @Post(':groupId/:userId') // No return types
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupMembershipService.create(groupId, userId);
  }

  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @Delete(':groupId/:userId')
  async remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupMembershipService.remove(groupId, userId);
  }

  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @Patch(':groupId/:userId')
  async update(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateGroupMembershipDto: GroupMembershipUpdateRequest,
  ) {
    return await this.groupMembershipService.update(
      groupId,
      userId,
      updateGroupMembershipDto,
    );
  }
}
