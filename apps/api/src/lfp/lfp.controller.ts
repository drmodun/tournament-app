import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { LFPService } from './lfp.service';
import { CreateLFPDto, UpdateLFPDto, LFPQueryDto } from './dto/requests';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupAdminGuard } from '../group/guards/group-admin.guard';
import { GroupMemberGuard } from '../group/guards/group-member.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { LFPResponse } from './dto/responses';
import { GroupResponse } from 'src/group/dto/responses.dto';

@ApiTags('lfp')
@Controller('lfp')
@UseGuards(JwtAuthGuard)
export class LFPController {
  constructor(private readonly lfpService: LFPService) {}

  @Get('groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get groups for user' })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
    type: [GroupResponse],
  })
  async getGroups(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: LFPQueryDto,
  ) {
    return await this.lfpService.getGroups(user.id, query);
  }

  @Post(':groupId')
  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create LFP post' })
  @ApiResponse({
    status: 201,
    description: 'LFP post created successfully',
    type: LFPResponse,
  })
  async createLFP(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createDto: CreateLFPDto,
  ) {
    return await this.lfpService.createLFP(createDto, groupId);
  }

  @Get(':groupId')
  @UseGuards(JwtAuthGuard, GroupMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get LFP posts for a group' })
  @ApiResponse({
    status: 200,
    description: 'LFP posts retrieved successfully',
    type: [LFPResponse],
  })
  async getForGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.lfpService.getForGroup(groupId);
  }

  @Patch(':groupId/:id')
  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update LFP post' })
  @ApiResponse({
    status: 200,
    description: 'LFP post updated successfully',
    type: LFPResponse,
  })
  async updateLFP(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLFPDto,
  ) {
    return await this.lfpService.updateLFP(id, updateDto);
  }

  @Delete(':groupId/:id')
  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete LFP post' })
  @ApiResponse({
    status: 200,
    description: 'LFP post deleted successfully',
    type: LFPResponse,
  })
  async deleteLFP(@Param('id', ParseIntPipe) id: number) {
    return await this.lfpService.deleteLFP(id);
  }
}
