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
  query?: Partial<BaseQueryType>;
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

export interface FullCountRequest {
  returnFullCount: boolean;
}

export interface ResponseTypeRequest<TResponseType extends string> {
  responseType: TResponseType;
}

export type BaseQueryType<TResponseType extends string = string> =
  BaseSortRequest &
    FullCountRequest &
    ResponseTypeRequest<TResponseType> &
    BasePaginationRequest;

// Possibly validate these with class validator later
