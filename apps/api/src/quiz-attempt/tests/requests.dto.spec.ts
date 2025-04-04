import { validate } from 'class-validator';
import {
  CreateQuizAttemptRequest,
  CreateQuizAnswerRequest,
  SubmitQuizAttemptRequest,
  UpdateQuizAnswerRequest,
  QuizAttemptQuery,
} from '../dto/requests.dto';

describe('Quiz Attempt DTOs', () => {
  describe('CreateQuizAttemptRequest', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateQuizAttemptRequest();
      dto.quizId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing quizId', async () => {
      const dto = new CreateQuizAttemptRequest();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('quizId');
    });
  });

  describe('SubmitQuizAttemptRequest', () => {
    it('should pass validation with valid data', async () => {
      const dto = new SubmitQuizAttemptRequest();
      dto.isSubmitted = true;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing isSubmitted', async () => {
      const dto = new SubmitQuizAttemptRequest();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isSubmitted');
    });
  });

  describe('CreateQuizAnswerRequest', () => {
    it('should pass validation with valid data (multiple choice)', async () => {
      const dto = new CreateQuizAnswerRequest();
      dto.quizQuestionId = 1;
      dto.answer = 'Test answer';
      dto.selectedOptionId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid data (text answer)', async () => {
      const dto = new CreateQuizAnswerRequest();
      dto.quizQuestionId = 1;
      dto.answer = 'Test answer';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing quizQuestionId', async () => {
      const dto = new CreateQuizAnswerRequest();
      dto.answer = 'Test answer';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('quizQuestionId');
    });

    it('should fail validation with missing answer', async () => {
      const dto = new CreateQuizAnswerRequest();
      dto.quizQuestionId = 1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answer');
    });

    it('should fail validation with empty answer', async () => {
      const dto = new CreateQuizAnswerRequest();
      dto.quizQuestionId = 1;
      dto.answer = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answer');
    });
  });

  describe('UpdateQuizAnswerRequest', () => {
    it('should pass validation with valid data (updated answer)', async () => {
      const dto = new UpdateQuizAnswerRequest();
      dto.answer = 'Updated answer';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid data (updated option)', async () => {
      const dto = new UpdateQuizAnswerRequest();
      dto.selectedOptionId = 2;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid data (both fields)', async () => {
      const dto = new UpdateQuizAnswerRequest();
      dto.answer = 'Updated answer';
      dto.selectedOptionId = 2;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty dto (all fields optional)', async () => {
      const dto = new UpdateQuizAnswerRequest();

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('QuizAttemptQuery', () => {
    it('should pass validation with valid data', async () => {
      const dto = new QuizAttemptQuery();
      dto.quizId = 1;
      dto.userId = 1;
      dto.isSubmitted = true;
      dto.page = 1;
      dto.pageSize = 10;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with no data (all fields optional)', async () => {
      const dto = new QuizAttemptQuery();

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
