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
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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

  @UseGuards(GroupAdminGuard)
  @Post(':groupId/:userId') // No return types
  async create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupMembershipService.create(groupId, userId);
  }

  @UseGuards(GroupAdminGuard)
  @Post(':groupId/:userId')
  async remove(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.groupMembershipService.remove(groupId, userId);
  }

  @UseGuards(GroupAdminGuard)
  @Post(':groupId/:userId')
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

  @UseGuards(GroupMemberGuard)
  @Delete(':groupId')
  async removeMyself(
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.groupMembershipService.remove(groupId, user.id);
  }
}
