import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import {
  CreateQuizAnswerRequest,
  SubmitQuizAttemptRequest,
  QuizAttemptQuery,
  UpdateQuizAnswerRequest,
} from './dto/requests.dto';
import {
  QuizAnswerResponse,
  QuizAttemptResponse,
  QuizAttemptWithAnswersResponse,
  QuizLeaderboardResponse,
} from './dto/responses.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { quizAttemptExamples } from './dto/examples';
import {
  CreateQuizAttemptDto,
  IQueryMetadata,
  QuizAttemptResponsesEnum,
} from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { QuizAttemptService } from './quiz-attempt.service';
import { CanAccessAttemptGuard } from './guards/can-access-attempt.guard';
import { CanAttemptGuard } from './guards/can-attempt.guard';
import { CanSubmitAnswerGuard } from './guards/can-submit-answer.guard';

@ApiTags('quiz-attempt')
@ApiExtraModels(
  QuizAttemptResponse,
  QuizAttemptWithAnswersResponse,
  QuizAnswerResponse,
  QuizLeaderboardResponse,
)
@Controller('quiz-attempt')
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: {
          basic: {
            value: quizAttemptExamples.responses.basic,
          },
        },
      },
    },
  })
  async findAll(
    @Query() query: QuizAttemptQuery,
    @Req() req: Request,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    if (user.role !== 'admin') {
      query.userId = user.id;
    }

    const results = await this.quizAttemptService.findAll(query);

    const metadata: IQueryMetadata = MetadataMaker.makeMetadataFromQuery(
      query,
      results,
      req.url,
    );

    return {
      results,
      metadata,
    };
  }

  @Get('my-attempts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a list of quiz attempts made by the current user',
    type: QuizAttemptResponse,
  })
  async getMyAttempts(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: PaginationOnly,
  ) {
    return await this.quizAttemptService.getUserAttempts(user.id, query);
  }

  @Get(':attemptId')
  @UseGuards(JwtAuthGuard, CanAccessAttemptGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a quiz attempt by ID',
    schema: { example: quizAttemptExamples.responses.basic },
  })
  async findOne(
    @Param('attemptId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: QuizAttemptResponsesEnum,
  ) {
    return await this.quizAttemptService.findOne(id, responseType);
  }

  @Post(':quizId')
  @UseGuards(JwtAuthGuard, CanAttemptGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new quiz attempt',
    type: ActionResponsePrimary,
  })
  async create(
    @Body() createQuizAttemptDto: CreateQuizAttemptDto,
    @Param('quizId', ParseIntPipe) quizId: number,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.quizAttemptService.create({
      ...createQuizAttemptDto,
      userId: user.id,
      quizId,
    });
  }

  @Put(':attemptId/submit')
  @UseGuards(JwtAuthGuard, CanAccessAttemptGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Submits a quiz attempt',
    type: ActionResponsePrimary,
  })
  async submitAttempt(
    @Param('attemptId', ParseIntPipe) id: number,
    @Body() submitQuizAttemptDto: SubmitQuizAttemptRequest,
  ) {
    return await this.quizAttemptService.submitAttempt(
      id,
      submitQuizAttemptDto,
    );
  }

  @Post('/answers/:attemptId/:questionId')
  @UseGuards(JwtAuthGuard, CanSubmitAnswerGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new answer for a quiz attempt',
    type: ActionResponsePrimary,
  })
  async createAnswer(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() createAnswerDto: CreateQuizAnswerRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.quizAttemptService.createAnswer(attemptId, user.id, {
      ...createAnswerDto,
      quizQuestionId: questionId,
      attemptId,
    });
  }

  @Put('answers/:attemptId/:answerId')
  @UseGuards(JwtAuthGuard, CanSubmitAnswerGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates an answer',
    type: ActionResponsePrimary,
  })
  async updateAnswer(
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body() updateAnswerDto: UpdateQuizAnswerRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.quizAttemptService.updateAnswer(
      answerId,
      user.id,
      updateAnswerDto,
    );
  }

  @Get('leaderboard/:quizId')
  @ApiOkResponse({
    description:
      'Returns a leaderboard of users who have completed the quiz, sorted by score and time',
    type: QuizLeaderboardResponse,
  })
  async getQuizLeaderboard(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Query() pagination: PaginationOnly,
  ) {
    return await this.quizAttemptService.getQuizLeaderboard(quizId, pagination);
  }
}
