import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  quiz,
  quizQuestion,
  user,
  quizOption,
  quizAttempt,
  tags,
  quizTags,
} from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery, PaginationOnly } from 'src/base/query/baseQuery';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import {
  ColumnBaseConfig,
  ColumnDataType,
  eq,
  ilike,
  InferInsertModel,
  InferSelectModel,
  SQL,
  sql,
} from 'drizzle-orm';
import {
  QuizResponsesEnum,
  QuizReturnTypesEnumType,
} from '@tournament-app/types';
import { CreateQuizRequest, UpdateQuizRequest } from './dto/requests.dto';
import { CreateQuizQuestionDto } from './dto/question.dto';

@Injectable()
export class QuizDrizzleRepository extends PrimaryRepository<
  typeof quiz,
  BaseQuery,
  InferSelectModel<typeof quiz>
> {
  constructor() {
    super(quiz);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: QuizReturnTypesEnumType,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right', false>
    | TSelect {
    switch (typeEnum) {
      case QuizResponsesEnum.BASE:
        return query
          .leftJoin(user, eq(quiz.userId, user.id))
          .leftJoin(quizTags, eq(quiz.id, quizTags.quizId))
          .leftJoin(tags, eq(quizTags.tagId, tags.id))
          .groupBy(quiz.id);

      case QuizResponsesEnum.EXTENDED:
        return query
          .leftJoin(user, eq(quiz.userId, user.id))
          .leftJoin(quizTags, eq(quiz.id, quizTags.quizId))
          .leftJoin(tags, eq(quizTags.tagId, tags.id))
          .leftJoin(quizQuestion, eq(quiz.id, quizQuestion.quizId))
          .leftJoin(quizOption, eq(quizQuestion.id, quizOption.quizQuestionId))
          .groupBy(quiz.id);
      case QuizResponsesEnum.FOR_ATTEMPT:
        return query
          .leftJoin(quizQuestion, eq(quiz.id, quizQuestion.quizId))
          .leftJoin(quizOption, eq(quizQuestion.id, quizOption.quizQuestionId))
          .leftJoin(user, eq(quiz.userId, user.id))
          .leftJoin(quizTags, eq(quiz.id, quizTags.quizId))
          .leftJoin(tags, eq(quizTags.tagId, tags.id))
          .groupBy(quiz.id);
      default:
        return this.conditionallyJoin(query, QuizResponsesEnum.BASE);
    }
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    const clauses = Object.entries(query).filter(
      ([_, value]) => value !== undefined,
    );

    return clauses.map(([key, value]) => {
      switch (key) {
        case 'name':
          return ilike(quiz.name, `%${value}%`);
        case 'userId':
          return eq(quiz.userId, value as number);
        case 'matchupId':
          return eq(quiz.matchupId, value as number);
        case 'stageId':
          return eq(quiz.stageId, value as number);
        case 'isTest':
          return eq(quiz.isTest, value as boolean);
        case 'search':
          return ilike(quiz.name, `${value}%`);
        default:
          return;
      }
    });
  }

  getMappingObject(responseEnum: QuizReturnTypesEnumType) {
    switch (responseEnum) {
      case QuizResponsesEnum.BASE:
        return {
          id: quiz.id,
          name: quiz.name,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          timeLimitTotal: quiz.timeLimitTotal,
          passingScore: quiz.passingScore,
          isRetakeable: quiz.isRetakeable,
          isAnonymousAllowed: quiz.isAnonymousAllowed,
          description: quiz.description,
          matchupId: quiz.matchupId,
          stageId: quiz.stageId,
          coverImage: quiz.coverImage,
          tags: sql`ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT('id', ${tags.id}, 'name', ${tags.name})) FILTER (WHERE ${tags.id} IS NOT NULL)`,
          createdAt: quiz.createdAt,
          authorId: quiz.userId,
        };
      case QuizResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(QuizResponsesEnum.BASE),
          attempts: sql`(SELECT COUNT(*) FROM quiz_attempt WHERE quiz_attempt.quiz_id = ${quiz.id})`,
          averageScore: sql`(SELECT AVG(score) FROM quiz_attempt WHERE quiz_attempt.quiz_id = ${quiz.id})`,
          medianScore: sql`(SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) FROM quiz_attempt WHERE quiz_attempt.quiz_id = ${quiz.id})`,
          // passingScore is a percentage of the quiz's total points; only submitted attempts count
          passingRate: sql`(SELECT COUNT(*) FILTER (WHERE quiz_attempt.score * 100 >= ${quiz.passingScore} * (SELECT COALESCE(SUM(points), 0) FROM quiz_question WHERE quiz_question.quiz_id = ${quiz.id})) * 100.0 / NULLIF(COUNT(*), 0) FROM quiz_attempt WHERE quiz_attempt.quiz_id = ${quiz.id} AND quiz_attempt.is_submitted)`,
          isRandomizedQuestions: quiz.isRandomizedQuestions,
          isImmediateFeedback: quiz.isImmediateFeedback,
          isTest: quiz.isTest,
          questions: sql`ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', ${quizQuestion.id}, 
            'name', ${quizQuestion.question}, 
            'timeLimit', ${quizQuestion.timeLimit},
            'points', ${quizQuestion.points},
            'createdAt', ${quizQuestion.createdAt},
            'type', ${quizQuestion.type},
            'image', ${quizQuestion.questionImage},
            'isImmediateFeedback', ${quizQuestion.isImmediateFeedback},
            'correctAnswers', ${quizQuestion.correctAnswers},
            'explanation', ${quizQuestion.explanation},
            'options', (
              SELECT ARRAY_AGG(JSONB_BUILD_OBJECT(
                'id', qo.id,
                'option', qo.option,
                'isCorrect', qo.is_correct,
                'count', (SELECT COUNT(*) FROM quiz_answer qaa WHERE qaa.selected_option_id = qo.id)
              ))
              FROM quiz_option qo
              WHERE qo.quiz_question_id = ${quizQuestion.id}

            )
          )) FILTER (WHERE ${quizQuestion.id} IS NOT NULL)`,
          // TODO: refactor other drizzle queries to use this
        };
      case QuizResponsesEnum.FOR_ATTEMPT:
        return {
          ...this.getMappingObject(QuizResponsesEnum.EXTENDED),
          questions: sql`ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', ${quizQuestion.id}, 
            'name', ${quizQuestion.question}, 
            'timeLimit', ${quizQuestion.timeLimit},
            'points', ${quizQuestion.points},
            'type', ${quizQuestion.type},
            'image', ${quizQuestion.questionImage},
            'isImmediateFeedback', ${quizQuestion.isImmediateFeedback},
            'options', (
              SELECT ARRAY_AGG(JSONB_BUILD_OBJECT(
                'id', qo.id,
                'option', qo.option
              ) ORDER BY qo.id)
              FROM quiz_option qo
              WHERE qo.quiz_question_id = ${quizQuestion.id}
            )
          )) FILTER (WHERE ${quizQuestion.id} IS NOT NULL)`,
        };
      default:
        return this.getMappingObject(QuizResponsesEnum.BASE);
    }
  }

  async getAutoComplete(
    search: string,
    pageSize: number = 10,
    page: number = 1,
  ) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const query = db
      .select(this.getMappingObject(QuizResponsesEnum.BASE))
      .from(quiz)
      .leftJoin(quizTags, eq(quiz.id, quizTags.quizId))
      .leftJoin(tags, eq(quizTags.tagId, tags.id))
      .where(ilike(quiz.name, `%${search}%`))
      .limit(limit)
      .offset(offset)
      .groupBy(quiz.id);

    return await query;
  }

  public sortRecord: Record<
    string,
    | PgColumn<ColumnBaseConfig<ColumnDataType, string>, object, object>
    | SQL<number>
  >; // TODO: implement quiz sorting

  async getAuthoredQuizzes(userId: number, pagination?: PaginationOnly) {
    const limit = pagination?.pageSize || 10;
    const offset = pagination?.page ? (pagination.page - 1) * limit : 0;

    const query = db
      .select(this.getMappingObject(QuizResponsesEnum.BASE))
      .from(quiz)
      .leftJoin(quizTags, eq(quiz.id, quizTags.quizId))
      .leftJoin(tags, eq(quizTags.tagId, tags.id))
      .where(eq(quiz.userId, userId))
      .limit(limit)
      .offset(offset)
      .groupBy(quiz.id);

    return await query;
  }

  async update(id: number, updateRequest: UpdateQuizRequest) {
    return db.transaction(async (tx) => {
      // Locked, so an attempt cannot start between the check below and the questions being replaced
      const quizToUpdate = await tx
        .select()
        .from(quiz)
        .where(eq(quiz.id, id))
        .for('update');

      if (!quizToUpdate.length || quizToUpdate.length === 0) {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }

      const { questions, tags: tagIds, ...rest } = updateRequest;
      // Only what is a column of the quiz
      const fields = Object.fromEntries(
        Object.entries(rest).filter(([key]) => key in quiz),
      );

      // Replacing the questions deletes the answers given to them, so only a quiz nobody has
      // attempted can have its questions replaced; leaving them out keeps them
      if (questions) {
        const [attempted] = await tx
          .select({ id: quizAttempt.id })
          .from(quizAttempt)
          .where(eq(quizAttempt.quizId, id))
          .limit(1);

        if (attempted) {
          throw new BadRequestException(
            'The questions of a quiz that has been attempted cannot be replaced',
          );
        }

        await tx.delete(quizQuestion).where(eq(quizQuestion.quizId, id));

        for (const question of questions) {
          await this.insertQuestion(tx, id, question);
        }
      }

      if (tagIds) {
        await this.setTags(tx, id, tagIds);
      }

      if (!Object.keys(fields).length) {
        return { id };
      }

      const updatedQuiz = await tx
        .update(quiz)
        .set(fields)
        .where(eq(quiz.id, id))
        .returning({ id: quiz.id });

      return updatedQuiz[0];
    });
  }

  async create(createRequest: CreateQuizRequest & { authorId: number }) {
    return await db.transaction(async (tx) => {
      const quizToCreate = await tx
        .insert(quiz)
        .values({
          ...createRequest,
          userId: createRequest.authorId,
        })
        .returning({ id: quiz.id });

      for (const question of createRequest.questions) {
        await this.insertQuestion(tx, quizToCreate[0].id, question);
      }

      await this.setTags(tx, quizToCreate[0].id, createRequest.tags ?? []);

      return quizToCreate[0];
    });
  }

  // The quiz's tags are exactly these tag ids
  private async setTags(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    quizId: number,
    tagIds: number[],
  ) {
    await tx.delete(quizTags).where(eq(quizTags.quizId, quizId));

    const unique = [...new Set(tagIds)];

    if (unique.length) {
      await tx
        .insert(quizTags)
        .values(unique.map((tagId) => ({ quizId, tagId })));
    }
  }

  // The request names the type and image questionType and image; questions without options (short
  // answers and the like) have none to insert
  private async insertQuestion(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    quizId: number,
    {
      questionType,
      image,
      options,
      correctAnswers,
      ...question
    }: CreateQuizQuestionDto,
  ) {
    const [created] = await tx
      .insert(quizQuestion)
      .values({
        ...question,
        quizId,
        type: questionType,
        questionImage: image,
        correctAnswers: correctAnswers?.join(','),
      } as InferInsertModel<typeof quizQuestion>)
      .returning({ id: quizQuestion.id });

    if (options?.length) {
      await tx.insert(quizOption).values(
        options.map(({ option, isCorrect }) => ({
          option,
          isCorrect,
          quizQuestionId: created.id,
        })),
      );
    }
  }
}
