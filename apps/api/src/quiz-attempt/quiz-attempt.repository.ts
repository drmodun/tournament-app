import { Injectable, NotFoundException } from '@nestjs/common';
import {
  quizAttempt,
  quizAnswer,
  quiz,
  quizQuestion,
  quizOption,
  user,
} from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery, PaginationOnly } from 'src/base/query/baseQuery';
import { AnyPgSelectQueryBuilder, PgColumn } from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import {
  ColumnBaseConfig,
  ColumnDataType,
  and,
  eq,
  InferSelectModel,
  SQL,
  sql,
  InferInsertModel,
} from 'drizzle-orm';
import {
  QuizAttemptResponsesEnum,
  QuizAttemptResponseEnumType,
} from '@tournament-app/types';
import {
  CreateQuizAnswerRequest,
  UpdateQuizAnswerRequest,
} from './dto/requests.dto';
import { ActionResponsePrimary } from 'src/base/actions/actionResponses.dto';

@Injectable()
export class QuizAttemptDrizzleRepository extends PrimaryRepository<
  typeof quizAttempt,
  BaseQuery,
  InferSelectModel<typeof quizAttempt>
> {
  constructor() {
    super(quizAttempt);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: QuizAttemptResponseEnumType,
  ): TSelect {
    switch (typeEnum) {
      case QuizAttemptResponsesEnum.BASE:
        return query
          .leftJoin(quiz, eq(quizAttempt.quizId, quiz.id))
          .leftJoin(user, eq(quizAttempt.userId, user.id))
          .groupBy(quizAttempt.id, quiz.id);

      case QuizAttemptResponsesEnum.WITH_ANSWERS:
        return query
          .leftJoin(quiz, eq(quizAttempt.quizId, quiz.id))
          .leftJoin(user, eq(quizAttempt.userId, user.id))
          .leftJoin(quizAnswer, eq(quizAttempt.id, quizAnswer.quizAttemptId))
          .leftJoin(
            quizQuestion,
            eq(quizAnswer.quizQuestionId, quizQuestion.id),
          )
          .leftJoin(quizOption, eq(quizAnswer.selectedOptionId, quizOption.id))
          .groupBy(quizAttempt.id, quiz.id, quizAnswer.id);

      default:
        return this.conditionallyJoin(query, QuizAttemptResponsesEnum.BASE);
    }
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    const clauses = Object.entries(query).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => value !== undefined,
    );

    return clauses.map(([key, value]) => {
      switch (key) {
        case 'quizId':
          return eq(quizAttempt.quizId, value as number);
        case 'userId':
          return eq(quizAttempt.userId, value as number);
        case 'isSubmitted':
          return eq(quizAttempt.isSubmitted, value as boolean);
        default:
          return;
      }
    });
  }

  getMappingObject(responseEnum: QuizAttemptResponseEnumType) {
    switch (responseEnum) {
      case QuizAttemptResponsesEnum.BASE:
        return {
          id: quizAttempt.id,
          userId: quizAttempt.userId,
          quizId: quizAttempt.quizId,
          currentQuestion: quizAttempt.currentQuestion,
          endTime: quizAttempt.endTime,
          score: quizAttempt.score,
          isSubmitted: quizAttempt.isSubmitted,
          createdAt: quizAttempt.createdAt,
          quiz: sql`JSONB_BUILD_OBJECT(
            'id', ${quiz.id}, 
            'name', ${quiz.name},
            'timeLimitTotal', ${quiz.timeLimitTotal},
            'isTest', ${quiz.isTest},
            'description', ${quiz.description},
            'passingScore', ${quiz.passingScore}
          )`,
        };

      //TODO: test some otehr stuff in terms of consistency etc.
      case QuizAttemptResponsesEnum.WITH_ANSWERS:
        return {
          ...this.getMappingObject(QuizAttemptResponsesEnum.BASE),
          answers: sql`ARRAY_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', ${quizAnswer.id},
            'isFinal', ${quizAnswer.isFinal},
            'isCorrect', ${quizAnswer.isCorrect},
            'userId', ${quizAnswer.userId},
            'quizAttemptId', ${quizAnswer.quizAttemptId},
            'quizQuestionId', ${quizAnswer.quizQuestionId},
            'answer', ${quizAnswer.answer},
            'selectedOptionId', ${quizAnswer.selectedOptionId},
            'createdAt', ${quizAnswer.createdAt}
          )) FILTER (WHERE ${quizAnswer.id} IS NOT NULL)`,
        };
      default:
        return this.getMappingObject(QuizAttemptResponsesEnum.BASE);
    }
  }

  public sortRecord: Record<
    string,
    | PgColumn<ColumnBaseConfig<ColumnDataType, string>, object, object>
    | SQL<number>
  > = {
    createdAt: quizAttempt.createdAt,
    score: quizAttempt.score,
  };

  async createQuizAttempt(
    userId: number,
    quizId: number,
  ): Promise<{ id: number }> {
    const result = await db
      .insert(quizAttempt)
      .values({
        userId,
        quizId,
        currentQuestion: 0,
        score: 0,
        isSubmitted: false,
      } as InferInsertModel<typeof quizAttempt>)
      .returning({ id: quizAttempt.id });

    return result[0];
  }

  async submitQuizAttempt(
    attemptId: number,
    isSubmitted: boolean,
  ): Promise<{ id: number }> {
    const quizAttemptData = await db
      .select({
        id: quizAttempt.id,
        quizId: quizAttempt.quizId,
        isSubmitted: quizAttempt.isSubmitted,
      })
      .from(quizAttempt)
      .where(eq(quizAttempt.id, attemptId));

    if (!quizAttemptData.length) {
      throw new NotFoundException(
        `Quiz attempt with ID ${attemptId} not found`,
      );
    }

    if (quizAttemptData[0].isSubmitted) {
      return { id: attemptId };
    }

    // If we're submitting the attempt, we need to calculate the score
    if (isSubmitted) {
      // Mark the attempt as submitted and set end time
      const result = await db
        .update(quizAttempt)
        .set({
          isSubmitted: true,
          endTime: new Date(),
        } as Partial<InferInsertModel<typeof quizAttempt>>)
        .where(eq(quizAttempt.id, attemptId))
        .returning({ id: quizAttempt.id });

      // Calculate the final score
      await this.calculateAttemptScore(attemptId, quizAttemptData[0].quizId);

      return result[0];
    }

    return { id: attemptId };
  }

  async getQuizAttemptForUser(userId: number, quizId: number): Promise<any> {
    const result = await db
      .select({
        id: quizAttempt.id,
        isSubmitted: quizAttempt.isSubmitted,
      })
      .from(quizAttempt)
      .where(
        and(
          eq(quizAttempt.userId, userId),
          eq(quizAttempt.quizId, quizId),
          eq(quizAttempt.isSubmitted, false),
        ),
      )
      .orderBy(sql`${quizAttempt.createdAt} DESC`)
      .limit(1);

    return result.length ? result[0] : null;
  }

  async createAnswer(
    userId: number,
    attemptId: number,
    createAnswerDto: CreateQuizAnswerRequest,
  ): Promise<{ id: number }> {
    // Check if the attempt exists and if it belongs to the user
    const attemptData = await db
      .select({
        id: quizAttempt.id,
        userId: quizAttempt.userId,
        quizId: quizAttempt.quizId,
        isSubmitted: quizAttempt.isSubmitted,
      })
      .from(quizAttempt)
      .where(eq(quizAttempt.id, attemptId));

    if (!attemptData.length) {
      throw new NotFoundException(
        `Quiz attempt with ID ${attemptId} not found`,
      );
    }

    if (attemptData[0].userId !== userId) {
      throw new NotFoundException('Unauthorized access to attempt');
    }

    if (attemptData[0].isSubmitted) {
      throw new NotFoundException(
        'Cannot answer questions on a submitted attempt',
      );
    }

    // Check if there's already an answer for this question in this attempt
    const existingAnswer = await db
      .select({ id: quizAnswer.id })
      .from(quizAnswer)
      .where(
        and(
          eq(quizAnswer.quizAttemptId, attemptId),
          eq(quizAnswer.quizQuestionId, createAnswerDto.quizQuestionId),
        ),
      );

    if (existingAnswer.length) {
      // Update the existing answer
      return this.updateAnswer(existingAnswer[0].id, userId, {
        answer: createAnswerDto.answer,
        selectedOptionId: createAnswerDto.selectedOptionId,
      });
    }

    // Get the question to check if we should provide immediate feedback
    const questionData = await db
      .select({
        id: quizQuestion.id,
        isImmediateFeedback: quizQuestion.isImmediateFeedback,
        correctAnswers: quizQuestion.correctAnswers,
        type: quizQuestion.type,
      })
      .from(quizQuestion)
      .where(eq(quizQuestion.id, createAnswerDto.quizQuestionId));

    if (!questionData.length) {
      throw new NotFoundException(
        `Quiz question with ID ${createAnswerDto.quizQuestionId} not found`,
      );
    }

    // Determine if the answer is correct
    let isCorrect = false;
    const question = questionData[0];

    if (
      question.type === 'multiple_choice' &&
      createAnswerDto.selectedOptionId
    ) {
      // For multiple choice, check if the selected option is correct
      const optionData = await db
        .select({ isCorrect: quizOption.isCorrect })
        .from(quizOption)
        .where(eq(quizOption.id, createAnswerDto.selectedOptionId));

      if (optionData.length) {
        isCorrect = optionData[0].isCorrect;
      }
    } else if (question.correctAnswers) {
      // For other question types, check against correct answers
      const correctAnswers = question.correctAnswers.split(',');
      isCorrect = correctAnswers.includes(createAnswerDto.answer.trim());
    }

    // For immediate feedback questions, mark the answer as final
    const isFinal = question.isImmediateFeedback;

    // Insert the answer
    const result = await db
      .insert(quizAnswer)
      .values({
        userId,
        quizAttemptId: attemptId,
        quizQuestionId: createAnswerDto.quizQuestionId,
        answer: createAnswerDto.answer,
        selectedOptionId: createAnswerDto.selectedOptionId,
        isCorrect,
        isFinal,
      } as InferInsertModel<typeof quizAnswer>)
      .returning({ id: quizAnswer.id });

    if (isFinal) {
      await db
        .update(quizAttempt)
        .set({
          currentQuestion: sql`${quizAttempt.currentQuestion} + 1`,
        } as Partial<InferInsertModel<typeof quizAttempt>>)
        .where(eq(quizAttempt.id, attemptId));
    }

    return result[0];
  }

  // TODO: auth forbid some types of returns, forbid multiple retakes if they are false

  async updateAnswer(
    answerId: number,
    userId: number,
    updateAnswerDto: UpdateQuizAnswerRequest,
  ): Promise<{ id: number }> {
    const answerData = await db
      .select({
        id: quizAnswer.id,
        userId: quizAnswer.userId,
        quizQuestionId: quizAnswer.quizQuestionId,
        quizAttemptId: quizAnswer.quizAttemptId,
        isFinal: quizAnswer.isFinal,
      })
      .from(quizAnswer)
      .where(eq(quizAnswer.id, answerId));

    if (!answerData.length) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`);
    }

    if (answerData[0].userId !== userId) {
      throw new NotFoundException('Unauthorized access to answer');
    }

    if (answerData[0].isFinal) {
      throw new NotFoundException('Cannot update a final answer');
    }

    const attemptData = await db
      .select({ isSubmitted: quizAttempt.isSubmitted })
      .from(quizAttempt)
      .where(eq(quizAttempt.id, answerData[0].quizAttemptId));

    if (!attemptData.length || attemptData[0].isSubmitted) {
      throw new NotFoundException(
        'Cannot update answers on a submitted attempt',
      );
    }

    const questionData = await db
      .select({
        id: quizQuestion.id,
        isImmediateFeedback: quizQuestion.isImmediateFeedback,
        correctAnswers: quizQuestion.correctAnswers,
        type: quizQuestion.type,
      })
      .from(quizQuestion)
      .where(eq(quizQuestion.id, answerData[0].quizQuestionId));

    let isCorrect = false;
    const question = questionData[0];

    if (
      question.type === 'multiple_choice' &&
      updateAnswerDto.selectedOptionId
    ) {
      const optionData = await db
        .select({ isCorrect: quizOption.isCorrect })
        .from(quizOption)
        .where(eq(quizOption.id, updateAnswerDto.selectedOptionId));

      if (optionData.length) {
        isCorrect = optionData[0].isCorrect;
      }
    } else if (question.correctAnswers && updateAnswerDto.answer) {
      const correctAnswers = question.correctAnswers.split(',');
      isCorrect = correctAnswers.includes(updateAnswerDto.answer.trim());
    }

    const isFinal = question.isImmediateFeedback;

    const result = await db
      .update(quizAnswer)
      .set({
        answer: updateAnswerDto.answer,
        selectedOptionId: updateAnswerDto.selectedOptionId,
        isCorrect,
        isFinal,
      } as Partial<InferInsertModel<typeof quizAnswer>>)
      .where(eq(quizAnswer.id, answerId))
      .returning({ id: quizAnswer.id });

    if (isFinal) {
      await db
        .update(quizAttempt)
        .set({
          currentQuestion: sql`${quizAttempt.currentQuestion} + 1`,
        } as Partial<InferInsertModel<typeof quizAttempt>>)
        .where(eq(quizAttempt.id, answerData[0].quizAttemptId));
    }

    return result[0];
  }

  async checkIfAnswerIsFinal(answerId: number): Promise<boolean> {
    const answerData = await db
      .select({ isFinal: quizAnswer.isFinal })
      .from(quizAnswer)
      .where(eq(quizAnswer.id, answerId));

    return answerData[0].isFinal;
  }

  async getAnswer(
    attemptId: number,
    quizQuestionId: number,
  ): Promise<ActionResponsePrimary[]> {
    const answerData = await db
      .select({ id: quizAnswer.id })
      .from(quizAnswer)
      .where(
        and(
          eq(quizAnswer.quizAttemptId, attemptId),
          eq(quizAnswer.quizQuestionId, quizQuestionId),
        ),
      );

    return answerData;
  }

  async calculateAttemptScore(
    attemptId: number,
    quizId: number,
  ): Promise<void> {
    const answers = await db
      .select({
        id: quizAnswer.id,
        isCorrect: quizAnswer.isCorrect,
        quizQuestionId: quizAnswer.quizQuestionId,
      })
      .from(quizAnswer)
      .where(eq(quizAnswer.quizAttemptId, attemptId));

    const questions = await db
      .select({
        id: quizQuestion.id,
        points: quizQuestion.points,
      })
      .from(quizQuestion)
      .where(eq(quizQuestion.quizId, quizId));

    const questionPoints = questions.reduce((acc, q) => {
      acc[q.id] = q.points;
      return acc;
    }, {});

    let totalPoints = 0;
    for (const answer of answers) {
      if (answer.isCorrect) {
        totalPoints += questionPoints[answer.quizQuestionId] || 0;
      }
    }

    await db
      .update(quizAttempt)
      .set({
        score: totalPoints,
      } as Partial<InferInsertModel<typeof quizAttempt>>)
      .where(eq(quizAttempt.id, attemptId));
  }

  async getUserAttempts(
    userId: number,
    pagination?: PaginationOnly,
  ): Promise<any> {
    const limit = pagination?.pageSize || 10;
    const offset = pagination?.page ? (pagination.page - 1) * limit : 0;

    const query = db
      .select(this.getMappingObject(QuizAttemptResponsesEnum.BASE))
      .from(quizAttempt)
      .leftJoin(quiz, eq(quizAttempt.quizId, quiz.id))
      .where(eq(quizAttempt.userId, userId))
      .limit(limit)
      .offset(offset)
      .groupBy(quizAttempt.id, quiz.id);

    return await query;
  }

  async getQuizLeaderboard(
    quizId: number,
    pagination?: PaginationOnly,
  ): Promise<any> {
    const limit = pagination?.pageSize || 10;
    const offset = pagination?.page ? (pagination.page - 1) * limit : 0;

    const query = db
      .select({
        id: quizAttempt.id,
        userId: quizAttempt.userId,
        score: quizAttempt.score,
        endTime: quizAttempt.endTime,
        createdAt: quizAttempt.createdAt,
        userName: user.name,
        userProfilePicture: user.profilePicture,
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${quizAttempt.score} DESC, ${quizAttempt.endTime} ASC)`,
      })
      .from(quizAttempt)
      .leftJoin(user, eq(quizAttempt.userId, user.id))
      .where(
        and(eq(quizAttempt.quizId, quizId), eq(quizAttempt.isSubmitted, true)),
      )
      .orderBy(sql`${quizAttempt.score} DESC, ${quizAttempt.endTime} ASC`)
      .limit(limit)
      .offset(offset);

    const results = await query;

    const countQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quizAttempt)
      .where(
        and(eq(quizAttempt.quizId, quizId), eq(quizAttempt.isSubmitted, true)),
      );

    const countResult = await countQuery;
    const totalCount = countResult[0]?.count || 0;

    return {
      results,
      metadata: {
        total: totalCount,
        page: pagination?.page || 1,
        pageSize: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
