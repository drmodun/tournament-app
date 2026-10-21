import { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { db } from '../src/db/db';
import { quizAttempt, quizQuestion, quizTags, tags } from '../src/db/schema';
import { createApp, loginAs } from './helpers/tournamentRun';

// The contract is written down in docs/features/quizzes.md. Quizzes are authored and taken over HTTP
// by ordinary users; times are moved in the database where a test would otherwise have to wait.
describe('Quizzes and attempts (e2e)', () => {
  let app: INestApplication;
  let tokens: { admin: string; author: string; taker: string; other: string };
  let users: { author: number; taker: number; other: number };

  beforeAll(async () => {
    app = await createApp();
    users = { author: 20, taker: 21, other: 22 };
    tokens = {
      admin: await loginAs(app, 1),
      author: await loginAs(app, users.author),
      taker: await loginAs(app, users.taker),
      other: await loginAs(app, users.other),
    };
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const as = (req: request.Test, token?: string) =>
    token ? req.set('Authorization', `Bearer ${token}`) : req;

  const minutes = (n: number) => new Date(Date.now() + n * 60000);

  const questions = () => [
    {
      question: 'Capital of France?',
      questionType: 'multiple_choice',
      points: 2,
      image: null,
      options: [
        { option: 'Paris', isCorrect: true },
        { option: 'Rome', isCorrect: false },
      ],
    },
    {
      question: 'The sky is blue',
      questionType: 'true_false',
      points: 1,
      image: null,
      correctAnswers: ['true'],
      options: [
        { option: 'true', isCorrect: true },
        { option: 'false', isCorrect: false },
      ],
    },
    {
      question: 'Largest planet?',
      questionType: 'short_answer',
      points: 3,
      image: null,
      correctAnswers: ['Jupiter'],
    },
  ];

  async function createQuiz(overrides: Record<string, unknown> = {}) {
    const created = await as(http().post('/quiz'), tokens.author)
      .send({
        name: `Quiz ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: 'A quiz made by the e2e suite',
        startDate: minutes(-1),
        tags: [],
        isTest: false,
        isRetakeable: false,
        isAnonymousAllowed: false,
        questions: questions(),
        ...overrides,
      })
      .expect(201);

    const detailed = await as(
      http().get(`/quiz/detailed/${created.body.id}`),
      tokens.author,
    ).expect(200);
    const quiz = (
      Array.isArray(detailed.body) ? detailed.body[0] : detailed.body
    ) as {
      questions: {
        id: number;
        name: string;
        options: { id: number; option: string; isCorrect: boolean }[] | null;
      }[];
    };

    return { id: created.body.id as number, questions: quiz.questions };
  }

  const startAttempt = (quizId: number, token = tokens.taker) =>
    as(http().post(`/quiz-attempt/${quizId}`), token).send({});

  const current = (attemptId: number, token = tokens.taker) =>
    as(http().get(`/quiz-attempt/${attemptId}/current-question`), token);

  const answer = (
    attemptId: number,
    questionId: number,
    body: object,
    token = tokens.taker,
  ) =>
    as(
      http().post(`/quiz-attempt/answers/${attemptId}/${questionId}`),
      token,
    ).send(body);

  const submit = (attemptId: number, token = tokens.taker) =>
    as(http().put(`/quiz-attempt/${attemptId}/submit`), token).send({
      isSubmitted: true,
    });

  const optionId = (
    quiz: Awaited<ReturnType<typeof createQuiz>>,
    question: number,
    isCorrect: boolean,
  ) =>
    quiz.questions[question].options!.find((o) => o.isCorrect === isCorrect)!
      .id;

  // Takes the three questions in order, answering the first two right and the third wrong
  async function playThrough(
    quiz: Awaited<ReturnType<typeof createQuiz>>,
    token = tokens.taker,
  ) {
    const attempt = (await startAttempt(quiz.id, token).expect(201)).body
      .id as number;

    await answer(
      attempt,
      quiz.questions[0].id,
      { selectedOptionId: optionId(quiz, 0, true) },
      token,
    ).expect(201);
    await answer(
      attempt,
      quiz.questions[1].id,
      { answer: 'true' },
      token,
    ).expect(201);
    await answer(
      attempt,
      quiz.questions[2].id,
      { answer: 'Saturn' },
      token,
    ).expect(201);

    return attempt;
  }

  describe('authoring', () => {
    it('needs a signed-in user and a valid quiz', async () => {
      await http().post('/quiz').send({}).expect(401);
      await as(http().post('/quiz'), tokens.author).send({}).expect(400);
      await as(http().post('/quiz'), tokens.author)
        .send({ name: 'No questions', startDate: minutes(-1), tags: [] })
        .expect(400);
    });

    it('shows the answers only to the author and site admins', async () => {
      const quiz = await createQuiz();
      const read = (token?: string) =>
        as(http().get(`/quiz/detailed/${quiz.id}`), token);

      await read(tokens.author).expect(200);
      await read(tokens.admin).expect(200);
      await read(tokens.taker).expect(403);
      await read().expect(401);

      expect(quiz.questions).toHaveLength(3);
      expect(quiz.questions[0].options!.some((o) => o.isCorrect)).toBe(true);
    });

    it('lets only the author or an admin change or delete it', async () => {
      const quiz = await createQuiz();
      const body = {
        name: 'Renamed quiz',
        questions: questions(),
        tags: [],
        startDate: minutes(-1),
      };

      await as(http().put(`/quiz/${quiz.id}`), tokens.taker)
        .send(body)
        .expect(403);
      await as(http().delete(`/quiz/${quiz.id}`), tokens.taker).expect(403);
      await http().delete(`/quiz/${quiz.id}`).expect(401);

      await as(http().put(`/quiz/${quiz.id}`), tokens.author)
        .send(body)
        .expect(200);
      expect(
        (await as(http().get(`/quiz/${quiz.id}`), tokens.taker).expect(200))
          .body.name,
      ).toBe('Renamed quiz');

      await as(http().delete(`/quiz/${quiz.id}`), tokens.author).expect(200);
      await as(http().get(`/quiz/${quiz.id}`), tokens.taker).expect(404);
    });

    it('keeps the questions when the update leaves them out', async () => {
      const quiz = await createQuiz();

      await as(http().put(`/quiz/${quiz.id}`), tokens.author)
        .send({ name: 'Only the name changed' })
        .expect(200);

      const detailed = await as(
        http().get(`/quiz/detailed/${quiz.id}`),
        tokens.author,
      ).expect(200);
      const read = Array.isArray(detailed.body)
        ? detailed.body[0]
        : detailed.body;

      expect(read.name).toBe('Only the name changed');
      expect(read.questions.map((q: { id: number }) => q.id)).toEqual(
        quiz.questions.map((q) => q.id),
      );
    });

    it('replaces the questions of a quiz nobody has attempted', async () => {
      const quiz = await createQuiz();

      await as(http().put(`/quiz/${quiz.id}`), tokens.author)
        .send({ questions: questions().slice(0, 1) })
        .expect(200);

      const detailed = await as(
        http().get(`/quiz/detailed/${quiz.id}`),
        tokens.author,
      ).expect(200);
      const read = Array.isArray(detailed.body)
        ? detailed.body[0]
        : detailed.body;

      expect(read.questions).toHaveLength(1);
    });

    it('refuses to replace the questions once the quiz has been attempted, so answers are not lost', async () => {
      const quiz = await createQuiz();
      const attempt = await playThrough(quiz);

      await as(http().put(`/quiz/${quiz.id}`), tokens.author)
        .send({ questions: questions().slice(0, 1) })
        .expect(400);

      await submit(attempt).expect(200);
      const result = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);

      expect(result.body.score).toBe(3);
      // Other settings can still change
      await as(http().put(`/quiz/${quiz.id}`), tokens.author)
        .send({ description: 'Still editable' })
        .expect(200);
    });

    describe('tags', () => {
      const tagsOf = async (quizId: number) =>
        (
          await db
            .select({ tagId: quizTags.tagId })
            .from(quizTags)
            .where(eq(quizTags.quizId, quizId))
        )
          .map((row) => row.tagId)
          .sort((x, y) => x - y);

      const someTags = async () =>
        (await db.select({ id: tags.id }).from(tags).limit(3)).map((t) => t.id);

      it('stores the tags a quiz is created with, once each', async () => {
        const [one, two] = await someTags();
        const quiz = await createQuiz({ tags: [one, two, two] });

        expect(await tagsOf(quiz.id)).toEqual([one, two].sort((x, y) => x - y));
      });

      it('replaces the tags on update, or clears them, without touching the questions', async () => {
        const [one, two, three] = await someTags();
        const quiz = await createQuiz({ tags: [one, two] });

        await as(http().put(`/quiz/${quiz.id}`), tokens.author)
          .send({ tags: [three] })
          .expect(200);
        expect(await tagsOf(quiz.id)).toEqual([three]);

        await as(http().put(`/quiz/${quiz.id}`), tokens.author)
          .send({ tags: [], name: 'No tags now' })
          .expect(200);
        expect(await tagsOf(quiz.id)).toEqual([]);

        const questionRows = await db
          .select({ id: quizQuestion.id })
          .from(quizQuestion)
          .where(eq(quizQuestion.quizId, quiz.id));
        expect(questionRows).toHaveLength(3);
      });

      it('refuses a tag that does not exist and keeps the quiz as it was', async () => {
        const [one] = await someTags();
        const quiz = await createQuiz({ tags: [one] });

        const response = await as(
          http().put(`/quiz/${quiz.id}`),
          tokens.author,
        ).send({
          tags: [99999999],
          name: 'Should not apply',
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
        expect(await tagsOf(quiz.id)).toEqual([one]);

        const read = await as(
          http().get(`/quiz/${quiz.id}`),
          tokens.taker,
        ).expect(200);
        expect(read.body.name).not.toBe('Should not apply');
      });
    });

    it('never lets an edit and a new attempt cross: no answer is lost and no attempt points at deleted questions', async () => {
      for (let round = 0; round < 6; round++) {
        const quiz = await createQuiz();

        const [edit, attempt] = await Promise.all([
          as(http().put(`/quiz/${quiz.id}`), tokens.author).send({
            questions: questions().slice(0, 2),
          }),
          startAttempt(quiz.id),
        ]);

        // Either the attempt came first and the edit was refused, or the edit came first, or the
        // attempt saw the edit happen and asked to be retried
        expect([200, 400]).toContain(edit.status);
        expect([201, 409]).toContain(attempt.status);
        if (edit.status === 200) {
          expect(attempt.status === 201 || attempt.status === 409).toBe(true);
        }

        if (attempt.status === 201) {
          const [row] = await db
            .select({ order: quizAttempt.questionOrder })
            .from(quizAttempt)
            .where(eq(quizAttempt.id, attempt.body.id));
          const existing = (
            await db
              .select({ id: quizQuestion.id })
              .from(quizQuestion)
              .where(eq(quizQuestion.quizId, quiz.id))
          ).map((q) => q.id);

          expect(row.order!.every((id) => existing.includes(id))).toBe(true);
          expect(row.order).toHaveLength(existing.length);
        }
      }
    });

    it('lets an admin delete anyone’s quiz', async () => {
      const quiz = await createQuiz();

      await as(http().delete(`/quiz/${quiz.id}`), tokens.admin).expect(200);
    });

    it('lists a quiz as authored and finds it by name', async () => {
      const quiz = await createQuiz({ name: 'Zanzibar trivia night' });

      // The list is paged and grows with every quiz the suite makes, so look through the pages
      let listed = false;

      for (let page = 1; page <= 20 && !listed; page++) {
        const authored = await as(
          http().get(`/quiz/authored?page=${page}&pageSize=100`),
          tokens.author,
        ).expect(200);

        listed = JSON.stringify(authored.body).includes(
          'Zanzibar trivia night',
        );

        if (!authored.body.length) break;
      }

      expect(listed).toBe(true);

      const found = await http()
        .get('/quiz/auto-complete/Zanzibar')
        .expect(200);
      expect(JSON.stringify(found.body)).toContain('Zanzibar trivia night');
      expect(JSON.stringify(found.body)).not.toContain('Paris');
      expect(quiz.id).toBeGreaterThan(0);
    });
  });

  describe('reading a quiz without seeing the answers', () => {
    it('hides the questions from the plain read and refuses the answer-revealing ones', async () => {
      const quiz = await createQuiz({ isTest: true });
      const plain = await as(
        http().get(`/quiz/${quiz.id}`),
        tokens.taker,
      ).expect(200);

      expect(plain.body.questions).toBeUndefined();
      await as(
        http().get(`/quiz/${quiz.id}?responseType=EXTENDED`),
        tokens.author,
      ).expect(400);
      await as(http().get('/quiz?responseType=EXTENDED'), tokens.author).expect(
        400,
      );
      await as(
        http().get('/quiz?responseType=FOR_ATTEMPT'),
        tokens.author,
      ).expect(400);
    });

    it('gives a started test its questions without the correct answers', async () => {
      const quiz = await createQuiz({ isTest: true });
      const read = await as(
        http().get(`/quiz/${quiz.id}?responseType=FOR_ATTEMPT`),
        tokens.taker,
      ).expect(200);
      const text = JSON.stringify(read.body);

      expect(text).toContain('Capital of France?');
      expect(text).toContain('Paris');
      expect(text).not.toContain('isCorrect');
      expect(text).not.toContain('correctAnswers');
      expect(text).not.toContain('Jupiter');
    });

    it('keeps a one-question-at-a-time quiz closed, and a test closed until it starts', async () => {
      const oneByOne = await createQuiz({ isTest: false });
      const early = await createQuiz({ isTest: true, startDate: minutes(60) });

      await as(
        http().get(`/quiz/${oneByOne.id}?responseType=FOR_ATTEMPT`),
        tokens.taker,
      ).expect(400);
      await as(
        http().get(`/quiz/${early.id}?responseType=FOR_ATTEMPT`),
        tokens.taker,
      ).expect(403);
    });
  });

  describe('starting an attempt', () => {
    it('is refused before the start date and after the end date', async () => {
      const notYet = await createQuiz({ startDate: minutes(60) });
      const over = await createQuiz({
        startDate: minutes(-60),
        endDate: minutes(-30),
      });

      await startAttempt(notYet.id).expect(403);
      await startAttempt(over.id).expect(403);
    });

    it('needs a signed-in user', async () => {
      const quiz = await createQuiz();

      await http().post(`/quiz-attempt/${quiz.id}`).send({}).expect(401);
    });

    it('resumes an unfinished attempt instead of starting another', async () => {
      const quiz = await createQuiz();
      const first = await startAttempt(quiz.id).expect(201);
      const second = await startAttempt(quiz.id).expect(201);

      expect(second.body.id).toBe(first.body.id);
    });

    it('refuses a second attempt at a quiz that cannot be retaken, once the first is submitted', async () => {
      const quiz = await createQuiz({ isRetakeable: false });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await submit(attempt).expect(200);

      await startAttempt(quiz.id).expect(403);
      // Someone else can still take it
      await startAttempt(quiz.id, tokens.other).expect(201);
    });

    it('lets a retakeable quiz be taken again', async () => {
      const quiz = await createQuiz({ isRetakeable: true });
      const first = (await startAttempt(quiz.id).expect(201)).body.id;

      await submit(first).expect(200);

      const second = await startAttempt(quiz.id).expect(201);
      expect(second.body.id).not.toBe(first);
    });
  });

  describe('one question at a time', () => {
    it('shows the current question without its answers, in order', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      const first = await current(attempt).expect(200);

      expect(first.body).toMatchObject({ index: 0, total: 3 });
      expect(first.body.question.id).toBe(quiz.questions[0].id);
      expect(JSON.stringify(first.body)).not.toContain('isCorrect');
      expect(JSON.stringify(first.body)).not.toContain('Jupiter');
    });

    it('accepts only the current question, once, and moves on', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      // A later question is not open yet
      await answer(attempt, quiz.questions[1].id, { answer: 'true' }).expect(
        403,
      );

      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, true),
      }).expect(201);

      expect((await current(attempt).expect(200)).body.index).toBe(1);

      // The first one is closed now, and answers cannot be changed
      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, false),
      }).expect(400);
    });

    it('refuses to change an answer', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;
      const created = await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, false),
      }).expect(201);

      await as(
        http().put(`/quiz-attempt/answers/${attempt}/${created.body.id}`),
        tokens.taker,
      )
        .send({ selectedOptionId: optionId(quiz, 0, true) })
        .expect(403);
    });

    it('refuses an option that belongs to another question', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 1, true),
      }).expect(400);
    });

    it('ends with no question once all are answered', async () => {
      const quiz = await createQuiz();
      const attempt = await playThrough(quiz);

      const done = await current(attempt).expect(200);

      expect(done.body).toMatchObject({ index: 3, total: 3, question: null });
    });

    it('skips a question whose time ran out, and refuses a late answer', async () => {
      const quiz = await createQuiz({
        questions: questions().map((q, i) =>
          i === 0 ? { ...q, timeLimit: 30 } : q,
        ),
      });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      // The first question was shown two minutes ago, well past its 30 seconds and the grace period
      await db
        .update(quizAttempt)
        .set({ questionStartedAt: new Date(Date.now() - 120000) })
        .where(eq(quizAttempt.id, attempt));

      const now = await current(attempt).expect(200);

      expect(now.body.index).toBe(1);
      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, true),
      }).expect(403);
      await answer(attempt, quiz.questions[1].id, { answer: 'true' }).expect(
        201,
      );
    });

    it('refuses answers once the total time is up, but still scores what was answered', async () => {
      const quiz = await createQuiz({ timeLimitTotal: 60 });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, true),
      }).expect(201);

      await db
        .update(quizAttempt)
        .set({ createdAt: new Date(Date.now() - 5 * 60000) })
        .where(eq(quizAttempt.id, attempt));

      await answer(attempt, quiz.questions[1].id, { answer: 'true' }).expect(
        403,
      );
      await submit(attempt).expect(200);

      const result = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);
      expect(result.body.score).toBe(2);
    });

    it('refuses answers once the quiz has ended', async () => {
      const quiz = await createQuiz({ endDate: minutes(60) });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      // The quiz is moved to the past by ending it now
      await as(http().put(`/quiz/${quiz.id}`), tokens.author)
        .send({ endDate: minutes(-1), startDate: minutes(-120) })
        .expect(200);

      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, true),
      }).expect(403);
    });

    it('shuffles the order for a randomised quiz, but asks every question once', async () => {
      const quiz = await createQuiz({ isRandomizedQuestions: true });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;
      const seen: number[] = [];

      for (let i = 0; i < 3; i++) {
        const now = await current(attempt).expect(200);
        const question = now.body.question;

        seen.push(question.id);
        await answer(
          attempt,
          question.id,
          question.options?.length
            ? { selectedOptionId: question.options[0].id }
            : { answer: 'x' },
        ).expect(201);
      }

      expect([...seen].sort((a, b) => a - b)).toEqual(
        quiz.questions.map((q) => q.id).sort((a, b) => a - b),
      );
    });
  });

  describe('a test', () => {
    it('shows every question at once and lets answers change until the end', async () => {
      const quiz = await createQuiz({ isTest: true });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await current(attempt).expect(400);

      // Answer out of order, wrongly, then correct it
      const created = await answer(attempt, quiz.questions[2].id, {
        answer: 'Saturn',
      }).expect(201);
      await answer(attempt, quiz.questions[0].id, {
        selectedOptionId: optionId(quiz, 0, false),
      }).expect(201);
      await as(
        http().put(`/quiz-attempt/answers/${attempt}/${created.body.id}`),
        tokens.taker,
      )
        .send({ answer: 'Jupiter' })
        .expect(200);

      await submit(attempt).expect(200);

      const result = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);
      expect(result.body.score).toBe(3);
    });

    it('answers a question only once with POST', async () => {
      const quiz = await createQuiz({ isTest: true });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await answer(attempt, quiz.questions[2].id, { answer: 'Saturn' }).expect(
        201,
      );
      await answer(attempt, quiz.questions[2].id, { answer: 'Jupiter' }).expect(
        400,
      );
    });

    it('makes an immediate-feedback answer final', async () => {
      const quiz = await createQuiz({
        isTest: true,
        questions: questions().map((q) => ({
          ...q,
          isImmediateFeedback: true,
        })),
      });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;
      const created = await answer(attempt, quiz.questions[2].id, {
        answer: 'Saturn',
      }).expect(201);

      await as(
        http().put(`/quiz-attempt/answers/${attempt}/${created.body.id}`),
        tokens.taker,
      )
        .send({ answer: 'Jupiter' })
        .expect(403);
    });
  });

  describe('scoring and the leaderboard', () => {
    it('adds the points of the correct answers when the attempt is submitted', async () => {
      const quiz = await createQuiz();
      const attempt = await playThrough(quiz);

      await submit(attempt).expect(200);

      // Paris (2) and true (1) are right, Saturn (3) is wrong
      const result = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);
      expect(result.body).toMatchObject({ isSubmitted: true, score: 3 });
    });

    it('scores the short answer with the exact correct text', async () => {
      const quiz = await createQuiz({ isTest: true });
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await answer(attempt, quiz.questions[2].id, {
        answer: ' Jupiter ',
      }).expect(201);
      await submit(attempt).expect(200);

      const result = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);
      expect(result.body.score).toBe(3);
    });

    it('can be submitted twice without scoring twice, and takes no answers afterwards', async () => {
      const quiz = await createQuiz();
      const attempt = await playThrough(quiz);

      await submit(attempt).expect(200);
      await submit(attempt).expect(200);

      const result = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);
      expect(result.body.score).toBe(3);

      const rows = await db
        .select()
        .from(quizAttempt)
        .where(eq(quizAttempt.id, attempt));
      expect(rows[0].isSubmitted).toBe(true);
    });

    it('ranks submitted attempts by score and leaves out unfinished ones', async () => {
      const quiz = await createQuiz({ isRetakeable: false });

      // taker answers one right (2), other answers two right (3), a third starts and never submits
      const takerAttempt = (
        await startAttempt(quiz.id, tokens.taker).expect(201)
      ).body.id;
      await answer(
        takerAttempt,
        quiz.questions[0].id,
        { selectedOptionId: optionId(quiz, 0, true) },
        tokens.taker,
      ).expect(201);
      await submit(takerAttempt, tokens.taker).expect(200);

      const otherAttempt = await playThrough(quiz, tokens.other);
      await submit(otherAttempt, tokens.other).expect(200);

      await startAttempt(quiz.id, tokens.author).expect(201);

      const board = await http()
        .get(`/quiz-attempt/leaderboard/${quiz.id}`)
        .expect(200);
      const rows = board.body.results as {
        userId: number;
        score: number;
        rank: number;
      }[];

      expect(rows.map((r) => [r.userId, r.score])).toEqual([
        [users.other, 3],
        [users.taker, 2],
      ]);
      expect(rows.map((r) => Number(r.rank))).toEqual([1, 2]);
    });

    it('gives a 404 leaderboard for a quiz that does not exist', async () => {
      await http().get('/quiz-attempt/leaderboard/99999999').expect(404);
    });
  });

  describe('whose attempt it is', () => {
    it('keeps attempts and answers to their owner, apart from admins', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      await as(http().get(`/quiz-attempt/${attempt}`), tokens.other).expect(
        403,
      );
      await current(attempt, tokens.other).expect(403);
      await submit(attempt, tokens.other).expect(403);
      await answer(
        attempt,
        quiz.questions[0].id,
        { selectedOptionId: optionId(quiz, 0, true) },
        tokens.other,
      ).expect(403);

      await as(http().get(`/quiz-attempt/${attempt}`), tokens.admin).expect(
        200,
      );
      await http().get(`/quiz-attempt/${attempt}`).expect(401);
    });

    it('lists only your own attempts', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;

      const mine = await as(
        http().get('/quiz-attempt/my-attempts?pageSize=100'),
        tokens.taker,
      ).expect(200);
      const others = await as(
        http().get('/quiz-attempt/my-attempts?pageSize=100'),
        tokens.other,
      ).expect(200);

      expect(JSON.stringify(mine.body)).toContain(`"id":${attempt}`);
      expect(JSON.stringify(others.body)).not.toContain(`"id":${attempt},`);
    });

    it('does not hand out the answers through the attempt list', async () => {
      await as(
        http().get('/quiz-attempt?responseType=withAnswers'),
        tokens.taker,
      ).expect(400);
    });

    it('does not show the correct options of an attempt in progress', async () => {
      const quiz = await createQuiz();
      const attempt = (await startAttempt(quiz.id).expect(201)).body.id;
      const read = await as(
        http().get(`/quiz-attempt/${attempt}`),
        tokens.taker,
      ).expect(200);

      expect(JSON.stringify(read.body)).not.toContain('Jupiter');
      expect(JSON.stringify(read.body)).not.toContain('isCorrect');
    });
  });
});
