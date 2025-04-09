import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LfgService } from './lfg.service';
import { CreateLFGRequest, UpdateLFGRequest } from './dto/requests';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { GroupAdminGuard } from 'src/group/guards/group-admin.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { LFGResponse } from './dto/responses';
@Controller('lfg')
@ApiTags('LFG')
export class LfgController {
  constructor(private readonly lfgService: LfgService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all LFG posts by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all LFG posts by the current user',
    type: [LFGResponse],
  })
  async findMyLFG(@CurrentUser() user: ValidatedUserDto) {
    return await this.lfgService.findMyLfg(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new LFG post' })
  @ApiResponse({
    status: 201,
    description: 'LFG post created successfully',
    type: LFGResponse,
  })
  async create(
    @Body() createLFGRequest: CreateLFGRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.lfgService.create(createLFGRequest, user.id);
  }
  @Get(':groupId')
  @UseGuards(JwtAuthGuard, GroupAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get LFG posts for a group' })
  @ApiResponse({
    status: 200,
    description: 'Returns LFG posts for a specific group',
    type: [LFGResponse],
  })
  async findPlayers(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.lfgService.findPlayers(groupId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing LFG post' })
  @ApiResponse({
    status: 200,
    description: 'LFG post updated successfully',
    type: LFGResponse,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLFGRequest: UpdateLFGRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.lfgService.update(id, updateLFGRequest, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an LFG post' })
  @ApiResponse({
    status: 200,
    description: 'LFG post deleted successfully',
    type: LFGResponse,
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.lfgService.delete(id, user.id);
  }
}
