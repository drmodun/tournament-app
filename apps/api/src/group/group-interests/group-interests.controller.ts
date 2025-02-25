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
import { GroupInterestsService } from './group-interests.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { GroupAdminGuard } from '../guards/group-admin.guard';

@ApiTags('group interests')
@Controller('group-interests')
export class GroupInterestsController {
  constructor(private readonly groupInterestsService: GroupInterestsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':groupId')
  async findAll(
    @Query() pagination: PaginationOnly,
    @Param('groupId') groupId: number,
    @Req() request: Request,
  ) {
    const results = await this.groupInterestsService.getGroupInterests(
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
  @ApiBearerAuth()
  @Post(':groupId/:categoryId')
  async addInterest(
    @Param('groupId') groupId: number,
    @Param('categoryId') categoryId: number,
  ) {
    return await this.groupInterestsService.createGroupInterest(
      groupId,
      categoryId,
    );
  }

  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiBearerAuth()
  @Delete(':groupId/:categoryId')
  async removeInterest(
    @Param('groupId') groupId: number,
    @Param('categoryId') categoryId: number,
  ) {
    await this.groupInterestsService.deleteGroupInterest(groupId, categoryId);
  }
}
