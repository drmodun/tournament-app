import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { BaseQuery } from '@tournament-app/types';

export const FullQuery = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const query = request.query as BaseQuery;

  validatePagination(query);

  return query;
});

const validatePagination = (query: BaseQuery) => {
  if (query.pagination?.page < 1) {
    throw new BadRequestException('Page must be greater than 0');
  }

  if (query.pagination?.pageSize < 1) {
    throw new BadRequestException('Page size must be greater than 0');
  }

  if (query.pagination?.pageSize > 100) {
    throw new BadRequestException('Page size must be less than 100');
  }
};
