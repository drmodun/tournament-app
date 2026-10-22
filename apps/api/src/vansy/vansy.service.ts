import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { userRoleEnum } from '@tournament-app/types';
import { JWTVerifyGetKey } from 'jose';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { VansyClient } from './vansy.client';
import { VANSY_CONFIG, VansyConfig } from './vansy.config';
import { VansyRepository } from './vansy.repository';
import { VansyLaunchRequest, VansyWebhookEvent } from './vansy.types';
import {
  InvalidWebhookError,
  vansyKeys,
  verifyVansyWebhook,
} from './webhookVerifier';

// Quizzes are owned by the user who authored them in Vansy
export const ownerRefOf = (userId: number) => `user:${userId}`;
export const stageContext = (stageId: number) => ({
  type: 'stage',
  id: String(stageId),
});

/**
 * The tournament side of Vansy. Tournaments decides who may do what and says so in the launch;
 * Vansy runs the quiz and reports results, which become the stage's standings.
 */
@Injectable()
export class VansyService {
  private readonly logger = new Logger(VansyService.name);
  private keys: JWTVerifyGetKey | null = null;

  constructor(
    private readonly client: VansyClient,
    private readonly repository: VansyRepository,
    @Inject(VANSY_CONFIG) private readonly config: VansyConfig | null,
  ) {}

  private settings() {
    if (!this.config) {
      throw new ServiceUnavailableException('Vansy is not configured');
    }
    return this.config;
  }

  private async subject(user: ValidatedUserDto) {
    return {
      externalUserId: String(user.id),
      displayName: await this.repository.displayName(user.id),
    };
  }

  private launch(body: Omit<VansyLaunchRequest, 'locale'>) {
    return this.client.launch({ ...body, locale: 'en' } as VansyLaunchRequest);
  }

  /** Any signed-in user may author quizzes of their own */
  async authorLaunch(user: ValidatedUserDto) {
    return this.launch({
      action: 'author',
      subject: await this.subject(user),
      capabilities: ['author'],
      scope: { ownerRef: ownerRefOf(user.id) },
      returnUrl: `${this.settings().frontendUrl}/manageQuizzes`,
    } as VansyLaunchRequest);
  }

  /** A quiz may be managed by its author or a site admin (CanEditQuizGuard's rule) */
  async manageLaunch(user: ValidatedUserDto, quizId: string) {
    const quiz = await this.client.getQuiz(quizId);
    if (
      quiz.ownerRef !== ownerRefOf(user.id) &&
      user.role !== userRoleEnum.ADMIN
    ) {
      throw new ForbiddenException('Only the author can manage this quiz');
    }

    return this.launch({
      action: 'manage',
      subject: await this.subject(user),
      capabilities: ['manage'],
      scope: { quizId },
      returnUrl: `${this.settings().frontendUrl}/manageQuizzes`,
    } as VansyLaunchRequest);
  }

  async myQuizzes(user: ValidatedUserDto) {
    return (await this.client.listQuizzes({ ownerRef: ownerRefOf(user.id) }))
      .results;
  }

  async stageQuiz(stageId: number) {
    const link = await this.repository.linkOf(stageId);
    if (!link) {
      return { linked: false as const };
    }
    const quiz = await this.client.getQuiz(link.vansyQuizId).catch(() => null);
    return { linked: true as const, vansyQuizId: link.vansyQuizId, quiz };
  }

  private async linkedQuizId(stageId: number) {
    const link = await this.repository.linkOf(stageId);
    if (!link) {
      throw new NotFoundException('No Vansy quiz is linked to this stage');
    }
    return link.vansyQuizId;
  }

  /**
   * Links a stage to one of the organiser's quizzes. Tournaments launches every entrant as a team
   * (a solo entrant is a team of one), so the quiz must take teams.
   */
  async linkQuiz(user: ValidatedUserDto, stageId: number, quizId: string) {
    const quiz = await this.client.getQuiz(quizId);
    if (
      quiz.ownerRef !== ownerRefOf(user.id) &&
      user.role !== userRoleEnum.ADMIN
    ) {
      throw new ForbiddenException('You can only link your own quizzes');
    }
    if (quiz.participationMode === 'SOLO') {
      throw new BadRequestException(
        'The quiz must take teams: every tournament entrant is a team',
      );
    }

    const previous = await this.repository.linkOf(stageId);
    if (previous && previous.vansyQuizId !== quizId) {
      await this.client
        .setContexts(previous.vansyQuizId, [])
        .catch(() => undefined);
    }
    await this.client.setContexts(quizId, [stageContext(stageId)]);
    await this.repository.link(stageId, quizId, user.id);
    return this.stageQuiz(stageId);
  }

