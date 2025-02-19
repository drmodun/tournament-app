import { BaseQueryResponse } from '../query/baseResponse';

export type SwaggerExample<T> = {
  value: T;
};

export type SwaggerExamples<T> = {
  [key: string]: SwaggerExample<T>;
};

export type QueryMetadata<TQuery> = {
  pagination: {
    page: number;
    pageSize: number;
  };
  links: {
    first: string;
    prev: string;
    next: string;
  };
  query: TQuery;
};

export function generateQueryExamples<
  TResponse,
  TQuery extends { responseType?: string },
>(params: {
  examples: SwaggerExamples<TResponse>;
  baseUrl: string;
  defaultQuery: Omit<TQuery, 'responseType'>;
}): {
  responses: SwaggerExamples<BaseQueryResponse<TResponse, TQuery>>;
  schemaList: BaseQueryResponse<TResponse, TQuery>[];
} {
  const responses: SwaggerExamples<BaseQueryResponse<TResponse, TQuery>> = {};
  const schemaList: BaseQueryResponse<TResponse, TQuery>[] = [];

  for (const [key, example] of Object.entries(params.examples)) {
    const response: BaseQueryResponse<TResponse, TQuery> = {
      metadata: {
        pagination: {
          page: 1,
          pageSize: 10,
        },
        links: {
          first: `${params.baseUrl}?page=1`,
          prev: `${params.baseUrl}?page=0`,
          next: `${params.baseUrl}?page=2`,
        },
        query: {
          ...params.defaultQuery,
          responseType: key.toUpperCase(),
        } as TQuery,
      },
      results: [example.value],
    };

    responses[key] = { value: response };
    schemaList.push(response);
  }

  return { responses, schemaList };
}
