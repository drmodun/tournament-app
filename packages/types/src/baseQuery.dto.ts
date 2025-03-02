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

export interface IQueryMetadata {
  pagination: Pagination;
  links?: Links;
  query?: Partial<BaseQueryType>;
}

export interface IBaseQueryResponse<Entity> {
  results: Entity[];
  metadata: IQueryMetadata;
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

export interface BaseSearchRequest {
  search?: string;
}

export interface ResponseTypeRequest<TResponseType extends string> {
  responseType: TResponseType;
}

export type BaseQueryType<TResponseType extends string = string> =
  BaseSortRequest &
    FullCountRequest &
    ResponseTypeRequest<TResponseType> &
    BasePaginationRequest &
    BaseSearchRequest;

// Possibly validate these with class validator later
