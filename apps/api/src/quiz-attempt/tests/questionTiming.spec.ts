import {
  ANSWER_GRACE_SECONDS,
  questionOrderFor,
  resolveQuestionPosition,
} from '../questionTiming';

describe('questionTiming', () => {
  const start = new Date('2026-01-01T10:00:00Z');
  const at = (seconds: number) => start.getTime() + seconds * 1000;
  const questions = [
    { id: 1, timeLimit: 30 },
    { id: 2, timeLimit: null },
    { id: 3, timeLimit: 20 },
  ];

  describe('resolveQuestionPosition', () => {
    it('stays on a question within its time limit and the grace period', () => {
      const position = resolveQuestionPosition(
        questions,
        0,
        start,
        at(30 + ANSWER_GRACE_SECONDS),
      );

      expect(position).toEqual({
        index: 0,
        startedAt: start,
        deadline: new Date(at(30)),
      });
    });

    it('skips a question whose time ran out, starting the next one then', () => {
      const position = resolveQuestionPosition(
        questions,
        0,
        start,
        at(31 + ANSWER_GRACE_SECONDS),
      );

      expect(position).toEqual({
        index: 1,
        startedAt: new Date(at(30)),
        deadline: null,
      });
    });

    it('waits on a question without a time limit for as long as it takes', () => {
      expect(
        resolveQuestionPosition(questions, 1, start, at(10_000)).index,
      ).toBe(1);
    });

    it('skips several questions in one go', () => {
      const timed = [
        { id: 1, timeLimit: 10 },
        { id: 2, timeLimit: 10 },
        { id: 3, timeLimit: 10 },
      ];

      const position = resolveQuestionPosition(timed, 0, start, at(25 + 11));

      expect(position.index).toBe(2);
      expect(position.startedAt).toEqual(new Date(at(20)));
    });

    it('ends after the last question', () => {
      const position = resolveQuestionPosition(questions, 3, start, at(0));

      expect(position.index).toBe(3);
      expect(position.deadline).toBeNull();
    });
  });

  describe('questionOrderFor', () => {
    it('orders questions by id', () => {
      expect(questionOrderFor([3, 1, 2], false)).toEqual([1, 2, 3]);
    });

    it('shuffles them for randomised quizzes', () => {
      const order = questionOrderFor([1, 2, 3, 4], true, () => 0);

      expect(order).toEqual([2, 3, 4, 1]);
      expect([...order].sort()).toEqual([1, 2, 3, 4]);
    });
  });
});
