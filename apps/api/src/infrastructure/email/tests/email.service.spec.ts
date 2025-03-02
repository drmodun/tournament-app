// FILEPATH: /media/drmodun/data/repos/tournament-app/apps/api/src/infrastructure/email/email.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
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
    process.env.EMAIL_KEY = 'test-key';
    process.env.EMAIL_DOMAIN = 'test-domain';

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    jest.spyOn(service, 'createMailgunClient').mockImplementation(() => {
      return new Mailgun(FormData).client({
        key: 'test-key',
        username: 'api',
      });
    });

    logger = new Logger(EmailService.name);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if email credentials are not set', () => {
    delete process.env.EMAIL_KEY;
    delete process.env.EMAIL_DOMAIN;

    expect(() => new EmailService()).toThrow(InternalServerErrorException);
  });

  it('should generate Mailgun message data', async () => {
    const data: EmailGenerationData = {
      subject: 'Test Subject',
      template: TemplatesEnum.TEST_TEMPLATE,
      to: 'test@example.com',
      data: {},
    };

    jest.spyOn(service, 'renderEmail').mockResolvedValue('Test HTML');

    const result = await service.generateMailgunMessageData(data);

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

    jest.spyOn(service.mailgunClient.messages, 'create').mockResolvedValue({
      status: 200,
    });

    await expect(service.sendMail(data)).resolves.not.toThrow();
  });

  it('should throw an error if the email could not be sent', async () => {
    const data = {
      from: 'noreply@test-domain',
      to: 'test@example.com',
      subject: 'Test Subject',
      html: 'Test HTML',
    };

    jest.spyOn(service.mailgunClient.messages, 'create').mockResolvedValue({
      status: 500,
    });

    jest.spyOn(logger, 'error').mockImplementation(() => {});

    await expect(service.sendMail(data)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
