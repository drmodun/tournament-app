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
} from '@nestjs/common';
import { SseNotificationsService } from './sse-notifications.service';
import { CreateSseNotificationDto } from './dto/create-sse-notification.dto';
import { UpdateSseNotificationDto } from './dto/update-sse-notification.dto';
import { Observable } from 'rxjs';

@Controller('notifications')
export class SseNotificationsController {
  constructor(
    private readonly sseNotificationsService: SseNotificationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSseNotificationDto: CreateSseNotificationDto) {
    return this.sseNotificationsService.create(createSseNotificationDto);
  }

  @Get()
  findAll() {
    return this.sseNotificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sseNotificationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSseNotificationDto: UpdateSseNotificationDto,
  ) {
    return this.sseNotificationsService.update(+id, updateSseNotificationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.sseNotificationsService.remove(+id);
  }

  @Sse('stream')
  getNotificationStream(
    @Query('token') token: string,
  ): Observable<MessageEvent> {
    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    // The service will validate the token and return an Observable of notifications
    return this.sseNotificationsService.getNotificationStream(token);
  }
}
