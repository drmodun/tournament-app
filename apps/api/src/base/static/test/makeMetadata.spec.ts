import { BaseQuery } from 'src/base/query/baseQuery';
import { MetadataMaker } from '../makeMetadata';

describe('MetadataMaker', () => {
  describe('makeMetadataFromQuery', () => {
    it('should return the correct metadata', () => {
      const query: BaseQuery = {
        field: 'username',
        order: 'asc',
        page: 1,
        pageSize: 10,
      };

      const results = [
        { id: 1, username: 'john_doe' },
        { id: 2, username: 'jane_doe' },
      ];

      const url = 'https://example.com/api/users';

      const metadata = MetadataMaker.makeMetadataFromQuery(query, results, url);

      expect(metadata).toStrictEqual({
        pagination: {
          page: 1,
          pageSize: 10,
        },
        links: {
          first: 'https://example.com/api/users?page=1',
          prev: 'https://example.com/api/users?page=0',
          next: 'https://example.com/api/users?page=2',
        },
        query: {
          field: 'username',
          order: 'asc',
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  describe('makeLinks', () => {
    it('should return the correct links', () => {
      const url = 'https://example.com/api/users';
      const query: BaseQuery = {
        field: 'username',
        order: 'asc',
        page: 1,
        pageSize: 10,
      };

      const links = MetadataMaker.makeLinks(url, query);

      expect(links).toEqual({
        first: 'https://example.com/api/users?page=1',
        prev: 'https://example.com/api/users?page=0',
        next: 'https://example.com/api/users?page=2',
      });
    });

    it('should handle URLs without page query parameter', () => {
      const url = 'https://example.com/api/users';
      const query: BaseQuery = {
        field: 'username',
        order: 'asc',
        page: undefined,
        pageSize: 10,
      };

      const links = MetadataMaker.makeLinks(url, query);

      expect(links).toEqual({
        first: 'https://example.com/api/users?page=1',
        prev: 'https://example.com/api/users?page=0',
        next: 'https://example.com/api/users?page=2',
      });
    });
  });

  describe('makePagination', () => {
    it('should return the correct pagination', () => {
      const query: BaseQuery = {
        page: 1,
        pageSize: 10,
        field: 'username',
        order: 'asc',
        returnFullCount: true,
      };

      const results = [
        { id: 1, username: 'john_doe' },
        { id: 2, username: 'jane_doe' },
      ];

      results['value'] = 2;

      const pagination = MetadataMaker.makePagination(query, results);

      expect(pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
      });
    });

    it('should return the correct pagination when returnFullCount is false', () => {
      const query: BaseQuery = {
        page: 1,
        pageSize: 10,
        field: 'username',
        order: 'asc',
        returnFullCount: false,
      };

      const results = [
        { id: 1, username: 'john_doe' },
        { id: 2, username: 'jane_doe' },
      ];

      const pagination = MetadataMaker.makePagination(query, results);

      expect(pagination).toEqual({
        page: 1,
        pageSize: 10,
      });
    });
  });
});
