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
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsResponse } from './dto/responses';
@ApiTags('SSE Notifications')
@Controller('notifications')
export class SseNotificationsController {
  constructor(
    private readonly sseNotificationsService: SseNotificationsService,
  ) {}

  @ApiExtraModels(NotificationsResponse)
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  async requestNewToken(@CurrentUser() user: ValidatedUserDto) {
    return this.sseNotificationsService.requestNewToken(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.sseNotificationsService.setAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/all')
  @ApiBearerAuth()
  async markAllAsRead(@CurrentUser() user: ValidatedUserDto) {
    return this.sseNotificationsService.setAllAsReadForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read/bulk')
  @ApiBearerAuth()
  async markBulkAsRead(
    @Body('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    return await this.sseNotificationsService.setBulkAsRead(ids);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.sseNotificationsService.remove(id);
  }

  @Sse('stream')
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
