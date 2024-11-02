import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
@Injectable()
export class MailgunService {
  // mailgun secret key
  private MAILGUN_KEY = this.config.get<string>('MAILGUN_KEY');
  private MAILGUN_DOMAIN = 
  private client = new Mailgun(FormData).client({
    username: 'api',
    key: this.MAILGUN_KEY,
  });
  /**
   * Send via API
   *
   * @param data
   */
  async sendMail(data) {
    this.client.messages
      .create(this.MAILGUN_DOMAIN, data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }