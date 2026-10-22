import type { components } from './vansy.openapi';

// The request and response shapes come from Vansy's OpenAPI document (vansy.openapi.ts, generated
// with openapi-typescript from Vansy's apps/api/openapi.yml). Webhook bodies are not part of it,
// so they are written out here after Vansy's integration docs.

export type VansyLaunchRequest = components['schemas']['LaunchRequestDto'];
export type VansyLaunchResponse = components['schemas']['LaunchResponseDto'];

export interface VansyContextRef {
  type: string;
  id: string;
}

export interface VansyQuizSummary {
  id: string;
  title: string;
  ownerRef: string;
  publishState: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
  participationMode: 'SOLO' | 'TEAM' | 'MIXED';
  startsAt: string | null;
  endsAt: string | null;
  questionCount: number;
  maxScore: number;
  contexts: VansyContextRef[];
}

export interface VansyWebhookAttempt {
  id: string;
  quizId: string;
  quizVersion: number;
  subject: { externalUserId: string } | null;
  team: { externalTeamId: string } | null;
  contextRef: VansyContextRef | null;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean | null;
  startedAt: string | null;
  submittedAt: string | null;
  durationMs: number;
  status: 'SUBMITTED' | 'TIMED_OUT' | 'TERMINATED_BY_PROCTOR';
  integrity: {
    reviewStatus: 'NONE' | 'OPEN' | 'CLEARED' | 'CONFIRMED_VIOLATION';
  };
}

export interface VansyStandingRow {
  rank: number;
  category: 'SOLO' | 'TEAM' | 'ALL';
  attemptId: string;
  subject: { externalUserId: string; displayName: string } | null;
  team: { externalTeamId: string; name: string } | null;
  score: number;
  maxScore: number;
  durationMs: number;
  submittedAt: string;
  reviewStatus: string;
}

interface WebhookBase<T extends string> {
  eventId: string;
  type: T;
  occurredAt: string;
  tenantId: string;
}

export type VansyWebhookEvent =
  | (WebhookBase<'attempt.completed'> & { attempt: VansyWebhookAttempt })
  | (WebhookBase<'attempt.reviewed'> & { attempt: VansyWebhookAttempt })
  | (WebhookBase<'quiz.publish_state_changed'> & {
      quiz: { id: string; ownerRef: string; publishState: string };
    })
  | (WebhookBase<'quiz.results_final'> & {
      quiz: { id: string; ownerRef: string; contexts: VansyContextRef[] };
      standings: { category: string; rows: VansyStandingRow[] }[];
    });
