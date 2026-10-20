// Timing for quizzes shown one question at a time (isTest = false). The API decides which question is
// current, so a client cannot see a question early or answer it after its time limit.

// Allowance for network latency when an answer arrives right at a time limit
export const ANSWER_GRACE_SECONDS = 10;

export interface TimedQuestion {
  id: number;
  timeLimit: number | null;
}

export interface QuestionPosition {
  // Index into the attempt's question order; equal to its length once every question is done
  index: number;
  // When the question at `index` was shown
  startedAt: Date;
  // When its time runs out, or null for a question without a time limit
  deadline: Date | null;
}

/**
 * Where an attempt stands at `now`. A question whose time limit ran out unanswered is skipped,
 * and the next one is treated as shown at that moment.
 */
export function resolveQuestionPosition(
  questions: TimedQuestion[],
  index: number,
  startedAt: Date,
  now: number,
): QuestionPosition {
  let current = index;
  let start = startedAt.getTime();

  while (current < questions.length) {
    const limit = questions[current].timeLimit;

    if (!limit || now <= start + (limit + ANSWER_GRACE_SECONDS) * 1000) {
      break;
    }

    start += limit * 1000;
    current++;
  }

  const limit = questions[current]?.timeLimit;

  return {
    index: current,
    startedAt: new Date(start),
    deadline: limit ? new Date(start + limit * 1000) : null,
  };
}

/** Question ids in the order an attempt shows them: by id, or shuffled for randomised quizzes. */
export function questionOrderFor(
  questionIds: number[],
  isRandomized: boolean,
  random: () => number = Math.random,
): number[] {
  const order = [...questionIds].sort((a, b) => a - b);

  if (!isRandomized) {
    return order;
  }

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
}
