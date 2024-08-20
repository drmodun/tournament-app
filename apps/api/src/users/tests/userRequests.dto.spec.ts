import { CreateUserRequest, UpdateUserInfo } from '@tournament-app/types';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UserRequestsDtos', () => {
  it('should fail validation of empty CreateUserRequest object', async () => {
    const body = {};
    const createUserRequest = plainToInstance(CreateUserRequest, body);
    const errors = await validate(createUserRequest);
    expect(errors.map((x) => x.property)).toStrictEqual([
      'name',
      'username',
      'email',
      'password',
      'country',
    ]);
  });

  it('should fail validation of invalid CreateUserRequest object', async () => {
    const body = {
      name: 'J',
      username: 'jo',
      email: 'jan',
      password: 'password!',
      country: 'USA',
    };
    const createUserRequest = plainToInstance(CreateUserRequest, body);
    const errors = await validate(createUserRequest);

    expect(errors.map((x) => x.property)).toStrictEqual([
      'name',
      'username',
      'email',
      'password',
    ]);
  });

  it('should pass validation of valid CreateUserRequest object', async () => {
    const body = {
      name: 'John Doe',
      username: 'john_doe',
      email: 'john@doe.com',
      password: 'Password123!',
      country: 'USA',
    };

    const createUserRequest = plainToInstance(CreateUserRequest, body);
    const errors = await validate(createUserRequest);
    expect(errors).toStrictEqual([]);
  });

  it('should fail validation of invalid UpdateUserInfo object', async () => {
    const body = {
      name: 'J',
      username: 'jo',
      bio: 'I',
      country: 'USA',
    };

    const updateUserRequest = plainToInstance(UpdateUserInfo, body);
    const errors = await validate(updateUserRequest);

    expect(errors.map((x) => x.property)).toStrictEqual([
      'name',
      'username',
      'bio',
    ]);
  });

  it('should pass validation of valid UpdateUserInfo object', async () => {
    const body = {
      name: 'John Doe',
      username: 'john_doe',
      bio: 'I am a user',
      country: 'USA',
    };

    const updateUserRequest = plainToInstance(UpdateUserInfo, body);
    const errors = await validate(updateUserRequest);
    expect(errors).toStrictEqual([]);
  });
});
