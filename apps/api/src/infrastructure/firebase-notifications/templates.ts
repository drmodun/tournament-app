import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TemplatesEnum } from '../types';

type CompiledTemplate = (data: Record<string, string>) => string;

export const templates: Record<TemplatesEnum, string> = {
  [TemplatesEnum.BET_OUTCOME]: `Hello, your bet {{bet}} has been {{outcome}}`,
  [TemplatesEnum.TOURNAMENT_REMINDER]: `Heads up, your tournament {{tournament}} is about to start`,
  [TemplatesEnum.TOURNAMENT_START]: `Heads up, your tournament {{tournament}} has started`,
  [TemplatesEnum.TOURNAMENT_END]: `Heads up, your tournament {{tournament}} has ended`,
  [TemplatesEnum.GROUP_INVITATION]: `You have been invited to join the group {{group}}`,
  [TemplatesEnum.GROUP_JOIN_REQUEST]: `There is a new join request for the group {{group}} made by the user {{username}}`,
  [TemplatesEnum.GROUP_JOIN_APPROVAL]: `Your join request for the group {{group}} has been approved`,
  [TemplatesEnum.GROUP_JOIN_REJECTION]: `Your join request for the group {{group}} has been rejected`,
  [TemplatesEnum.GROUP_REMOVAL]: `You have been removed from the group {{group}}`,
  [TemplatesEnum.GROUP_ADMIN_PROMOTION]: `You have been promoted to admin in the group {{group}}`,
  [TemplatesEnum.GROUP_ADMIN_DEMOTION]: `You have been demoted from admin in the group {{group}}`,
  [TemplatesEnum.TEST_TEMPLATE]: `Hello, this is a test template`,
  [TemplatesEnum.WELCOME]: `Welcome to the app`,
  [TemplatesEnum.RESET_PASSWORD]: `Click this link to reset your password: {{resetLink}}`,
  [TemplatesEnum.EMAIL_CONFIRMATION]: `Click this link to confirm your email: {{link}}`,
  [TemplatesEnum.NOTIFICATION_OF_BAN]: `You have been banned for the following reason: {{reason}}`,
};

@Injectable()
export class NotificationTemplatesFiller {
  private compiledTemplates: Record<string, CompiledTemplate> = {};
  private templates = templates;

  constructor() {
    this.compileTemplates();
  }

  private getTemplate(templateName: string): CompiledTemplate {
    const template = this.compiledTemplates[templateName];
    if (!template) {
      throw new InternalServerErrorException(
        `Template ${templateName} not found`,
      );
    }

    return template;
  }

  private compileTemplates(): void {
    for (const [name, template] of Object.entries(this.templates)) {
      this.compiledTemplates[name] = this.compileTemplate(template);
    }
  }

  private compileTemplate(template: string): CompiledTemplate {
    const keys = template.match(/{{\w+}}/g) || [];
    const compiled = keys.map((key) => ({
      key,
      regex: new RegExp(key, 'g'),
    }));

    return (data: Record<string, string>) => {
      return compiled.reduce((result, { key, regex }) => {
        const value = data[key.slice(2, -2)] || '';
        return result.replace(regex, value);
      }, template);
    };
  }

  private checkCorrectFill(
    templateName: string,
    data: Record<string, string>,
  ): void {
    const keys = templates[templateName].match(/{{\w+}}/g) || [];
    const missingKeys = keys.filter((key) => !data[key.slice(2, -2)]);

    if (missingKeys.length) {
      throw new InternalServerErrorException(
        `Missing keys in template ${templateName}: ${missingKeys.join(', ')}`,
      );
    }
  }

  public fill(templateName: string, data: Record<string, string>): string {
    const template = this.getTemplate(templateName);
    this.checkCorrectFill(templateName, data);

    return template(data);
  }
}
