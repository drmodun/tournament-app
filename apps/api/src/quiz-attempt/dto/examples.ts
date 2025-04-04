export const quizAttemptExamples = {
  responses: {
    basic: {
      id: 1,
      userId: 42,
      quizId: 7,
      currentQuestion: 2,
      endTime: '2023-05-30T15:30:00Z',
      score: 80,
      isSubmitted: true,
      createdAt: '2023-05-30T14:30:00Z',
    },
    withAnswers: {
      id: 1,
      userId: 42,
      quizId: 7,
      currentQuestion: 2,
      endTime: '2023-05-30T15:30:00Z',
      score: 80,
      isSubmitted: true,
      createdAt: '2023-05-30T14:30:00Z',
      answers: [
        {
          id: 1,
          isFinal: true,
          isCorrect: true,
          userId: 42,
          quizAttemptId: 1,
          quizQuestionId: 101,
          answer: 'Paris',
          selectedOptionId: 201,
          createdAt: '2023-05-30T14:35:00Z',
        },
        {
          id: 2,
          isFinal: true,
          isCorrect: false,
          userId: 42,
          quizAttemptId: 1,
          quizQuestionId: 102,
          answer: 'Mercury',
          selectedOptionId: 205,
          createdAt: '2023-05-30T14:40:00Z',
        },
      ],
    },
  },
  requests: {
    createAttempt: {
      quizId: 7,
    },
    submitAttempt: {
      isSubmitted: true,
    },
    createAnswer: {
      quizQuestionId: 101,
      answer: 'Paris',
      selectedOptionId: 201,
    },
    updateAnswer: {
      answer: 'London',
      selectedOptionId: 202,
    },
  },
};
