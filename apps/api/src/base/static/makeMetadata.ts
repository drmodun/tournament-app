import { BaseQuery, Links, Pagination } from '@tournament-app/types';

export class MetadataMaker {
  static makeMetadataFromQuery<TResults, TQuery extends BaseQuery>(
    query: TQuery,
    results: TResults[],
    url: string,
  ) {
    const metadata = {
      pagination: this.makePagination(query, results),
      links: this.makeLinks(url, query),
      query: query?.query || {},
    };

    return metadata;
  }

  static makeLinks<TQuery extends BaseQuery>(url: string, query: TQuery) {
    const links: Links = {
      first: url.includes('page')
        ? url.replace(/page=\d+/, 'page=1')
        : `${url}?page=1`,
      prev: url.includes('page')
        ? url.replace(/page=\d+/, `page=${query?.pagination?.page - 1}`)
        : `${url}?page=${(query?.pagination?.page || 1) - 1}`,
      next: url.includes('page')
        ? url.replace(/page=\d+/, `page=${query?.pagination?.page + 1}`)
        : `${url}?page=${(query?.pagination?.page || 1) + 1}`,
    }; // TODO: potentially check wether next link exists

    return links;
  }

  static makePagination<TResult, TQuery extends BaseQuery>(
    query: TQuery,
    results: TResult[],
  ) {
    const pagination: Pagination = {
      page: query?.pagination?.page || 1,
      pageSize: query?.pagination?.pageSize || 12,
      ...(query?.returnFullCount && { total: results['value'] || 0 }),
    };

    return pagination;
  }
}
