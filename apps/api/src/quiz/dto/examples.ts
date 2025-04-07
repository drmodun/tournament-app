import { QuizResponsesEnum, quizQuestionTypeEnum } from '@tournament-app/types';
import { QuizQuery } from './requests.dto';

export const quizQueryExamples = {
  responses: {
    'Basic Response': {
      value: {
        results: [
          {
            id: 1,
            name: 'Pre-tournament Knowledge Check',
            startDate: '2023-09-15T10:00:00Z',
            timeLimitTotal: 600,
            passingScore: 70,
            isRetakeable: true,
            isAnonymousAllowed: false,
            description: 'A quiz to test your knowledge before the tournament',
            matchupId: 101,
            stageId: 5,
            coverImage: 'https://example.com/images/quiz1.jpg',
            tags: [
              {
                id: 1,
                name: 'Tournament Rules',
              },
              {
                id: 2,
                name: 'Game Knowledge',
              },
            ],
            createdAt: '2023-09-01T08:30:00Z',
            updatedAt: '2023-09-10T14:15:00Z',
            authorId: 42,
          },
        ],
        metadata: {
          page: 1,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
        },
      },
    },
  },
  requests: {
    'Simple Query': {
      value: {
        page: 1,
        pageSize: 10,
      } as QuizQuery,
    },
    'Filtered Query': {
      value: {
        page: 1,
        pageSize: 10,
        name: 'Tournament Quiz',
        authorId: 42,
        responseType: QuizResponsesEnum.BASE,
      } as QuizQuery,
    },
  },
};

export const quizResponses = {
  BASE: {
    value: {
      id: 1,
      name: 'Pre-tournament Knowledge Check',
      startDate: '2023-09-15T10:00:00Z',
      timeLimitTotal: 600,
      passingScore: 70,
      isRetakeable: true,
      isAnonymousAllowed: false,
      description: 'A quiz to test your knowledge before the tournament',
      matchupId: 101,
      stageId: 5,
      coverImage: 'https://example.com/images/quiz1.jpg',
      tags: [
        {
          id: 1,
          name: 'Tournament Rules',
        },
        {
          id: 2,
          name: 'Game Knowledge',
        },
      ],
      createdAt: '2023-09-01T08:30:00Z',
      updatedAt: '2023-09-10T14:15:00Z',
      authorId: 42,
    },
  },
  EXTENDED: {
    value: {
      id: 1,
      name: 'Pre-tournament Knowledge Check',
      startDate: '2023-09-15T10:00:00Z',
      timeLimitTotal: 600,
      passingScore: 70,
      isRetakeable: true,
      isAnonymousAllowed: false,
      description: 'A quiz to test your knowledge before the tournament',
      matchupId: 101,
      stageId: 5,
      coverImage: 'https://example.com/images/quiz1.jpg',
      tags: [
        {
          id: 1,
          name: 'Tournament Rules',
        },
        {
          id: 2,
          name: 'Game Knowledge',
        },
      ],
      createdAt: '2023-09-01T08:30:00Z',
      updatedAt: '2023-09-10T14:15:00Z',
      authorId: 42,
      attempts: 150,
      averageScore: 78.5,
      medianScore: 82,
      passingRate: 85.3,
      questions: [
        {
          id: 1,
          name: 'What is the maximum number of players allowed?',
          order: 1,
          timeLimit: 30,
          points: 10,
          createdAt: '2023-09-01T08:35:00Z',
          updatedAt: '2023-09-01T08:35:00Z',
          type: quizQuestionTypeEnum.MULTIPLE_CHOICE,
          image: null,
          isImmediateFeedback: true,
          correctAnswers: ['4'],
          explanation:
            'Tournament rules state that each team must have exactly 4 players.',
          options: [
            {
              id: 1,
              text: '2',
              order: 1,
              count: 10,
              isCorrect: false,
            },
            {
              id: 2,
              text: '3',
              order: 2,
              count: 25,
              isCorrect: false,
            },
            {
              id: 3,
              text: '4',
              order: 3,
              count: 105,
              isCorrect: true,
            },
            {
              id: 4,
              text: '5',
              order: 4,
              count: 10,
              isCorrect: false,
            },
          ],
          answers: [],
        },
      ],
    },
  },
};
