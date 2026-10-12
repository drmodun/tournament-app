import { InternalServerErrorException } from '@nestjs/common';
import { NotificationTemplatesFiller, templates } from '../templates';
import { TemplatesEnum } from '../../types';

describe('NotificationTemplatesFiller', () => {
  let notificationTemplatesFiller: NotificationTemplatesFiller;

  beforeEach(() => {
    notificationTemplatesFiller = new NotificationTemplatesFiller();
  });

  describe('compileTemplates', () => {
    it('should compile all templates', () => {
      const compiledTemplates = (notificationTemplatesFiller as any)
        .compiledTemplates;
      expect(Object.keys(compiledTemplates)).toHaveLength(
        Object.keys(templates).length,
      );
    });
  });

  describe('getTemplate', () => {
    it('should return the compiled template', () => {
      const template = notificationTemplatesFiller['getTemplate'](
        TemplatesEnum.BET_OUTCOME,
      );
      expect(typeof template).toBe('function');
    });

    it('should throw an error if template not found', () => {
      expect(() =>
        notificationTemplatesFiller['getTemplate']('NON_EXISTENT_TEMPLATE'),
      ).toThrow(InternalServerErrorException);
    });
  });

  describe('fill', () => {
    it('should fill the template with provided data', () => {
      const result = notificationTemplatesFiller.fill(
        TemplatesEnum.BET_OUTCOME,
        {
          username: 'John',
          bet: '123',
          outcome: 'won',
        },
      );
      expect(result).toBe('Hello, your bet 123 has been won');
    });

    it('should throw an error if required keys are missing', () => {
      expect(() =>
        notificationTemplatesFiller.fill(TemplatesEnum.BET_OUTCOME, {
          username: 'John',
          bet: '123',
        }),
      ).toThrow(InternalServerErrorException);
    });
  });
});
