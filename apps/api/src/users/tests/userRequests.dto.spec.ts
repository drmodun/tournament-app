import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateUserRequest,
  UpdateUserInfo,
  UserQuery,
} from '../dto/requests.dto';

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
      'dateOfBirth',
    ]);
  });

  it('should fail validation of invalid CreateUserRequest object', async () => {
    const body = {
      name: 'J',
      username: 'jo',
      email: 'jan',
      password: 'password!',
      country: 'USA',
      dateOfBirth: 'asd',
    };
    const createUserRequest = plainToInstance(CreateUserRequest, body);
    const errors = await validate(createUserRequest);

    expect(errors.map((x) => x.property)).toStrictEqual([
      'name',
      'username',
      'email',
      'password',
      'dateOfBirth',
    ]);
  });

  it('should pass validation of valid CreateUserRequest object', async () => {
    const body = {
      name: 'John Doe',
      username: 'john_doe',
      email: 'john@doe.com',
      password: 'Password123!',
      country: 'USA',
      dateOfBirth: '2025-01-01',
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
      dateOfBirth: 'asd',
    };

    const updateUserRequest = plainToInstance(UpdateUserInfo, body);
    const errors = await validate(updateUserRequest);

    expect(errors.map((x) => x.property)).toStrictEqual([
      'username',
      'name',
      'bio',
      'dateOfBirth',
    ]);
  });

  it('should pass validation of valid UpdateUserInfo object', async () => {
    const body = {
      name: 'John Doe',
      username: 'john_doe',
      bio: 'I am a user',
      country: 'USA',
      dateOfBirth: '2025-01-01',
    };

    const updateUserRequest = plainToInstance(UpdateUserInfo, body);
    const errors = await validate(updateUserRequest);
    expect(errors).toStrictEqual([]);
  });

  it('should pass validation of empty UserQuery object', async () => {
    const body = {};
    const userQueryRequest = plainToInstance(UserQuery, body);
    const errors = await validate(userQueryRequest);
    expect(errors).toStrictEqual([]);
  });

  it('should fail validation of invalid UserQuery object', async () => {
    const body = {
      username: 1,
      country: 2,
      email: '',
      name: 4,
      age: 's',
    };

    const userQueryRequest = plainToInstance(UserQuery, body);
    const errors = await validate(userQueryRequest);

    expect(errors.map((x) => x.property)).toStrictEqual([
      'name',
      'username',
      'email',
      'country',
      'age',
    ]);
  });

  it('should pass validation of valid UserQuery object', async () => {
    const body = {
      username: 'john_doe',
      country: 'en',
      email: 'john.doe@gmail.com',
      name: 'John Doe',
    };

    const userQueryRequest = plainToInstance(UserQuery, body);
    const errors = await validate(userQueryRequest);
    expect(errors).toStrictEqual([]);
  });

  it('should fail validation of invalid CreateUserRequest object', async () => {
    const body = {
      name: 'J',
      username: 'jo',
      email: 'jan',
      password: 'password!',
      country: 'invalid',
      dateOfBirth: 'asd',
    };
    const createUserRequest = plainToInstance(CreateUserRequest, body);
    const errors = await validate(createUserRequest);

    expect(errors.map((x) => x.property)).toStrictEqual([
      'name',
      'username',
      'email',
      'password',
      'dateOfBirth',
    ]);
  });
});
