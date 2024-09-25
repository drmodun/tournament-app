import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import {
  BaseQueryType,
  IBaseQueryResponse,
  IQueryMetadata,
  Links,
  Pagination,
} from '@tournament-app/types';
import { IsOptional } from 'class-validator';

export class PaginationInstance implements Pagination {
  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  pageSize: number;

  @ApiPropertyOptional()
  @IsOptional()
  total?: number;
}

export class LinksInstance implements Links {
  @ApiResponseProperty()
  first: string;

  @ApiResponseProperty()
  prev: string;

  @ApiResponseProperty()
  next: string;
}

export class QueryMetadata<IQuery extends Partial<BaseQueryType>>
  implements IQueryMetadata
{
  @ApiResponseProperty()
  pagination: PaginationInstance;

  @IsOptional()
  @ApiPropertyOptional()
  links?: LinksInstance;

  @IsOptional()
  @ApiPropertyOptional()
  query?: IQuery;
}

export class BaseQueryResponse<Entity, IQuery extends Partial<BaseQueryType>>
  implements IBaseQueryResponse<Entity>
{
  @ApiProperty({ isArray: true })
  results: Entity[];

  @ApiResponseProperty()
  metadata: QueryMetadata<IQuery>;
}
