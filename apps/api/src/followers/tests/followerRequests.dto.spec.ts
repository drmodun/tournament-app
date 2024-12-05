import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FollowerQuery } from '../dto/request.dto';

describe('FollowerQuery', () => {
  it('should pass validation with valid data', async () => {
    const query = plainToInstance(FollowerQuery, {
      userId: 1,
      followerId: 2,
      page: 1,
      pageSize: 10,
      returnFullCount: true,
      responseType: 'follower',
    });

    const errors = await validate(query);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid userId', async () => {
    const query = plainToInstance(FollowerQuery, {
      userId: -1,
      followerId: 2,
      page: 1,
      pageSize: 10,
      returnFullCount: true,
      responseType: 'follower',
    });

    const errors = await validate(query);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('userId');
  });

  it('should fail validation with invalid followerId', async () => {
    const query = plainToInstance(FollowerQuery, {
      userId: 1,
      followerId: -2,
      page: 1,
      pageSize: 10,
      returnFullCount: true,
      responseType: 'follower',
    });

    const errors = await validate(query);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('followerId');
  });

  it('should pass validation with no optional fields', async () => {
    const query = plainToInstance(FollowerQuery, {
      page: 1,
      pageSize: 10,
      returnFullCount: true,
      responseType: 'follower',
    });

    const errors = await validate(query);
    expect(errors).toHaveLength(0);
  });
});
