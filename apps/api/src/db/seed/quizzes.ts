import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { InferInsertModel, sql, eq } from 'drizzle-orm';
import { quizQuestionTypeEnum } from '@tournament-app/types';
import { seedCount } from './seedCount';

export async function createQuizzes() {
  console.log('Creating quizzes...');
  const NUM_QUIZZES_TO_CREATE = seedCount('SEED_QUIZZES_COUNT', 30);

  const users = await db.select().from(tables.user);
  const stages = await db.select().from(tables.stage);
  const matchups = await db.select().from(tables.matchup);
  const tags = await db.select().from(tables.tags);

  // Create quiz topics as tags if they don't exist
  const quizTopics = [
    'Programming',
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Literature',
    'Sports',
    'Gaming',
    'Technology',
    'General Knowledge',
  ];

  const existingTagNames = new Set(tags.map((tag) => tag.name));
  const newTagsToCreate = quizTopics.filter(
    (topic) => !existingTagNames.has(topic),
  );

  let quizTags = [...tags];

  if (newTagsToCreate.length > 0) {
    const newTags = newTagsToCreate.map((name, index) => ({
      id: tags.length + index + 1,
      name,
    }));

    await db.insert(tables.tags).values(newTags);

    // Update the sequence
    if (newTags.length > 0) {
      await db.execute(
        sql`ALTER SEQUENCE tags_id_seq RESTART WITH ${sql.raw(
          String(tags.length + newTags.length + 1),
        )}`,
      );
    }

    // Fetch all tags again
    quizTags = await db.select().from(tables.tags);
  }

  // Prepare quiz data
  const quizzes = [];
  for (let i = 0; i < NUM_QUIZZES_TO_CREATE; i++) {
    const startDate = faker.date.future();
    const isRetakeable = faker.datatype.boolean();
    const isAnonymousAllowed = faker.datatype.boolean();
    const isImmediateFeedback = faker.datatype.boolean();
    const isRandomizedQuestions = faker.datatype.boolean();
    const hasMatchup = faker.datatype.boolean() && i < matchups.length;
    const hasStage = faker.datatype.boolean() && i < stages.length;
    const isTest = faker.datatype.boolean();

    quizzes.push({
      id: i + 1,
      name: faker.lorem.sentence().slice(0, 50),
      startDate,
      timeLimitTotal: faker.number.int({ min: 300, max: 3600 }),
      passingScore: faker.number.int({ min: 60, max: 90 }),
      maxAttempts: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: 5 })
        : null,
      isImmediateFeedback,
      isRandomizedQuestions,
      isAnonymousAllowed,
      isRetakeable: isRetakeable,
      description: faker.lorem.paragraph(),
      matchupId: hasMatchup ? matchups[i].id : null,
      stageId: hasStage ? stages[i].id : null,
      isTest,
      coverImage: faker.image.url(),
      userId: faker.helpers.arrayElement(users).id,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  // Insert quizzes
  await db.insert(tables.quiz).values(quizzes);

  // Reset sequence
  await db.execute(
    sql`ALTER SEQUENCE quiz_id_seq RESTART WITH ${sql.raw(
      String(NUM_QUIZZES_TO_CREATE + 1),
    )}`,
  );

  // Create quiz tags relationships
  const quizTagsRelations = [];
  for (const quiz of quizzes) {
    // Assign 1-3 tags per quiz
    const numTags = faker.number.int({ min: 1, max: 3 });
    const shuffledTags = [...quizTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, numTags);

    for (const tag of selectedTags) {
      quizTagsRelations.push({
        quizId: quiz.id,
        tagId: tag.id,
      });
    }
  }

  // Insert quiz tags
  if (quizTagsRelations.length > 0) {
    await db.insert(tables.quizTags).values(quizTagsRelations);
  }

  // Create quiz questions
  await createQuizQuestions(quizzes);

  return quizzes;
}

async function createQuizQuestions(quizzes) {
  console.log('Creating quiz questions...');
  const questions = [];
  let questionId = 1;

  // Question templates for different types
  const multipleChoiceTemplates = [
    'What is the capital of {country}?',
    'Which of the following is {category}?',
    'Who invented {invention}?',
    'Which year did {event} happen?',
    'What is the primary function of {concept}?',
  ];

  const trueFalseTemplates = [
    '{statement} is true.',
    '{person} invented {invention}.',
    '{country} is in {continent}.',
    '{event} happened in {year}.',
    '{fact} affects {subject}.',
  ];

  const shortAnswerTemplates = [
    'Name three {category}.',
    'Explain the concept of {concept}.',
    'What are the consequences of {event}?',
    'Describe the relationship between {subject1} and {subject2}.',
    'How does {process} work?',
  ];

  // Define available question types
  const questionTypes = [
    quizQuestionTypeEnum.MULTIPLE_CHOICE,
    quizQuestionTypeEnum.TRUE_FALSE,
    quizQuestionTypeEnum.SHORT_ANSWER,
    quizQuestionTypeEnum.HOTSPOT,
    quizQuestionTypeEnum.PROGRAMMING,
  ];

  // Create 5-15 questions per quiz
  for (const quiz of quizzes) {
    const numQuestions = faker.number.int({ min: 5, max: 15 });

    for (let i = 0; i < numQuestions; i++) {
      const questionType = faker.helpers.arrayElement(questionTypes);
      let questionTemplate;

      // Get appropriate template based on question type
      switch (questionType) {
        case quizQuestionTypeEnum.MULTIPLE_CHOICE:
          questionTemplate = faker.helpers.arrayElement(
            multipleChoiceTemplates,
          );
          break;
        case quizQuestionTypeEnum.TRUE_FALSE:
          questionTemplate = faker.helpers.arrayElement(trueFalseTemplates);
          break;
        case quizQuestionTypeEnum.SHORT_ANSWER:
        case quizQuestionTypeEnum.ORDER:
        case quizQuestionTypeEnum.HOTSPOT:
        case quizQuestionTypeEnum.PROGRAMMING:
          questionTemplate = faker.helpers.arrayElement(shortAnswerTemplates);
          break;
        default:
          questionTemplate = faker.helpers.arrayElement(
            multipleChoiceTemplates,
          );
      }

      // Replace placeholders in templates
      const question = questionTemplate
        .replace('{country}', faker.location.country())
        .replace('{category}', faker.commerce.department())
        .replace('{invention}', faker.commerce.productName())
        .replace('{event}', faker.lorem.words(3))
        .replace('{concept}', faker.lorem.word())
        .replace('{statement}', faker.lorem.sentence())
        .replace('{person}', faker.person.fullName())
        .replace(
          '{continent}',
          faker.helpers.arrayElement([
            'Europe',
            'Asia',
            'Africa',
            'North America',
            'South America',
            'Australia',
            'Antarctica',
          ]),
        )
        .replace('{year}', faker.date.past().getFullYear().toString())
        .replace('{fact}', faker.lorem.sentence())
        .replace('{subject}', faker.lorem.word())
        .replace('{topic}', faker.lorem.word())
        .replace('{subject1}', faker.lorem.word())
        .replace('{subject2}', faker.lorem.word())
        .replace('{discovery}', faker.lorem.word())
        .replace('{field}', faker.commerce.department())
        .replace('{process}', faker.lorem.word());

      // Generate appropriate correct answers based on question type
      let correctAnswers = [];
      if (questionType === quizQuestionTypeEnum.TRUE_FALSE) {
        correctAnswers = [faker.datatype.boolean() ? 'True' : 'False'];
      } else if (
        questionType === quizQuestionTypeEnum.SHORT_ANSWER ||
        questionType === quizQuestionTypeEnum.ORDER ||
        questionType === quizQuestionTypeEnum.HOTSPOT
      ) {
        correctAnswers = [faker.lorem.sentence()];
      } else if (questionType === quizQuestionTypeEnum.PROGRAMMING) {
        correctAnswers = [faker.lorem.paragraph()];
      }

      questions.push({
        id: questionId,
        quizId: quiz.id,
        question,
        questionImage: faker.datatype.boolean() ? faker.image.url() : null,
        type: questionType,
        order: i + 1,
        timeLimit: faker.number.int({ min: 30, max: 300 }),
        points: faker.number.int({ min: 1, max: 10 }),
        explanation: faker.lorem.paragraph(),
        isImmediateFeedback: quiz.isImmediateFeedback,
        correctAnswers: correctAnswers.join(','),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      questionId++;
    }
  }

  // Insert questions in batches to avoid potential issues
  const BATCH_SIZE = 50;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    await db.insert(tables.quizQuestion).values(batch);
  }

  // Reset sequence
  await db.execute(
    sql`ALTER SEQUENCE quiz_question_id_seq RESTART WITH ${sql.raw(
      String(questionId),
    )}`,
  );

  // Create options for multiple choice questions
  await createQuizOptions(
    questions.filter(
      (q) =>
        q.type === quizQuestionTypeEnum.MULTIPLE_CHOICE ||
        q.type === quizQuestionTypeEnum.TRUE_FALSE,
    ),
  );

  return questions;
}

async function createQuizOptions(questions) {
  console.log('Creating quiz options...');
  const options = [];
  let optionId = 1;

  for (const question of questions) {
    // For true/false questions, just create two options
    if (question.type === quizQuestionTypeEnum.TRUE_FALSE) {
      const correctOption =
        question.correctAnswers === 'True' ? 'True' : 'False';

      options.push({
        id: optionId++,
        quizQuestionId: question.id,
        option: 'True',
        isCorrect: correctOption === 'True',
        createdAt: new Date(),
      });

      options.push({
        id: optionId++,
        quizQuestionId: question.id,
        option: 'False',
        isCorrect: correctOption === 'False',
        createdAt: new Date(),
      });
    }
    // For multiple choice questions, create 3-5 options
    else if (question.type === quizQuestionTypeEnum.MULTIPLE_CHOICE) {
      const numOptions = faker.number.int({ min: 3, max: 5 });
      const correctOptionIndex = faker.number.int({
        min: 0,
        max: numOptions - 1,
      });

      for (let i = 0; i < numOptions; i++) {
        options.push({
          id: optionId++,
          quizQuestionId: question.id,
          option: faker.lorem.sentence(),
          isCorrect: i === correctOptionIndex,
          createdAt: new Date(),
        });
      }

      // Update correctAnswers for the question
      const correctOption = options.find(
        (o) => o.quizQuestionId === question.id && o.is_correct,
      );
      if (correctOption) {
        await db
          .update(tables.quizQuestion)
          .set({ correctAnswers: correctOption.option } as Partial<
            InferInsertModel<typeof tables.quizQuestion>
          >)
          .where(eq(tables.quizQuestion.id, question.id));
      }
    }
  }

  // Insert options in batches to avoid potential issues
  const BATCH_SIZE = 100;
  for (let i = 0; i < options.length; i += BATCH_SIZE) {
    const batch = options.slice(i, i + BATCH_SIZE);
    await db.insert(tables.quizOption).values(batch);
  }

  // Reset sequence
  await db.execute(
    sql`ALTER SEQUENCE quiz_option_id_seq RESTART WITH ${sql.raw(
      String(optionId),
    )}`,
  );

  return options;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

type SeededQuizAttempt = {
  id: number;
  userId: number;
  quizId: number;
  currentQuestion: number;
  endTime: Date | null;
  score: number;
  isSubmitted: boolean;
  createdAt: Date;
};

function buildQuizAttempt(
  id: number,
  userId: number,
  quiz: typeof tables.quiz.$inferSelect,
): SeededQuizAttempt {
  const isSubmitted = faker.datatype.boolean();
  const startTime = faker.date.between({
    from: quiz.startDate,
    to: new Date(quiz.startDate.getTime() + 30 * DAY_IN_MS),
  });
  const endTime = isSubmitted
    ? faker.date.between({
        from: startTime,
        to: new Date(startTime.getTime() + 30 * DAY_IN_MS),
      })
    : null;

  return {
    id,
    userId,
    quizId: quiz.id,
    currentQuestion: isSubmitted ? faker.number.int({ min: 0, max: 15 }) : 0,
    endTime,
    score: isSubmitted ? faker.number.int({ min: 0, max: 100 }) : 0,
    isSubmitted,
    createdAt: startTime,
  };
}

export async function createQuizAttempts() {
  console.log('Creating quiz attempts...');
  const users = await db.select().from(tables.user);
  const quizzes = await db.select().from(tables.quiz);

  const attempts: SeededQuizAttempt[] = [];
  let attemptId = 1;

  // For each quiz, create attempts for ~30% of users
  for (const quiz of quizzes) {
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(
      0,
      Math.floor(users.length * 0.3),
    );

    for (const user of selectedUsers) {
      // Create 1-3 attempts per user if quiz is retakeable
      const numAttemptsPerUser = quiz.isRetakeable
        ? faker.number.int({ min: 1, max: 3 })
        : 1;

      for (let i = 0; i < numAttemptsPerUser; i++) {
        attempts.push(buildQuizAttempt(attemptId++, user.id, quiz));
      }
    }
  }

  if (attempts.length > 0) {
    await db.insert(tables.quizAttempt).values(attempts);
    await restartSequence('quiz_attempt_id_seq', attemptId);
  }

  return attempts;
}

function restartSequence(sequence: string, nextValue: number) {
  return db.execute(
    sql<string>`ALTER SEQUENCE ${sql.raw(sequence)} RESTART WITH ${sql.raw(
      String(nextValue),
    )}`,
  );
}

function groupBy<T>(items: T[], getKey: (item: T) => number) {
  const groups: Record<number, T[]> = {};

  for (const item of items) {
    (groups[getKey(item)] ??= []).push(item);
  }

  return groups;
}

type QuizQuestion = typeof tables.quizQuestion.$inferSelect;
type QuizOption = typeof tables.quizOption.$inferSelect;

// Picks what a simulated user answered, and whether that was right
function pickAnswer(question: QuizQuestion, questionOptions: QuizOption[]) {
  const isChoiceQuestion =
    question.type === 'multiple_choice' || question.type === 'true_false';

  if (isChoiceQuestion) {
    const selectedOption = faker.helpers.arrayElement(questionOptions) as any;

    if (!selectedOption) {
      return { answer: '', selectedOptionId: null, isCorrect: false };
    }

    return {
      answer: selectedOption.option,
      selectedOptionId: selectedOption.id,
      isCorrect: selectedOption.isCorrect,
    };
  }

  const answer = faker.lorem.sentence();

  if (!question.correctAnswers) {
    return { answer, selectedOptionId: null, isCorrect: false };
  }

  const isCorrect =
    faker.datatype.boolean() &&
    faker.helpers.arrayElement([true, false, false]); // 33% chance of correct answer

  return {
    answer: isCorrect
      ? faker.helpers.arrayElement(question.correctAnswers.split(','))
      : answer,
    selectedOptionId: null,
    isCorrect,
  };
}

function buildAttemptAnswers(
  attempt: SeededQuizAttempt,
  quizQuestions: QuizQuestion[],
  optionsByQuestion: Record<number, QuizOption[]>,
  nextAnswerId: () => number,
) {
  const numAnswers = attempt.isSubmitted
    ? quizQuestions.length
    : faker.number.int({ min: 1, max: quizQuestions.length });

  return quizQuestions.slice(0, numAnswers).map((question) => ({
    id: nextAnswerId(),
    userId: attempt.userId,
    quizAttemptId: attempt.id,
    quizQuestionId: question.id,
    ...pickAnswer(question, optionsByQuestion[question.id] || []),
    isFinal: question.isImmediateFeedback || attempt.isSubmitted,
    createdAt: faker.date.between({
      from: attempt.createdAt,
      to:
        attempt.endTime ||
        new Date(attempt.createdAt.getTime() + 30 * DAY_IN_MS),
    }),
  }));
}

export async function createQuizAnswers(attempts: SeededQuizAttempt[]) {
  console.log('Creating quiz answers...');
  const questions = await db.select().from(tables.quizQuestion);
  const options = await db.select().from(tables.quizOption);
  let answerId = 1;

  const questionsByQuiz = groupBy(questions, (question) => question.quizId);
  const optionsByQuestion = groupBy(options, (option) => option.quizQuestionId);

  // Skip some non-submitted attempts
  const answeredAttempts = attempts.filter(
    (attempt) => attempt.isSubmitted || faker.datatype.boolean(),
  );

  const answers = answeredAttempts.flatMap((attempt) =>
    buildAttemptAnswers(
      attempt,
      questionsByQuiz[attempt.quizId] || [],
      optionsByQuestion,
      () => answerId++,
    ),
  );

  if (answers.length > 0) {
    // Insert answers in batches to avoid memory issues
    const BATCH_SIZE = 100;
    for (let i = 0; i < answers.length; i += BATCH_SIZE) {
      await db
        .insert(tables.quizAnswer)
        .values(answers.slice(i, i + BATCH_SIZE));
    }

    await restartSequence('quiz_answer_id_seq', answerId);
  }

  // Update attempt scores for submitted attempts
  const pointsByQuestion = new Map(
    questions.map((question) => [question.id, question.points || 0]),
  );

  for (const attempt of attempts.filter((attempt) => attempt.isSubmitted)) {
    const totalScore = answers
      .filter(
        (answer) => answer.quizAttemptId === attempt.id && answer.isCorrect,
      )
      .reduce(
        (total, answer) =>
          total + (pointsByQuestion.get(answer.quizQuestionId) ?? 0),
        0,
      );

    await db
      .update(tables.quizAttempt)
      .set({
        score: totalScore,
        isSubmitted: true,
        endTime: new Date(),
      } as Partial<InferInsertModel<typeof tables.quizAttempt>>)
      .where(eq(tables.quizAttempt.id, attempt.id));
  }
}
