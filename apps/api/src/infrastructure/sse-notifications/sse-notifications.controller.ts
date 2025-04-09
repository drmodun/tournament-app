import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Sse,
  Query,
  UnauthorizedException,
  Patch,
  HttpStatus,
  HttpCode,
  UseGuards,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { SseNotificationsService } from './sse-notifications.service';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationQueryDto } from './dto/requests';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsResponse } from './dto/responses';
@ApiTags('SSE Notifications')
@Controller('notifications')
export class SseNotificationsController {
  constructor(
    private readonly sseNotificationsService: SseNotificationsService,
  ) {}

  @ApiExtraModels(NotificationsResponse)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get notifications',
  })
  @ApiBearerAuth()
  @Get()
  @ApiOkResponse({
    type: NotificationsResponse,
    isArray: true,
  })
  findAll(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: NotificationQueryDto,
  ) {
    return this.sseNotificationsService.findAllForUser({
      ...query,
      userId: user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('token')
  @ApiOperation({
    summary: 'Request new token',
  })
  @ApiBearerAuth()
  async requestNewToken(@CurrentUser() user: ValidatedUserDto) {
    return this.sseNotificationsService.requestNewToken(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.sseNotificationsService.setAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
  })
  @ApiBearerAuth()
  async markAllAsRead(@CurrentUser() user: ValidatedUserDto) {
    return this.sseNotificationsService.setAllAsReadForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/bulk')
  @ApiOperation({
    summary: 'Mark bulk notifications as read',
  })
  @ApiBearerAuth()
  async markBulkAsRead(
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    return await this.sseNotificationsService.setBulkAsRead(ids);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
  })
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.sseNotificationsService.remove(id);
  }

  @Sse('stream')
  @ApiOperation({
    summary: 'Get notification stream',
  })
  async getNotificationStream(
    @Query('token') token: string,
  ): Promise<Observable<MessageEvent>> {
    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    const userId = await this.sseNotificationsService.getUserIdByToken(token);

    return this.sseNotificationsService.getNotificationStream(userId);
  }
}
