import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
  IsNumber,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNumberGreaterThan', async: false })
export class IsNumberGreaterThanConstraint
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

export function IsNumberGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsNumberGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsNumberGreaterThanConstraint,
    });
  };
}

export class MyNumber {
  @IsNumber()
  minimum: number;

  @IsNumberGreaterThan('minimum', {
    message: 'Maximum must be greater than minimum',
  })
  maximum: number;
}
