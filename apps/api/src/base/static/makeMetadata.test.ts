import { MetadataMaker } from './makeMetadata';
import { BaseQuery } from '@tournament-app/types';

describe('MetadataMaker', () => {
  describe('makeMetadataFromQuery', () => {
    it('should return the correct metadata', () => {
      const query: BaseQuery = {
        query: {
          username: 'john_doe',
          country: 'USA',
        },
        sort: {
          field: 'username',
          order: 'asc',
        },
        pagination: {
          page: 1,
          pageSize: 10,
        },
      };

      const results = [
        { id: 1, username: 'john_doe' },
        { id: 2, username: 'jane_doe' },
      ];

      const url = 'https://example.com/api/users';

      const metadata = MetadataMaker.makeMetadataFromQuery(query, results, url);

      expect(metadata).toEqual({
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
          username: 'john_doe',
          country: 'USA',
        },
      });
    });
  });

  describe('makeLinks', () => {
    it('should return the correct links', () => {
      const url = 'https://example.com/api/users';
      const query: BaseQuery = {
        query: {
          username: 'john_doe',
          country: 'USA',
        },
        sort: {
          field: 'username',
          order: 'asc',
        },
        pagination: {
          page: 1,
          pageSize: 10,
        },
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
        query: {
          username: 'john_doe',
          country: 'USA',
        },
        sort: {
          field: 'username',
          order: 'asc',
        },
        pagination: {
          page: undefined,
          pageSize: 10,
        },
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
        query: {
          username: 'john_doe',
          country: 'USA',
        },
        sort: {
          field: 'username',
          order: 'asc',
        },
        pagination: {
          page: 1,
          pageSize: 10,
        },
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
        query: {
          username: 'john_doe',
          country: 'USA',
        },
        sort: {
          field: 'username',
          order: 'asc',
        },
        pagination: {
          page: 1,
          pageSize: 10,
        },
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
