import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GroupMembershipQuery } from '../dto/requests.dto';
import { groupRoleEnum } from '^tournament-app/types';

describe('GroupMembershipRequestsDtos', () => {
  describe('GroupMembershipQuery', () => {
    it('should pass validation of empty GroupMembershipQuery object', async () => {
      const body = {};
      const groupMembershipQuery = plainToInstance(GroupMembershipQuery, body);
      const errors = await validate(groupMembershipQuery);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation of invalid GroupMembershipQuery object', async () => {
      const body = {
        userId: 'not_a_number',
        groupId: 'not_a_number',
        role: 'invalid_role',
      };
      const groupMembershipQuery = plainToInstance(GroupMembershipQuery, body);
      const errors = await validate(groupMembershipQuery);

      expect(errors.map((x) => x.property)).toStrictEqual([
        'userId',
        'groupId',
        'role',
      ]);
    });

    it('should pass validation of valid GroupMembershipQuery object', async () => {
      const body = {
        userId: 1,
        groupId: 2,
        role: groupRoleEnum.MEMBER,
      };

      const groupMembershipQuery = plainToInstance(GroupMembershipQuery, body);
      const errors = await validate(groupMembershipQuery);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with partial valid fields', async () => {
      const body = {
        userId: 'asd1',
        role: groupRoleEnum.ADMIN,
      };

      const groupMembershipQuery = plainToInstance(GroupMembershipQuery, body);
      const errors = await validate(groupMembershipQuery);
      expect(errors).toHaveLength(1);
    });
  });
});
