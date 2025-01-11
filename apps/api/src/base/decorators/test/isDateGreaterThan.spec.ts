import { validate } from 'class-validator';
import { MyDateRange } from '../isDateGreaterThan';
import { plainToInstance } from 'class-transformer';

describe('MyDateRange', () => {
  it('should pass validation when endDate is greater than startDate', async () => {
    const myDate = {
      startDate: new Date(2022, 0, 1),
      endDate: new Date(2022, 0, 2),
    };

    const myDateRange = plainToInstance(MyDateRange, myDate);

    const errors = await validate(myDateRange);
    expect(errors).toStrictEqual([]);
  });

  it('should fail validation when endDate same as startDate', async () => {
    const myDate = {
      startDate: new Date(2022, 0, 1), // January 1, 2022
      endDate: new Date(2022, 0, 1), // January 1, 2022
    };

    const myDateRange = plainToInstance(MyDateRange, myDate);
    const errors = await validate(myDateRange);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toEqual({
      IsDateGreaterThan: 'End date must be greater than start date',
    });
  });
});
