import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
  IsDate,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsDateGreaterThan', async: false })
export class IsDateGreaterThanConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    const valueDate = new Date(value);
    const relatedValueDate = new Date(relatedValue);
    return valueDate > relatedValueDate; // for greater than comparison
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be greater than ${relatedPropertyName}`;
  }
}

export function IsDateGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsDateGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsDateGreaterThanConstraint,
    });
  };
}

export class MyDateRange {
  @IsDate()
  startDate: Date;

  @IsDateGreaterThan('startDate', {
    message: 'End date must be greater than start date',
  })
  endDate: Date;
}
