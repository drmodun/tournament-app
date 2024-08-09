export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Links {
  first: string;
  last: string;
  prev: string;
  next: string;
}

export type QueryType = Record<string, number | string | Date>;

export interface QueryMetadata {
  pagination: Pagination;
  links?: Links;
  query?: QueryType;
}

export interface BaseQueryResponse<Entity> {
  results: Entity[];
  metadata: QueryMetadata;
}

export interface BaseSortRequest {
  sort: string;
  order: "asc" | "desc";
}

export interface BasePaginationRequest {
  page: number;
  pageSize: number;
}

export abstract class BaseQuery {
  sort: BaseSortRequest;
  pagination: BasePaginationRequest;

  abstract query: QueryType;
}
