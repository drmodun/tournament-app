import {
  IChallongeParticipant,
  IChallongeTournament,
} from '@tournament-app/types';

// Ensure we're in test mode
beforeAll(async () => {
  expect(process.env.MODE).toBe('test');
});

// Each suite loads its own copy of the database client, so close it once the suite is done;
// otherwise the connections of every suite stay open until the run ends and exhaust Postgres
afterAll(async () => {
  const { pgClient } = await import('src/db/db');
  await pgClient.end({ timeout: 5 });
});

jest.mock('src/infrastructure/email/email.service', () => {
  const mockSendMail = jest.fn().mockResolvedValue(null);
  const mockGenerateAndSendEmail = jest.fn().mockResolvedValue(null);
  const mockGenerateMessageData = jest.fn().mockResolvedValue({
    from: 'noreply@test-domain',
    to: 'test@example.com',
    subject: 'Test Subject',
    html: 'Test HTML',
  });
  const mockRenderEmail = jest.fn().mockResolvedValue('Test HTML');
  const mockGetTemplate = jest.fn().mockResolvedValue('Test Template');
  const mockRenderEmailTemplate = jest
    .fn()
    .mockReturnValue('Rendered Template');
  const mockCheckObjectShape = jest.fn().mockReturnValue(true);

  return {
    EmailService: jest.fn().mockImplementation(() => ({
      sendMail: mockSendMail,
      generateAndSendEmail: mockGenerateAndSendEmail,
      generateMessageData: mockGenerateMessageData,
      renderEmail: mockRenderEmail,
      getTemplate: mockGetTemplate,
      renderEmailTemplate: mockRenderEmailTemplate,
      checkObjectShape: mockCheckObjectShape,
      transporter: {
        sendMail: jest.fn().mockResolvedValue({}),
      },
    })),
    ChallongeService: jest.fn().mockImplementation(() => ({
      createTournamentFunction: jest.fn().mockResolvedValue({
        id: '1',
      } as IChallongeTournament),
      deleteParticipantFunction: jest.fn().mockResolvedValue({
        status: 200,
      }),
      createParticipantFunction: jest.fn().mockResolvedValue({
        id: '1',
      } as IChallongeParticipant),
    })),
  };
});

export {};
