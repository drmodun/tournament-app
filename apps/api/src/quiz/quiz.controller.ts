import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizQuery,
} from './dto/requests.dto';
import {
  QuizResponse,
  QuizResponseExtended,
  QuizResponsesEnum,
} from './dto/responses.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { quizQueryExamples, quizResponses } from './dto/examples';
import { IQueryMetadata } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { QuizService } from './quiz.service';
import { CanEditQuizGuard } from './guards/can-edit-quiz.guard';

@ApiTags('quiz')
@ApiExtraModels(QuizResponse, QuizResponseExtended)
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @ApiExtraModels(QuizResponse, QuizResponseExtended)
  @Get('auto-complete/:search')
  @ApiOkResponse({
    description: 'Returns a list of quizzes that can be auto-completed',
    type: QuizResponse,
  })
  async autoComplete(
    @Param('search') search: string,
    @Query() query: PaginationOnly,
  ) {
    return await this.quizService.autoComplete(search, query);
  }

  @ApiExtraModels(QuizResponseExtended)
  @Get('detailed/:quizId')
  @UseGuards(JwtAuthGuard, CanEditQuizGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a detailed quiz',
    type: QuizResponseExtended,
  })
  async getDetailedQuiz(@Param('quizId', ParseIntPipe) id: number) {
    return await this.quizService.getDetailedQuiz(id);
  }

  @Get()
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: quizQueryExamples.responses,
      },
    },
  })
  async findAll(@Query() query: QuizQuery, @Req() req: Request) {
    const results = await this.quizService.findAll(query);

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

  @Get('authored')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a list of quizzes authored by the current user',
    type: QuizResponse,
  })
  async getAuthoredQuizzes(
    @CurrentUser() user: ValidatedUserDto,
    @Query() query: PaginationOnly,
  ) {
    return await this.quizService.getAuthoredQuizzes(user.id, query);
  }

  @Get(':quizId')
  @ApiOkResponse({
    schema: { examples: quizResponses },
  })
  async findOne(
    @Param('quizId', ParseIntPipe) id: number,
    @Query('responseType') responseType?: QuizResponsesEnum,
  ) {
    return await this.quizService.findOne(id, responseType);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new quiz',
    type: ActionResponsePrimary,
  })
  async create(
    @Body() createQuizDto: CreateQuizRequest,
    @CurrentUser() user: ValidatedUserDto,
  ) {
    return await this.quizService.create({
      ...createQuizDto,
      authorId: user.id,
    });
  }

  @Put(':quizId')
  @UseGuards(JwtAuthGuard, CanEditQuizGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates a quiz',
    type: ActionResponsePrimary,
  })
  async update(
    @Param('quizId', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizRequest,
  ) {
    return await this.quizService.update(id, updateQuizDto);
  }

  @Delete(':quizId')
  @UseGuards(JwtAuthGuard, CanEditQuizGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ActionResponsePrimary,
  })
  async remove(@Param('quizId', ParseIntPipe) id: number) {
    return await this.quizService.remove(id);
  }
}

// TODO: add specific endpoints for quiz questions and their options
