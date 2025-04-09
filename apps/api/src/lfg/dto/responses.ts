import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, IsDate, ValidateNested } from 'class-validator';
import {
  IMiniUserResponse,
  ICategoryMiniResponse,
  ICareerCategoryResponse,
  ILFGMiniResponse,
  IMiniLFGResponseWithUser,
  IMiniLFGResponseWithCategory,
  ILFGResponse,
  IUserResponse,
} from '@tournament-app/types';
import {
  CategoryMiniResponse,
  CategoryMiniResponseWithLogo,
} from 'src/category/dto/responses.dto';
import { MiniUserResponse, UserResponse } from 'src/users/dto/responses.dto';

export class CareerCategoryResponse implements ICareerCategoryResponse {
  @ApiProperty({
    description: 'User ID',
    readOnly: true,
    example: 123,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Category ID',
    readOnly: true,
    example: 456,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Elo rating',
    readOnly: true,
    example: 1000,
  })
  @IsNumber()
  elo: number;

  @ApiProperty({
    description: 'Date when the career category was created',
    readOnly: true,
    example: '2023-01-15T12:30:45Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Category affiliated with the career category',
    type: () => CategoryMiniResponseWithLogo,
    readOnly: true,
  })
  @Type(() => CategoryMiniResponseWithLogo)
  category: CategoryMiniResponseWithLogo;
}

export class LFGMiniResponse implements ILFGMiniResponse {
  @ApiProperty({
    description: 'Unique identifier for the LFG',
    readOnly: true,
    example: 123,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'ID of the user',
    readOnly: true,
    example: 456,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Category ID',
    readOnly: true,
    example: 789,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Message for the LFG',
    readOnly: true,
    example: 'Looking for players for our competitive team',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Date when the LFG was created',
    readOnly: true,
    example: '2023-01-15T12:30:45Z',
  })
  @IsDate()
  createdAt: Date;
}

export class MiniLFGResponseWithUser
  extends LFGMiniResponse
  implements IMiniLFGResponseWithUser
{
  @ApiProperty({
    description: 'User affiliated with the LFG',
    type: () => MiniUserResponse,
    readOnly: true,
  })
  @ValidateNested()
  @Type(() => MiniUserResponse)
  user: IMiniUserResponse;
}

export class MiniLFGResponseWithCategory
  extends LFGMiniResponse
  implements IMiniLFGResponseWithCategory
{
  @ApiProperty({ type: [CategoryMiniResponse], readOnly: true, description: 'Categories affiliated with the LFG' })
  @ValidateNested({ each: true })
  @Type(() => CategoryMiniResponse)
  categories: ICategoryMiniResponse[];
}

export class LFGResponse extends LFGMiniResponse implements ILFGResponse {
  @ApiProperty({
    description: 'User affiliated with the LFG',
    type: () => UserResponse,
    readOnly: true,
  })
  @ValidateNested()
  @Type(() => UserResponse)
  user: IUserResponse;

  @ApiProperty({ type: [CareerCategoryResponse], readOnly: true, description: 'Categories affiliated with the LFG' })
  @ValidateNested({ each: true })
  @Type(() => CareerCategoryResponse)
  careers: ICareerCategoryResponse[];
}
