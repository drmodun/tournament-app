import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BlockedUsersService } from './blocked-users.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { GroupAdminGuard } from '../guards/group-admin.guard';
import { MiniUserResponseWithProfilePicture } from 'src/users/dto/responses.dto';

@ApiTags('blocked users')
@Controller('blocked-users')
export class BlockedUsersController {
  constructor(private readonly blockedUsersService: BlockedUsersService) {}

  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiOperation({
    summary: 'Gets blocked users',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [MiniUserResponseWithProfilePicture] })
  @Get('auto-complete/:groupId/:search')
  async autoComplete(
    @Param('groupId') groupId: number,
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.blockedUsersService.searchBlockedUsers(
      search,
      groupId,
      query,
    );
  }

  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiOperation({
    summary: 'Gets blocked users',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [MiniUserResponseWithProfilePicture] })
  @Get(':groupId')
  async findAll(
    @Query() pagination: PaginationOnly,
    @Param('groupId') groupId: number,
    @Req() request: Request,
  ) {
    const results = await this.blockedUsersService.getBlockedUsers(
      groupId,
      pagination.page,
      pagination.pageSize,
    );

    return {
      results,
      metadata: MetadataMaker.makeMetadataFromQuery(
        pagination,
        results,
        request.url,
      ),
    };
  }

  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiOperation({
    summary: 'Blocks a user',
  })
  @ApiBearerAuth()
  @Post(':groupId/:userId')
  async block(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    await this.blockedUsersService.blockUser(groupId, userId);
  }

  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiOperation({
    summary: 'Unblocks a user',
  })
  @ApiBearerAuth()
  @Delete(':groupId/:userId')
  async unblock(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    await this.blockedUsersService.unblockUser(groupId, userId);
  }
}
