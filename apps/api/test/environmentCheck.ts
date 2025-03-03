import { IChallongeTournament } from '@tournament-app/types';

// Ensure we're in test mode
beforeAll(async () => {
  expect(process.env.MODE).toBe('test');
});

// Mock the EmailService module
jest.mock('src/infrastructure/email/email.service', () => {
  const mockSendMail = jest.fn().mockResolvedValue(null);
  const mockGenerateAndSendEmail = jest.fn().mockResolvedValue(null);
  const mockGenerateMailgunMessageData = jest.fn().mockResolvedValue({
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
      generateMailgunMessageData: mockGenerateMailgunMessageData,
      renderEmail: mockRenderEmail,
      getTemplate: mockGetTemplate,
      renderEmailTemplate: mockRenderEmailTemplate,
      checkObjectShape: mockCheckObjectShape,
      mailgunClient: {
        messages: {
          create: jest.fn().mockResolvedValue({ status: 200 }),
        },
      },
      createMailgunClient: jest.fn().mockReturnValue({
        messages: {
          create: jest.fn().mockResolvedValue({ status: 200 }),
        },
      }),
    })),
    ChallongeService: jest.fn().mockImplementation(() => ({
      createTournamentFunction: jest.fn().mockResolvedValue({
        id: '1',
      } as IChallongeTournament),
    })),
  };
});

export {};
