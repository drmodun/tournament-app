// FILEPATH: /media/drmodun/data/repos/tournament-app/apps/api/src/infrastructure/email/email.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EmailGenerationData, TemplatesEnum } from '../../types';
import Handlebars from 'handlebars';
import 'reflect-metadata';
import * as fs from 'fs/promises';

jest.mock('handlebars');
jest.mock('fs/promises');

describe('EmailService', () => {
  let service: EmailService;
  let logger: Logger;

  beforeEach(async () => {
    process.env.EMAIL_FROM = 'noreply@test-domain';
    delete process.env.SMTP_HOST;

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    logger = new Logger(EmailService.name);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the email sender is not set', () => {
    delete process.env.EMAIL_FROM;

    expect(() => new EmailService()).toThrow(InternalServerErrorException);
  });

  it('should throw an error in production if no SMTP server is set', () => {
    const mode = process.env.MODE;
    process.env.MODE = 'production';

    try {
      expect(() => new EmailService()).toThrow(InternalServerErrorException);
    } finally {
      process.env.MODE = mode;
    }
  });

  it('should connect to the configured SMTP server', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASSWORD = 'password';

    try {
      const { options } = new EmailService().transporter;

      expect(options).toMatchObject({
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        auth: { user: 'user', pass: 'password' },
      });
    } finally {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASSWORD;
    }
  });

  it('should generate message data', async () => {
    const data: EmailGenerationData = {
      subject: 'Test Subject',
      template: TemplatesEnum.TEST_TEMPLATE,
      to: 'test@example.com',
      data: {},
    };

    jest.spyOn(service, 'renderEmail').mockResolvedValue('Test HTML');

    const result = await service.generateMessageData(data);

    expect(result).toEqual({
      from: 'noreply@test-domain',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: 'Test HTML',
    });
  });

  it('should return the correct template', async () => {
    jest.spyOn(fs, 'readFile').mockResolvedValueOnce('Test Template');

    const result = await service.getTemplate(TemplatesEnum.TEST_TEMPLATE);

    expect(result).toBe('Test Template');
  });

  it('should throw an error if the template is not found', async () => {
    jest.spyOn(logger, 'error').mockImplementation(() => {});

    jest
      .spyOn(fs, 'readFile')
      .mockRejectedValue(new Error('Template not found'));

    await expect(
      service.getTemplate('some-template' as TemplatesEnum),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should validate the data correctly', () => {
    const templateString = 'test-template';
    const data = {};

    jest.spyOn(service, 'checkObjectShape').mockImplementation(() => true);

    expect(() => service.checkObjectShape(templateString, data)).not.toThrow();
  });

  it('should render the template correctly', () => {
    const templateString = 'Test Template';
    const data = {};

    Handlebars.compile = jest.fn().mockReturnValue(() => 'Rendered Template');

    const result = service.renderEmailTemplate(templateString, data);

    expect(result).toBe('Rendered Template');
  });

  it('should return the rendered email', async () => {
    jest.spyOn(service, 'getTemplate').mockResolvedValue('Test Template');
    jest
      .spyOn(service, 'renderEmailTemplate')
      .mockReturnValue('Rendered Template');

    const result = await service.renderEmail(TemplatesEnum.TEST_TEMPLATE, {});

    expect(result).toBe('Rendered Template');
  });

  it('should send the email correctly', async () => {
    const data = {
      from: 'noreply@test-domain',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: 'Test HTML',
    };

    const sendMail = jest.fn().mockResolvedValue({});
    service.transporter.sendMail = sendMail;

    await expect(service.sendMail(data)).resolves.not.toThrow();
    expect(sendMail).toHaveBeenCalledWith(data);
  });

  it('should throw an error if the email could not be sent', async () => {
    const data = {
      from: 'noreply@test-domain',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: 'Test HTML',
    };

    service.transporter.sendMail = jest
      .fn()
      .mockRejectedValue(new Error('Connection refused'));

    jest.spyOn(logger, 'error').mockImplementation(() => {});

    await expect(service.sendMail(data)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
