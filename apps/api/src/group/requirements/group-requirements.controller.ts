import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupRequirementsService } from './group-requirements.service';
import {
  CreateGroupRequirementsDto,
  UpdateGroupRequirementsDto,
} from './dto/requests';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GroupAdminGuard } from '../guards/group-admin.guard';
import { GroupMemberGuard } from '../guards/group-member.guard';

@ApiTags('group requirements')
@Controller('group-requirements')
@UseGuards(JwtAuthGuard)
export class GroupRequirementsController {
  constructor(
    private readonly groupRequirementsService: GroupRequirementsService,
  ) {}

  @Post(':groupId')
  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create group requirements' })
  @ApiResponse({
    status: 201,
    description: 'Requirements created successfully',
  })
  async createRequirements(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createDto: CreateGroupRequirementsDto,
  ) {
    return await this.groupRequirementsService.createRequirements(
      groupId,
      createDto,
    );
  }

  @Get(':groupId')
  @UseGuards(GroupMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get group requirements' })
  @ApiResponse({
    status: 200,
    description: 'Requirements retrieved successfully',
  })
  async getRequirements(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.groupRequirementsService.getRequirements(groupId);
  }

  @Put(':groupId')
  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update group requirements' })
  @ApiResponse({
    status: 200,
    description: 'Requirements updated successfully',
  })
  async updateRequirements(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() updateDto: UpdateGroupRequirementsDto,
  ) {
    return await this.groupRequirementsService.updateRequirements(
      groupId,
      updateDto,
    );
  }

  @Delete(':groupId')
  @UseGuards(GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete group requirements' })
  @ApiResponse({
    status: 200,
    description: 'Requirements deleted successfully',
  })
  async deleteRequirements(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.groupRequirementsService.deleteRequirements(groupId);
  }
}