  async unlinkQuiz(stageId: number) {
    const link = await this.repository.linkOf(stageId);
    if (link) {
      await this.client
        .setContexts(link.vansyQuizId, [])
        .catch(() => undefined);
      await this.repository.unlink(stageId);
    }
  }

  /** The person taking for their roster; Vansy refuses a second live session for the same roster */
  async takeLaunch(user: ValidatedUserDto, stageId: number) {
    const quizId = await this.linkedQuizId(stageId);
    const team = await this.repository.rosterOf(stageId, user.id);
    if (!team) {
      throw new ForbiddenException('You are not in a roster on this stage');
    }

    return this.launch({
      action: 'take',
      subject: await this.subject(user),
      team: {
        externalTeamId: String(team.rosterId),
        name: team.name,
        memberCount: team.memberCount,
      },
      scope: { quizId, contextRef: stageContext(stageId) },
      returnUrl: `${this.settings().frontendUrl}/stage/${stageId}`,
    } as VansyLaunchRequest);
  }

  async staffLaunch(
    user: ValidatedUserDto,
    stageId: number,
    action: 'proctor' | 'review',
  ) {
    const quizId = await this.linkedQuizId(stageId);
    return this.launch({
      action,
      subject: await this.subject(user),
      capabilities: [action === 'proctor' ? 'proctor' : 'moderate'],
      scope: { quizId },
      returnUrl: `${this.settings().frontendUrl}/stage/${stageId}`,
    } as VansyLaunchRequest);
  }

  async finalize(stageId: number) {
    return this.client.finalize(await this.linkedQuizId(stageId));
  }

  async results(stageId: number) {
    const [standings, attempts] = await Promise.all([
      this.repository.standingsOf(stageId),
      this.repository.resultsOf(stageId),
    ]);
    return { stageId, standings, attempts };
  }

  async receiveWebhook(rawBody: Buffer | undefined, signature?: string) {
    const config = this.settings();
    if (!rawBody) {
      throw new UnauthorizedException('Invalid Vansy-Signature');
    }

    let event: VansyWebhookEvent;
    try {
      this.keys ??= vansyKeys(config);
      event = await verifyVansyWebhook(
        this.keys,
        config.tenantId,
        rawBody,
        signature,
      );
    } catch (error) {
      if (error instanceof InvalidWebhookError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }

    if (!(await this.repository.claimEvent(event.eventId, event.type))) {
      return { received: true, duplicate: true };
    }
    await this.apply(event);
    return { received: true, duplicate: false };
  }

  private async apply(event: VansyWebhookEvent) {
    switch (event.type) {
      case 'attempt.completed':
      case 'attempt.reviewed': {
        const a = event.attempt;
        const stageId =
          a.contextRef?.type === 'stage' ? Number(a.contextRef.id) : null;
        const rosterId = a.team ? Number(a.team.externalTeamId) : null;
        const userId = a.subject ? Number(a.subject.externalUserId) : null;

        await this.repository.saveResult({
          attemptId: a.id,
          vansyQuizId: a.quizId,
          stageId,
          rosterId:
            rosterId &&
            stageId &&
            (await this.repository.rosterExists(rosterId, stageId))
              ? rosterId
              : null,
          userId:
            userId && (await this.repository.userExists(userId))
              ? userId
              : null,
          status: a.status,
          score: a.score,
          maxScore: a.maxScore,
          percent: a.percent,
          durationMs: a.durationMs,
          reviewStatus: a.integrity.reviewStatus,
          submittedAt: a.submittedAt ? new Date(a.submittedAt) : null,
        });
        return;
      }
      case 'quiz.results_final': {
        // Every entrant is a team here, so the team board holds the stage's ranking
        const board =
          event.standings.find((b) => b.category === 'TEAM') ??
          event.standings.find((b) => b.category === 'ALL');
        for (const context of event.quiz.contexts.filter(
          (c) => c.type === 'stage',
        )) {
          const stageId = Number(context.id);
          const link = await this.repository.linkOf(stageId);
          if (link?.vansyQuizId !== event.quiz.id) {
            continue;
          }

          const rows = [];
          for (const row of board?.rows ?? []) {
            const rosterId = Number(row.team?.externalTeamId);
            if (
              rosterId &&
              (await this.repository.rosterExists(rosterId, stageId))
            ) {
              rows.push({
                rosterId,
                rank: row.rank,
                score: row.score,
                durationMs: row.durationMs,
                reviewStatus: row.reviewStatus,
              });
            }
          }
          await this.repository.replaceStandings(stageId, rows);
          this.logger.log(
            `Stage ${stageId}: ${rows.length} quiz standings from Vansy`,
          );
        }
        return;
      }
      default:
        return;
    }
  }
}
