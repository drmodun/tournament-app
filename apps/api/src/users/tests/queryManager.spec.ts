import { Test, TestingModule } from '@nestjs/testing';
import { UserDrizzleRepository } from '../repository';
import {
  CreateUserRequest,
  FullUserQuery,
  UserResponsesEnum,
  UserSortingEnum,
} from '@tournament-app/types';

describe('UserDrizzleRepository', () => {
  let repository: UserDrizzleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDrizzleRepository],
    }).compile();

    repository = module.get<UserDrizzleRepository>(UserDrizzleRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
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

      const result = repository.getQuery(query);

      const sql = result.toSQL().sql;
      const params = result.toSQL().params;

      expect(Object.keys(result._.selectedFields)).toStrictEqual([
        'id',
        'username',
        'profilePicture',
        'country',
        'bio',
        'email',
        'level',
        'updatedAt',
        'followers',
      ]);
      expect(params).toEqual(['john_doe', 'USA', 10]);

      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."username" = ');
      expect(sql).toContain('and "user"."country" = ');
      expect(sql).toContain('order by "user"."username" asc');
      expect(sql).toContain('limit $3');
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

      const result = repository.getQuery(query);

      const sql = result.toSQL().sql;
      const params = result.toSQL().params;

      expect(params).toEqual(['John Doe', 'New York', 20, 20]);
      expect(Object.keys(result._.selectedFields)).toStrictEqual([
        'id',
        'username',
        'profilePicture',
        'country',
        'bio',
        'email',
        'level',
        'updatedAt',
        'followers',
        'following',
        'location',
        'createdAt',
      ]);

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

      const result = repository.getSingleQuery(id, responseType);

      const sql = result.toSQL().sql;
      const params = result.toSQL().params;

      expect(params).toEqual([123, true, true]);

      expect(Object.keys(result._.selectedFields)).toStrictEqual([
        'id',
        'username',
        'profilePicture',
        'country',
        'bio',
        'email',
        'level',
        'updatedAt',
        'followers',
      ]);

      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."id" = ');
      expect(sql).toContain('and "user"."is_email_verified" = $2');
      expect(sql).toContain('and "user"."has_selected_interests" = $3');
    });

    it('should return a valid single query with extended response type', () => {
      const id = 456;
      const responseType = UserResponsesEnum.EXTENDED;

      const result = repository.getSingleQuery(id, responseType);

      const sql = result.toSQL().sql;
      const params = result.toSQL().params;

      expect(params).toEqual([456, true, true]);

      expect(Object.keys(result._.selectedFields)).toStrictEqual([
        'id',
        'username',
        'profilePicture',
        'country',
        'bio',
        'email',
        'level',
        'updatedAt',
        'followers',
        'following',
        'location',
        'createdAt',
      ]);

      expect(sql).toContain('from "user"');
      expect(sql).toContain('where ("user"."id" = ');
      expect(sql).toContain('and "user"."is_email_verified" = $2');
      expect(sql).toContain('and "user"."has_selected_interests" = $3');
    });
  });

  it('should create a valid entity given a valid request', () => {
    const request: CreateUserRequest = {
      username: 'john_doe',
      email: 'john.doe@gmail.com',
      bio: 'I am a cool person',
      country: 'USA',
      name: 'John Doe',
      password: 'password123',
      location: 'New York',
      profilePicture: 'https://www.google.com',
    };

    const result = repository.createEntity(request);

    const sql = result.toSQL().sql;
    const params = result.toSQL().params;

    Object.values(request).every((value) => expect(params).toContain(value));
    expect(sql).toContain('insert into "user"');
    expect(sql).toContain('values');
    expect(sql).toContain('returning "id"');
  });

  it('should update a valid entity given a valid request', () => {
    const request: Partial<CreateUserRequest> = {
      username: 'john_doe',
      email: 'john.doe@gmail.com',
      bio: 'I am a cool person',
      country: 'USA',
      name: 'John Doe',
      password: 'password123',
      location: 'New York',
      profilePicture: 'https://www.google.com',
    };

    const result = repository.updateEntity(123, request);

    const sql = result.toSQL().sql;
    const params = result.toSQL().params;

    Object.values(request).every((value) => expect(params).toContain(value));

    expect(params).toContain(123);
    expect(sql).toContain('update "user"');
    expect(sql).toContain('set');
    expect(sql).toContain('where "user"."id" ');
    expect(sql).toContain('returning "id"');
  });

  it('should delete a valid entity given a valid id', () => {
    const result = repository.deleteEntity(123);

    const sql = result.toSQL().sql;
    const params = result.toSQL().params;

    expect(params).toContain(123);
    expect(sql).toContain('delete from "user"');
    expect(sql).toContain('where "user"."id" = ');
    expect(sql).toContain('returning "id"');
  });

  it('should check if an entity exists given a valid id', () => {
    const result = repository.entityExists(123);

    const sql = result.toSQL().sql;
    const params = result.toSQL().params;

    expect(params).toContain(123);
    expect(sql).toContain('select exists($1)');
    expect(sql).toContain('from "user"');
  });
});
