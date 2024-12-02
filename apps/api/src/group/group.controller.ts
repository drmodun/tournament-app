import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { GroupService } from './group.service';
import {
  GroupResponsesEnum,
  ICreateGroupRequest,
  IGroupQuery,
  IUpdateGroupRequest,
} from '@tournament-app/types';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActionResponsePrimary } from '../base/actions/actionResponses.dto';
import { CurrentUser } from '../base/decorators/currentUser.decorator';
import { ValidatedUserDto } from '../auth/dto/validatedUser.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: ActionResponsePrimary })
  async create(
    @CurrentUser() user: ValidatedUserDto,
    @Body() createGroupDto: ICreateGroupRequest,
  ) {
    return await this.groupService.create(createGroupDto, user.id);
  }

  @Get()
  async findAll(@Query() query: IGroupQuery) {
    return await this.groupService.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('responseType') responseType?: GroupResponsesEnum,
  ) {
    return await this.groupService.findOne(id, responseType);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: ActionResponsePrimary })
  async update(
    @CurrentUser() user: ValidatedUserDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: IUpdateGroupRequest,
  ) {
    return await this.groupService.update(id, updateGroupDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(
    @CurrentUser() user: ValidatedUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.groupService.remove(id, user.id);
  }
}
