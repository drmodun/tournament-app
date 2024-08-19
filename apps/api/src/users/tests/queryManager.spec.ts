import { Test, TestingModule } from '@nestjs/testing';
import { UserDrizzleQueryManager } from '../queryManager';
import {
  FullUserQuery,
  UserResponsesEnum,
  UserSortingEnum,
} from '@tournament-app/types';

describe('UserDrizzleQueryManager', () => {
  let queryManager: UserDrizzleQueryManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDrizzleQueryManager],
    }).compile();

    queryManager = module.get<UserDrizzleQueryManager>(UserDrizzleQueryManager);
  });

  it('should be defined', () => {
    expect(queryManager).toBeDefined();
  });

  describe('getQuery', () => {
    it('should return a valid query with base response type', () => {
      const query: FullUserQuery = {
        responseType: UserResponsesEnum.BASE,
        query: {
          username: 'john_doe',
          country: 'USA',
        },
        sort: {
          field: UserSortingEnum.USERNAME,
          order: 'asc',
        },
        pagination: {
          page: 1,
          pageSize: 10,
        },
      };

      const result = queryManager.getQuery(query);

      const sql = result.toSQL().sql;

      expect(sql).toContain('select');
      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."username" = ');
      expect(sql).toContain('and "user"."country" = ');
      expect(sql).toContain('order by "user"."username" asc');
      expect(sql).toContain('limit $3');
      expect(sql).toContain('offset $4');
    });

    it('should return a valid query with extended response type', () => {
      const query: FullUserQuery = {
        responseType: UserResponsesEnum.EXTENDED,
        query: {
          name: 'John Doe',
          location: 'New York',
        },
        sort: {
          field: UserSortingEnum.LEVEL,
          order: 'desc',
        },
        pagination: {
          page: 2,
          pageSize: 20,
        },
      };

      const result = queryManager.getQuery(query);

      const sql = result.toSQL().sql;

      expect(sql).toContain('select');
      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."name" = ');
      expect(sql).toContain('and "user"."location" = ');
      expect(sql).toContain('order by "user"."level" desc');
      expect(sql).toContain('limit $3');
      expect(sql).toContain('offset $4');
    });
  });

  describe('getSingleQuery', () => {
    it('should return a valid single query with base response type', () => {
      const id = 123;
      const responseType = UserResponsesEnum.BASE;

      const result = queryManager.getSingleQuery(id, responseType);

      const sql = result.toSQL().sql;

      expect(sql).toContain('select');
      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."id" = ');
      expect(sql).toContain('and "user"."is_email_verified" = $2');
      expect(sql).toContain('and "user"."has_selected_interests" = $3');
    });

    it('should return a valid single query with extended response type', () => {
      const id = 456;
      const responseType = UserResponsesEnum.EXTENDED;

      const result = queryManager.getSingleQuery(id, responseType);

      const sql = result.toSQL().sql;
      const params = result.toSQL().params;

      expect(params).toEqual([456, true, true]);

      expect(sql).toContain('select');
      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."id" = ');
      expect(sql).toContain('and "user"."is_email_verified" = $2');
      expect(sql).toContain('and "user"."has_selected_interests" = $3');
    });
  });
});
