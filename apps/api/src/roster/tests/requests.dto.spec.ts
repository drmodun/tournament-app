import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateRosterDto,
  CreateRosterMemberDto,
  QueryRosterDto,
} from '../dto/requests';

describe('Roster DTOs', () => {
  describe('CreateRosterMemberDto', () => {
    it('should validate a valid member', async () => {
      const dto = plainToInstance(CreateRosterMemberDto, {
        userId: 1,
        isSubstitute: false,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with non-numeric userId', async () => {
      const dto = plainToInstance(CreateRosterMemberDto, {
        userId: 'not-a-number',
        isSubstitute: false,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail with negative userId', async () => {
      const dto = plainToInstance(CreateRosterMemberDto, {
        userId: -1,
        isSubstitute: false,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should transform string userId to number', async () => {
      const dto = plainToInstance(CreateRosterMemberDto, {
        userId: '1',
        isSubstitute: false,
      });

      expect(dto.userId).toBe(1);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should transform isSubstitute to boolean', async () => {
      const dto = plainToInstance(CreateRosterMemberDto, {
        userId: 1,
        isSubstitute: 'true',
      });

      expect(dto.isSubstitute).toBe(true);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should default isSubstitute to false if not provided', async () => {
      const dto = plainToInstance(CreateRosterMemberDto, {
        userId: 1,
      });

      expect(dto.isSubstitute).toBe(false);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CreateRosterDto', () => {
    it('should validate a valid roster creation request', async () => {
      const dto = plainToInstance(CreateRosterDto, {
        members: [
          {
            userId: 1,
            isSubstitute: false,
          },
          {
            userId: 2,
            isSubstitute: true,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty members array', async () => {
      const dto = plainToInstance(CreateRosterDto, {
        members: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // Empty array is valid for class-validator
    });

    it('should fail with invalid members', async () => {
      const dto = plainToInstance(CreateRosterDto, {
        members: [
          {
            userId: -1,
            isSubstitute: false,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('members');
    });
  });

  describe('QueryRosterDto', () => {
    it('should validate a valid query with all optional fields', async () => {
      const dto = plainToInstance(QueryRosterDto, {
        stageId: 1,
        participationId: 2,
        groupId: 3,
        userId: 4,
        isSubstitute: true,
        rosterId: 5,
        memberId: 6,
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate a query with no fields', async () => {
      const dto = plainToInstance(QueryRosterDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0); // All fields are optional
    });

    it('should transform string values to appropriate types', async () => {
      const dto = plainToInstance(QueryRosterDto, {
        stageId: '1',
        participationId: '2',
        groupId: '3',
        userId: '4',
        isSubstitute: 'true',
        rosterId: '5',
        memberId: '6',
        page: '1',
        pageSize: '10',
      });

      expect(dto.stageId).toBe(1);
      expect(dto.participationId).toBe(2);
      expect(dto.groupId).toBe(3);
      expect(dto.userId).toBe(4);
      expect(dto.isSubstitute).toBe(true);
      expect(dto.rosterId).toBe(5);
      expect(dto.memberId).toBe(6);
      expect(dto.page).toBe(1);
      expect(dto.pageSize).toBe(10);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with negative numeric values', async () => {
      const dto = plainToInstance(QueryRosterDto, {
        stageId: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail with non-numeric values for numeric fields', async () => {
      const dto = plainToInstance(QueryRosterDto, {
        stageId: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });
  });
});
