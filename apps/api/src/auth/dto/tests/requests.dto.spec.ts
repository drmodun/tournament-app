import { validate } from 'class-validator';
import {
  LoginRequest,
  ChangePasswordRequest,
  SendResetPasswordEmailRequest,
  ResetPasswordRequest,
  UpdateEmailRequest,
} from '../requests.dto';

describe('DTO Validation Tests', () => {
  it('should validate LoginRequest', async () => {
    const validLoginRequest = new LoginRequest();
    validLoginRequest.email = 'test@example.com';
    validLoginRequest.password = 'Password123#';

    const invalidLoginRequest = new LoginRequest();
    invalidLoginRequest.email = 'invalid-email';
    invalidLoginRequest.password = '';

    let errors = await validate(validLoginRequest);
    expect(errors.length).toBe(0);

    errors = await validate(invalidLoginRequest);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate ChangePasswordRequest', async () => {
    const validChangePasswordRequest = new ChangePasswordRequest();
    validChangePasswordRequest.currentPassword = 'currentPassword123';
    validChangePasswordRequest.newPassword = 'NewPassword123#';

    const invalidChangePasswordRequest = new ChangePasswordRequest();
    invalidChangePasswordRequest.currentPassword = '';
    invalidChangePasswordRequest.newPassword = '';

    let errors = await validate(validChangePasswordRequest);
    expect(errors.length).toBe(0);

    errors = await validate(invalidChangePasswordRequest);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate SendResetPasswordEmailRequest', async () => {
    const validSendResetPasswordEmailRequest =
      new SendResetPasswordEmailRequest();
    validSendResetPasswordEmailRequest.email = 'test@example.com';

    const invalidSendResetPasswordEmailRequest =
      new SendResetPasswordEmailRequest();
    invalidSendResetPasswordEmailRequest.email = 'invalid-email';

    let errors = await validate(validSendResetPasswordEmailRequest);
    expect(errors.length).toBe(0);

    errors = await validate(invalidSendResetPasswordEmailRequest);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate ResetPasswordRequest', async () => {
    const validResetPasswordRequest = new ResetPasswordRequest();
    validResetPasswordRequest.newPassword = 'NewPassword123#';

    const invalidResetPasswordRequest = new ResetPasswordRequest();
    invalidResetPasswordRequest.newPassword = '';

    let errors = await validate(validResetPasswordRequest);
    expect(errors.length).toBe(0);

    errors = await validate(invalidResetPasswordRequest);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate UpdateEmailRequest', async () => {
    const validUpdateEmailRequest = new UpdateEmailRequest();
    validUpdateEmailRequest.currentPassword = 'currentPassword123';
    validUpdateEmailRequest.email = 'test@example.com';

    const invalidUpdateEmailRequest = new UpdateEmailRequest();
    invalidUpdateEmailRequest.currentPassword = '';
    invalidUpdateEmailRequest.email = 'invalid-email';

    let errors = await validate(validUpdateEmailRequest);
    expect(errors.length).toBe(0);

    errors = await validate(invalidUpdateEmailRequest);
    expect(errors.length).toBeGreaterThan(0);
  });
});

//TODO: maybe check this and possibly add more tests
