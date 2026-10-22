import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  apiTokenScopeEnum,
  apiTokenScopeEnumType,
  ICreateApiTokenRequest,
} from '@tournament-app/types';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { DEFAULT_EXPIRY_DAYS, MAX_EXPIRY_DAYS } from '../api-token';

export class CreateApiTokenRequest implements ICreateApiTokenRequest {
  @ApiProperty({ example: 'Discord bot', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @ApiProperty({
    enum: apiTokenScopeEnum,
    isArray: true,
    description: 'read: GET and HEAD requests. write: every method.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(apiTokenScopeEnum, { each: true })
  scopes: apiTokenScopeEnumType[];

  // Left out: DEFAULT_EXPIRY_DAYS. Null: the token never expires.
  @ApiPropertyOptional({
    nullable: true,
    minimum: 1,
    maximum: MAX_EXPIRY_DAYS,
    default: DEFAULT_EXPIRY_DAYS,
    description:
      'Days until the token expires; null for a token that never expires.',
  })
  @ValidateIf(
    (request) =>
      request.expiresInDays !== undefined && request.expiresInDays !== null,
  )
  @IsInt()
  @Min(1)
  @Max(MAX_EXPIRY_DAYS)
  expiresInDays?: number | null;
}
