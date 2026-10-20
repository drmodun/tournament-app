import { TransformFnParams } from 'class-transformer';

// For @Transform on boolean fields of request bodies: JSON sends real booleans, query strings and form
// data send "true"/"false". Anything else is left for @IsBoolean to reject.
export const toBoolean = ({ value }: TransformFnParams) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
};
