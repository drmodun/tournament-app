import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseQuery } from '../baseQuery';

class TestQuery extends BaseQuery {}

describe('BaseQuery', () => {
  it('should pass validation of valid BaseQuery object', async () => {
    const body = {
      field: 'testField',
      order: 'asc',
      returnFullCount: true,
      responseType: 'testResponseType',
      page: 1,
      pageSize: 50,
    };

    const testQuery = plainToInstance(TestQuery, body);
    const errors = await validate(testQuery);
    expect(errors).toStrictEqual([]);
  });

  it('should fail validation of BaseQuery object with negative page number', async () => {
    const body = {
      page: -1,
    };

    const testQuery = plainToInstance(TestQuery, body);
    const errors = await validate(testQuery);
    expect(errors.map((x) => x.property)).toStrictEqual(['page']);
  });

  it('should fail validation of BaseQuery object with negative pageSize number', async () => {
    const body = {
      pageSize: -1,
    };

    const testQuery = plainToInstance(TestQuery, body);
    const errors = await validate(testQuery);
    expect(errors.map((x) => x.property)).toStrictEqual(['pageSize']);
  });

  it('should fail validation of BaseQuery object with pageSize more than 100', async () => {
    const body = {
      pageSize: 101,
    };

    const testQuery = plainToInstance(TestQuery, body);
    const errors = await validate(testQuery);
    expect(errors.map((x) => x.property)).toStrictEqual(['pageSize']);
  });

  it('should fail validation of BaseQuery object with invalid order', async () => {
    const body = {
      order: 'invalid',
    };

    const testQuery = plainToInstance(TestQuery, body);
    const errors = await validate(testQuery);
    expect(errors.map((x) => x.property)).toStrictEqual(['order']);
  });
});
