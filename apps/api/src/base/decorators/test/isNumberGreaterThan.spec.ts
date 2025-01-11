import { validate } from 'class-validator';
import { MyNumber } from '../isNumberGreaterThan';
import { plainToInstance } from 'class-transformer';

describe('MyNumber', () => {
  it('should pass validation when maximum is greater than minimum', async () => {
    const myNumber = {
      minimum: 0,
      maximum: 1,
    };

    const myNumberInstance = plainToInstance(MyNumber, myNumber);

    const errors = await validate(myNumberInstance);
    expect(errors).toStrictEqual([]);
  });

  it('should fail validation when maximum is less than minimum', async () => {
    const myNumber = {
      minimum: 1,
      maximum: 0,
    };

    const myNumberInstance = plainToInstance(MyNumber, myNumber);

    const errors = await validate(myNumberInstance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toEqual({
      IsNumberGreaterThan: 'Maximum must be greater than minimum',
    });
  });

  it('should fail validation when maximum is equal to minimum', async () => {
    const myNumber = {
      minimum: 1,
      maximum: 1,
    };

    const myNumberInstance = plainToInstance(MyNumber, myNumber);

    const errors = await validate(myNumberInstance);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toEqual({
      IsNumberGreaterThan: 'Maximum must be greater than minimum',
    });
  });
});
