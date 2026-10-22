import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { SessionOnly } from 'src/auth/guards/session-only.guard';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenRequest } from './dto/requests.dto';
import {
  ApiTokenResponse,
  ApiTokenUsageResponse,
  CreatedApiTokenResponse,
  RevokeAllApiTokensResponse,
} from './dto/responses.dto';

// The logged-in user's own personal access tokens. Managing them needs a login, so a leaked
// token cannot make more tokens or hide itself.
@ApiTags('auth')
@SessionOnly()
@Controller('auth/tokens')
export class ApiTokensController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Post()
  @ApiOkResponse({ type: CreatedApiTokenResponse })
  async create(
    @CurrentUser() user: ValidatedUserDto,
    @Body() request: CreateApiTokenRequest,
  ) {
    return await this.apiTokensService.create(user.id, request);
  }

  @Get()
  @ApiOkResponse({ type: [ApiTokenResponse] })
  async findAll(@CurrentUser() user: ValidatedUserDto) {
    return await this.apiTokensService.findAll(user.id);
  }

  // Revokes every active token
  @Delete()
  @ApiOkResponse({ type: RevokeAllApiTokensResponse })
  async revokeAll(@CurrentUser() user: ValidatedUserDto) {
    return await this.apiTokensService.revokeAll(user.id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ApiTokenResponse })
  async revoke(
    @CurrentUser() user: ValidatedUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.apiTokensService.revoke(user.id, id);
  }

  @Get(':id/usage')
  @ApiOkResponse({ type: [ApiTokenUsageResponse] })
  async usage(
    @CurrentUser() user: ValidatedUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.apiTokensService.usage(user.id, id);
  }
}
