import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
  NotImplementedException,
} from '@nestjs/common';
import {
  QuizResponsesEnum,
  IQuizResponse,
  QuizReturnTypesEnumType,
  BaseQuizResponse,
} from '@tournament-app/types';
import {
  CreateQuizRequest,
  QuizQuery,
  UpdateQuizRequest,
} from './dto/requests.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { QuizDrizzleRepository } from './quiz.repository';

@Injectable()
export class QuizService {
  constructor(private readonly repository: QuizDrizzleRepository) {}

  async create(createQuizDto: CreateQuizRequest & { authorId: number }) {
    const quiz = await this.repository.create(createQuizDto);
    if (!quiz) {
      throw new UnprocessableEntityException('Quiz creation failed');
    }

    return quiz;
  }

  async findAll<TResponseType extends IQuizResponse>(
    query: QuizQuery,
  ): Promise<TResponseType[]> {
    const { responseType = QuizResponsesEnum.BASE, ...queryParams } = query;

    if (responseType == QuizResponsesEnum.EXTENDED) {
      throw new NotImplementedException(
        'Extended response type not allowed from this endpoint',
      );
    }

    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async getDetailedQuiz(id: number) {
    const results = await this.repository.getSingleQuery(
      id,
      QuizResponsesEnum.EXTENDED,
    );
    return results;
  }

  async findOne<TResponseType extends BaseQuizResponse>(
    id: number,
    responseType: QuizReturnTypesEnumType = QuizResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results.length) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateQuizDto: UpdateQuizRequest) {
    const updatedQuiz = await this.repository.update(id, updateQuizDto);
    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return updatedQuiz;
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return action[0];
  }

  async autoComplete(
    search: string,
    query?: PaginationOnly,
  ): Promise<IQuizResponse[]> {
    const results = await this.repository.getAutoComplete(
      search,
      query?.pageSize,
      query?.page,
    );

    return results as unknown as IQuizResponse[];
  }

  async getAuthoredQuizzes(userId: number, pagination?: PaginationOnly) {
    const quizzes = await this.repository.getAuthoredQuizzes(
      userId,
      pagination,
    );
    return quizzes;
  }

  async checkAuthor(quizId: number, userId: number) {
    const quiz = await this.repository.getSingleQuery(quizId);

    if (!quiz.length || !quiz[0]) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    if (quiz[0].authorId !== userId) {
      throw new ForbiddenException('You are not the author of this quiz');
    }
  }
}
