import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipDrizzleRepository } from '../group-membership.repository';
import { UserDrizzleRepository } from '../../users/user.repository';
import {
  GroupMembershipResponsesEnum,
  GroupMembershipSortingEnum,
  groupRoleEnum,
} from '@tournament-app/types';
import { PgSelect } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { GroupMembershipQuery } from '../dto/requests.dto';
import { GroupDrizzleRepository } from '../../group/group.repository';
import { groupToUser } from 'src/db/schema';

jest.mock('src/users/user.repository');
jest.mock('src/group/group.repository');

describe('GroupMembershipDrizzleRepository', () => {
  let repository: GroupMembershipDrizzleRepository;
  let userRepository: jest.Mocked<UserDrizzleRepository>;
  let groupRepository: jest.Mocked<GroupDrizzleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMembershipDrizzleRepository,
        UserDrizzleRepository,
        GroupDrizzleRepository,
      ],
    }).compile();

    repository = module.get<GroupMembershipDrizzleRepository>(
      GroupMembershipDrizzleRepository,
    );
    userRepository = module.get(
      UserDrizzleRepository,
    ) as jest.Mocked<UserDrizzleRepository>;
    groupRepository = module.get(
      GroupDrizzleRepository,
    ) as jest.Mocked<GroupDrizzleRepository>;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getMappingObject', () => {
    beforeEach(() => {
      userRepository.getMappingObject.mockReturnValue({
        id: groupToUser.userId,
        username: 'username',
        profilePicture: 'pfp',
      });
      groupRepository.getMappingObject.mockReturnValue({
        id: groupToUser.groupId,
        name: 'groupName',
        logo: 'logo',
      });
    });

    it('should return MINI mapping object', () => {
      const result = repository.getMappingObject(
        GroupMembershipResponsesEnum.MINI,
      );

      expect(result).toEqual({
        groupId: groupToUser.groupId,
        userId: groupToUser.userId,
        role: groupToUser.role,
      });
    });

    it('should return BASE mapping object', () => {
      const result = repository.getMappingObject(
        GroupMembershipResponsesEnum.BASE,
      );

      expect(result).toEqual({
        groupId: groupToUser.groupId,
        userId: groupToUser.userId,
        role: groupToUser.role,
        createdAt: groupToUser.createdAt,
        user: {
          id: groupToUser.userId,
          username: 'username',
          profilePicture: 'pfp',
        },
        group: {
          id: groupToUser.groupId,
          name: 'groupName',
          logo: 'logo',
        },
      });
    });

    it('should return USER_WITH_DATES mapping object', () => {
      userRepository.getMappingObject.mockReturnValue({
        id: groupToUser.userId,
        username: 'username',
        profilePicture: 'pfp',
        country: 'country',
      });

      const result = repository.getMappingObject(
        GroupMembershipResponsesEnum.USER_WITH_DATES,
      );

      expect(result).toEqual({
        id: groupToUser.userId,
        username: 'username',
        profilePicture: 'pfp',
        createdAt: groupToUser.createdAt,
        role: groupToUser.role,
        country: 'country',
      });
    });

    it('should return GROUP_MINI mapping object', () => {
      const result = repository.getMappingObject(
        GroupMembershipResponsesEnum.GROUP_MINI,
      );

      expect(result).toEqual({
        id: groupToUser.groupId,
        name: 'groupName',
        abbreviation: 'GRP',
      });
    });

    it('should return GROUP_MINI_WITH_COUNTRY mapping object', () => {
      groupRepository.getMappingObject.mockReturnValueOnce({
        id: groupToUser.groupId,
        name: 'groupName',
        logo: 'logo',
        country: 'country',
      });

      const result = repository.getMappingObject(
        GroupMembershipResponsesEnum.GROUP_MINI_WITH_COUNTRY,
      );

      expect(result).toEqual({
        id: groupToUser.groupId,
        name: 'groupName',
        logo: 'logo',
        country: 'country',
      });
    });

    it('should return GROUP_WITH_DATES mapping object', () => {
      groupRepository.getMappingObject.mockReturnValueOnce({
        id: groupToUser.groupId,
        name: 'groupName',
        logo: 'logo',
      });

      const result = repository.getMappingObject(
        GroupMembershipResponsesEnum.GROUP_WITH_DATES,
      );

      expect(result).toEqual({
        id: groupToUser.groupId,
        name: 'groupName',
        logo: 'logo',
        createdAt: groupToUser.createdAt,
        role: groupToUser.role,
      });
    });
  });

  describe('getValidWhereClause', () => {
    it('should generate where clauses for groupId', () => {
      const query: GroupMembershipQuery = {
        groupId: 1,
      };

      const clauses = repository.getValidWhereClause(query);
      expect(clauses).toHaveLength(1);
      expect(clauses[0]).toEqual(eq(groupToUser.groupId, 1));
    });

    it('should generate where clauses for userId', () => {
      const query: GroupMembershipQuery = {
        userId: 2,
      };

      const clauses = repository.getValidWhereClause(query);
      expect(clauses).toHaveLength(1);
      expect(clauses[0]).toEqual(eq(groupToUser.userId, 2));
    });

    it('should generate where clauses for role', () => {
      const query: GroupMembershipQuery = {
        role: groupRoleEnum.ADMIN,
      };

      const clauses = repository.getValidWhereClause(query);
      expect(clauses).toHaveLength(1);
      expect(clauses[0]).toEqual(eq(groupToUser.role, groupRoleEnum.ADMIN));
    });

    it('should generate multiple where clauses', () => {
      const query: GroupMembershipQuery = {
        groupId: 1,
        userId: 2,
        role: groupRoleEnum.ADMIN,
      };

      const clauses = repository.getValidWhereClause(query);
      expect(clauses).toHaveLength(3);
    });
  });

  describe('conditionallyJoin', () => {
    let mockQuery: PgSelect;

    beforeEach(() => {
      mockQuery = {
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
      } as any;
    });

    it('should apply correct joins for BASE response type', () => {
      repository.conditionallyJoin(
        mockQuery,
        GroupMembershipResponsesEnum.BASE,
      );

      expect(mockQuery.leftJoin).toHaveBeenCalledTimes(2);
      expect(mockQuery.groupBy).toHaveBeenCalledTimes(1);
    });

    it('should return query as is for MINI response type', () => {
      const result = repository.conditionallyJoin(
        mockQuery,
        GroupMembershipResponsesEnum.MINI,
      );

      expect(result).toBe(mockQuery);
      expect(mockQuery.leftJoin).not.toHaveBeenCalled();
      expect(mockQuery.groupBy).not.toHaveBeenCalled();
    });

    it('should apply correct joins for USER_WITH_DATES response type', () => {
      repository.conditionallyJoin(
        mockQuery,
        GroupMembershipResponsesEnum.USER_WITH_DATES,
      );

      expect(mockQuery.leftJoin).toHaveBeenCalledTimes(1);
      expect(mockQuery.groupBy).toHaveBeenCalledTimes(1);
    });

    it('should apply correct joins for GROUP_MINI response type', () => {
      repository.conditionallyJoin(
        mockQuery,
        GroupMembershipResponsesEnum.GROUP_MINI,
      );

      expect(mockQuery.leftJoin).toHaveBeenCalledTimes(1);
      expect(mockQuery.groupBy).toHaveBeenCalledTimes(1);
    });

    it('should apply correct joins for GROUP_MINI_WITH_COUNTRY response type', () => {
      repository.conditionallyJoin(
        mockQuery,
        GroupMembershipResponsesEnum.GROUP_MINI_WITH_COUNTRY,
      );

      expect(mockQuery.leftJoin).toHaveBeenCalledTimes(1);
      expect(mockQuery.groupBy).toHaveBeenCalledTimes(1);
    });

    it('should apply correct joins for GROUP_WITH_DATES response type', () => {
      repository.conditionallyJoin(
        mockQuery,
        GroupMembershipResponsesEnum.GROUP_WITH_DATES,
      );

      expect(mockQuery.leftJoin).toHaveBeenCalledTimes(1);
      expect(mockQuery.groupBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('sortRecord', () => {
    it('should have correct sorting fields', () => {
      expect(repository.sortRecord).toHaveProperty(
        GroupMembershipSortingEnum.CREATED_AT,
      );
      expect(repository.sortRecord).toHaveProperty(
        GroupMembershipSortingEnum.ROLE,
      );
    });
  });
});
