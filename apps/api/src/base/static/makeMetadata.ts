import { Links, Pagination } from '@tournament-app/types';
import { BaseQuery } from '../query/baseQuery';

export class MetadataMaker {
  static makeMetadataFromQuery<TResults, TQuery extends BaseQuery>(
    query: TQuery,
    results: TResults[],
    url: string,
  ) {
    const metadata = {
      pagination: MetadataMaker.makePagination(query, results),
      links: MetadataMaker.makeLinks(url, query),
      query,
    };

    return metadata;
  }

  //TODO: fix MetadataMaker to produce valid queries

  static makeLinks<TQuery extends BaseQuery>(url: string, query: TQuery) {
    const defaultSign = url.includes('?') ? '&' : '?';

    const links: Links = {
      first: url.includes('pagination')
        ? url.replace(/page=\d+/, 'page=1')
        : `${url}${defaultSign}page=1`,
      prev: url.includes('pagination')
        ? url.replace(/page=\d+/, `page=${query?.page - 1}`)
        : `${url}${defaultSign}page=${(query?.page || 1) - 1}`,
      next: url.includes('pagination')
        ? url.replace(/page=\d+/, `page=${query?.page + 1}`)
        : `${url}${defaultSign}page=${(query?.page || 1) + 1}`,
    }; // TODO: potentially check wether next link exists

    return links;
  }

  static makePagination<TResult, TQuery extends BaseQuery>(
    query: TQuery,
    results: TResult[],
  ) {
    const pagination: Pagination = {
      page: query?.page || 1,
      pageSize: query?.pageSize || 12,
      ...(query?.returnFullCount && { total: results['value'] || 0 }),
    };

    return pagination;
  }
}
