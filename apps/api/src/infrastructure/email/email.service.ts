import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import Mailgun, { InputFormData, MailgunMessageData } from 'mailgun.js';
import FormData from 'form-data';
import {
  EmailGenerationData,
  emailTemplateBodies,
  TemplatesEnum,
} from '../types';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { cwd } from 'process';
import { join } from 'path';
import 'form-data';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  public readonly mailgunClient;

  constructor() {
    if (!process.env.EMAIL_KEY || !process.env.EMAIL_DOMAIN) {
      throw new InternalServerErrorException('Email credentials are not set');
    }

    this.mailgunClient = this.createMailgunClient(
      FormData, 
      process.env.EMAIL_KEY,
    );
  }

  createMailgunClient(formData: InputFormData, key: string) {
    return new Mailgun(formData).client({
      key,
      username: 'api',
    });
  }

  async generateMailgunMessageData({
    subject,
    template,
    to,
    data,
  }: EmailGenerationData): Promise<MailgunMessageData> {
    const html = await this.renderEmail(template, data);

    return {
      from: `noreply@${process.env.EMAIL_DOMAIN}`,
      to,
      subject,
      html,
    } satisfies MailgunMessageData;
  }

  async getTemplate(templateName: TemplatesEnum): Promise<string> {
    try {
      const template = readFile(
        join(cwd(), `/src/infrastructure/email/templates/${templateName}.html`),
        {
          encoding: 'utf-8',
        },
      );

      return await template;
    } catch (e) {
      this.logger.error(`Template not found: ${templateName}`, e.stack);
      throw new InternalServerErrorException('Email template not found');
    }
  }

  checkObjectShape(templateString: string, data: object) {
    const objectShape = emailTemplateBodies[templateString];

    if (!objectShape) {
      return;
    }

    const dataKeys = Object.keys(data);
    const objectShapeKeys = Object.keys(objectShape);

    if (dataKeys.length !== objectShapeKeys.length) {
      throw new InternalServerErrorException(
        'Data object does not match template',
      );
    }

    dataKeys.forEach((key) => {
      if (!objectShapeKeys.includes(key)) {
        throw new InternalServerErrorException(
          'Data object does not match template',
        );
      }
    });

    return true;
  }

  renderEmailTemplate(templateString: string, data: object): string {
    this.checkObjectShape(templateString, data);
    return Handlebars.compile(templateString)(data);
  }

  async renderEmail(template: TemplatesEnum, object: object): Promise<string> {
    const templateString = await this.getTemplate(template);
    return this.renderEmailTemplate(templateString, object);
  }

  async sendMail(data: MailgunMessageData) {
    try {
      const action = await this.mailgunClient.messages.create(
        process.env.EMAIL_DOMAIN,
        data,
      );

      if (action.status !== 200) {
        this.logger.error('Email could not be sent', action);
        throw new InternalServerErrorException('Email could not be sent');
      }
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  async generateAndSendEmail(sendObject: EmailGenerationData) {
    const emailData = await this.generateMailgunMessageData(sendObject);
    await this.sendMail(emailData);
  }
}
