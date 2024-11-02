import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Mailgun, { MailgunMessageData } from 'mailgun.js';
import FormData from 'form-data';
@Injectable()
export class EmailService {
  //TODO: remove the feature that the app can be started without the email credentials,
  //this is just for easier testing purposes

  /**
   * Send via API
   *
   * @param data
   */

  async checkForCredentials(): Promise<boolean> {
    return !(!process.env.EMAIL_KEY || !process.env.EMAIL_DOMAIN);
  }

  async generateMailgunMessageData(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<MailgunMessageData> {
    return {
      to,
      subject,
      text,
      html,
    } satisfies MailgunMessageData;
  }

  async sendMail(data: MailgunMessageData) {
    if (!this.checkForCredentials())
      throw new InternalServerErrorException('Email credentials are not set');

    const client = new Mailgun(FormData).client({
      key: process.env.EMAIL_KEY,
      username: 'api',
    });

    const action = await client.messages.create(process.env.EMAIL_DOMAIN, data);

    if (action.status !== 200) {
      throw new InternalServerErrorException('Email could not be sent');
    }
  }
}
