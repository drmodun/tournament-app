import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import {
  EmailGenerationData,
  emailTemplateBodies,
  TemplatesEnum,
} from '../types';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { cwd } from 'process';
import { join } from 'path';

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Sends through any SMTP server, configured with SMTP_HOST, SMTP_PORT, SMTP_USER,
// SMTP_PASSWORD and SMTP_SECURE. EMAIL_FROM is the sender, e.g. "winning.sh <noreply@example.com>".
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  public readonly transporter: Transporter;
  // Without SMTP_HOST (local development, tests) emails are logged instead of sent
  private readonly isSmtpConfigured = !!process.env.SMTP_HOST;

  constructor() {
    if (!process.env.EMAIL_FROM) {
      throw new InternalServerErrorException('Email sender is not set');
    }

    if (!this.isSmtpConfigured && process.env.MODE === 'production') {
      throw new InternalServerErrorException('SMTP server is not set');
    }

    this.transporter = this.createTransporter();
  }

  createTransporter(): Transporter {
    if (!this.isSmtpConfigured) {
      return createTransport({ jsonTransport: true });
    }

    const port = Number(process.env.SMTP_PORT || 587);

    return createTransport({
      host: process.env.SMTP_HOST,
      port,
      // Port 465 is implicit TLS; other ports upgrade with STARTTLS when the server offers it
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === 'true'
        : port === 465,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  async generateMessageData({
    subject,
    template,
    to,
    data,
  }: EmailGenerationData): Promise<EmailMessage> {
    const html = await this.renderEmail(template, data);

    return {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    } satisfies EmailMessage;
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

  async sendMail(data: EmailMessage) {
    try {
      await this.transporter.sendMail(data);
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
      throw new InternalServerErrorException('Error sending email');
    }

    if (!this.isSmtpConfigured) {
      const links = data.html.match(/https?:\/\/[^"'\s<]+/g) ?? [];
      this.logger.warn(
        `SMTP_HOST is not set, email not sent. To: ${data.to}, subject: ${data.subject}, links: ${links.join(' ')}`,
      );
    }
  }

  async generateAndSendEmail(sendObject: EmailGenerationData) {
    const emailData = await this.generateMessageData(sendObject);
    await this.sendMail(emailData);
  }
}
