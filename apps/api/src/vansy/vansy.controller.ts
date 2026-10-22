import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { StageAdminGuard } from 'src/stage/guards/stage-admin.guard';
import { LinkVansyQuizRequest } from './dto/requests.dto';
import { VansyService } from './vansy.service';

@ApiTags('vansy')
@Controller('vansy')
export class VansyController {
  constructor(private readonly vansy: VansyService) {}

  @Post('launch/author')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'A one-time URL into the Vansy quiz editor' })
  author(@CurrentUser() user: ValidatedUserDto) {
    return this.vansy.authorLaunch(user);
  }

  @Post('launch/manage/:quizId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  manage(
    @CurrentUser() user: ValidatedUserDto,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.vansy.manageLaunch(user, quizId);
  }

  @Get('quizzes/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  mine(@CurrentUser() user: ValidatedUserDto) {
    return this.vansy.myQuizzes(user);
  }

  @Get('stages/:stageId/quiz')
  stageQuiz(@Param('stageId', ParseIntPipe) stageId: number) {
    return this.vansy.stageQuiz(stageId);
  }

  @Put('stages/:stageId/quiz')
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  link(
    @CurrentUser() user: ValidatedUserDto,
    @Param('stageId', ParseIntPipe) stageId: number,
    @Body() body: LinkVansyQuizRequest,
  ) {
    return this.vansy.linkQuiz(user, stageId, body.quizId);
  }

  @Delete('stages/:stageId/quiz')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  unlink(@Param('stageId', ParseIntPipe) stageId: number) {
    return this.vansy.unlinkQuiz(stageId);
  }

  @Post('stages/:stageId/launch/take')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  take(
    @CurrentUser() user: ValidatedUserDto,
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.vansy.takeLaunch(user, stageId);
  }

  @Post('stages/:stageId/launch/proctor')
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  proctor(
    @CurrentUser() user: ValidatedUserDto,
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.vansy.staffLaunch(user, stageId, 'proctor');
  }

  @Post('stages/:stageId/launch/review')
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  review(
    @CurrentUser() user: ValidatedUserDto,
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    return this.vansy.staffLaunch(user, stageId, 'review');
  }

  @Post('stages/:stageId/finalize')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, StageAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Closes the quiz now; final standings arrive by webhook',
  })
  finalize(@Param('stageId', ParseIntPipe) stageId: number) {
    return this.vansy.finalize(stageId);
  }

  @Get('stages/:stageId/results')
  results(@Param('stageId', ParseIntPipe) stageId: number) {
    return this.vansy.results(stageId);
  }
}

@Controller('integrations/vansy')
export class VansyWebhookController {
  constructor(private readonly vansy: VansyService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('vansy-signature') signature?: string,
  ) {
    return this.vansy.receiveWebhook(req.rawBody, signature);
  }
}
