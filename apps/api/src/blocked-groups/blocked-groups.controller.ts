import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlockedGroupsService } from './blocked-groups.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { MetadataMaker } from 'src/base/static/makeMetadata';

@Controller('blocked-groups')
@ApiTags('Blocked Groups')
export class BlockedGroupsController {
  constructor(private readonly blockedGroupsService: BlockedGroupsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async findAll(
    @Query() pagination: PaginationOnly,
    @CurrentUser() user: ValidatedUserDto,
    @Req() req: Request,
  ) {
    const results = await this.blockedGroupsService.getBlockedGroups(
      user.id,
      pagination.page,
      pagination.pageSize,
    );

    const metadata = MetadataMaker.makeMetadataFromQuery(
      pagination,
      results,
      req.url,
    );

    return { results, metadata };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':groupId')
  async block(
    @CurrentUser() user: ValidatedUserDto,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    await this.blockedGroupsService.blockGroup(user.id, groupId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':groupId')
  async unblock(
    @CurrentUser() user: ValidatedUserDto,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    await this.blockedGroupsService.unblockGroup(user.id, groupId);
  }
}
