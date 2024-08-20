export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}

export interface Links {
  first: string;
  prev: string;
  next: string;
}

export type QueryType = Record<string, number | string | Date | boolean>;

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
  field: string;
  order: "asc" | "desc";
}

export interface BasePaginationRequest {
  page: number;
  pageSize: number;
}

export abstract class BaseQuery<TResponseType extends string = string> {
  sort?: BaseSortRequest;
  pagination?: BasePaginationRequest;
  returnFullCount?: boolean = false;
  responseType?: TResponseType;

  abstract query?: QueryType;
}

// Possibly validate these with class validator later
