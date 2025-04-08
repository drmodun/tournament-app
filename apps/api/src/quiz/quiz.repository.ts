import { Injectable, NotFoundException } from '@nestjs/common';
import {
  quiz,
  quizQuestion,
  user,
  quizOption,
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
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          passingRate: sql`(SELECT COUNT(*) * 100.0 / NULLIF(COUNT(*), 0) FROM quiz_attempt WHERE quiz_attempt.quiz_id = ${quiz.id} AND quiz_attempt.score >= ${quiz.passingScore})`,
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
                'option', qo.option,
                'isCorrect', qo.is_correct,
              ))
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
      const quizToUpdate = await tx.select().from(quiz).where(eq(quiz.id, id));

      if (!quizToUpdate.length) {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }

      await tx.delete(quizQuestion).where(eq(quizQuestion.quizId, id));

      for (const question of updateRequest.questions) {
        const questionId = await tx
          .insert(quizQuestion)
          .values({
            ...question,
            quizId: id,
            correctAnswers: question.correctAnswers?.join(','),
          } as InferInsertModel<typeof quizQuestion>)
          .returning({ id: quizQuestion.id });

        await tx
          .delete(quizOption)
          .where(eq(quizOption.quizQuestionId, questionId[0].id));

        await tx.insert(quizOption).values(
          question.options.map((option) => ({
            ...option,
            quizQuestionId: questionId[0].id,
          })),
        );
      }

      const updatedQuiz = await tx
        .update(quiz)
        .set(updateRequest)
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
        const questionId = await tx
          .insert(quizQuestion)
          .values({
            ...question,
            quizId: quizToCreate[0].id,
            correctAnswers: question.correctAnswers?.join(','),
          } as InferInsertModel<typeof quizQuestion>)
          .returning({ id: quizQuestion.id });

        await tx.insert(quizOption).values(
          question.options.map((option) => ({
            ...option,
            quizQuestionId: questionId[0].id,
          })),
        );
      }
      return quizToCreate[0];
    });
  }
}
