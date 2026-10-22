import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import {
  RegisterNotificationTokenRequest,
  UpdateNotificationSettingsRequest,
} from './dto/requests.dto';
import {
  NotificationSettingsResponse,
  NotificationTokenResponse,
} from './dto/responses.dto';
import { NotificationSettingsService } from './notification-settings.service';

@ApiTags('notification settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notifications')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Get('settings')
  @ApiOkResponse({ type: NotificationSettingsResponse })
  async getSettings(@CurrentUser() user: ValidatedUserDto) {
    return await this.notificationSettingsService.getSettings(user.id);
  }

  @Patch('settings')
  @ApiOkResponse({ type: NotificationSettingsResponse })
  async updateSettings(
    @CurrentUser() user: ValidatedUserDto,
    @Body() settings: UpdateNotificationSettingsRequest,
  ) {
    return await this.notificationSettingsService.updateSettings(
      user.id,
      settings,
    );
  }

  @Get('push-tokens')
  @ApiOkResponse({ type: [NotificationTokenResponse] })
  async getTokens(@CurrentUser() user: ValidatedUserDto) {
    return await this.notificationSettingsService.getTokens(user.id);
  }

  @Post('push-tokens')
  @ApiOkResponse({ type: NotificationTokenResponse })
  async registerToken(
    @CurrentUser() user: ValidatedUserDto,
    @Body() { token }: RegisterNotificationTokenRequest,
  ) {
    return await this.notificationSettingsService.registerToken(user.id, token);
  }

  @Delete('push-tokens/:tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeToken(
    @CurrentUser() user: ValidatedUserDto,
    @Param('tokenId', ParseIntPipe) tokenId: number,
  ) {
    await this.notificationSettingsService.removeToken(user.id, tokenId);
  }
}
