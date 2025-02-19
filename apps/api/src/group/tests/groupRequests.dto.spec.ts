import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupQuery,
} from '../dto/requests.dto';
import { groupFocusEnum, groupTypeEnum } from '@tournament-app/types';

describe('GroupRequestsDtos', () => {
  describe('CreateGroupRequest', () => {
    it('should fail validation of empty CreateGroupRequest object', async () => {
      const body = {};
      const createGroupRequest = plainToInstance(CreateGroupRequest, body);
      const errors = await validate(createGroupRequest);
      expect(errors.map((x) => x.property)).toStrictEqual([
        'name',
        'abbreviation',
        'description',
        'type',
        'focus',
        'logo',
      ]);
    });

    it('should fail validation of invalid CreateGroupRequest object', async () => {
      const body = {
        name: 'CC',
        abbreviation: 'C',
        description: 'Ch',
        type: 'invalid_type',
        focus: 'invalid_focus',
        logo: 'not_a_url',
        location: '',
        country: '',
      };
      const createGroupRequest = plainToInstance(CreateGroupRequest, body);
      const errors = await validate(createGroupRequest);

      expect(errors.map((x) => x.property)).toStrictEqual([
        'name',
        'abbreviation',
        'description',
        'type',
        'focus',
        'logo',
      ]);
    });

    it('should pass validation of valid CreateGroupRequest object', async () => {
      const body = {
        name: 'Chess Club',
        abbreviation: 'CC',
        description: 'A community of chess enthusiasts',
        type: groupTypeEnum.PRIVATE,
        focus: groupFocusEnum.ORGANIZATION,
        logo: 'https://example.com/logo.jpg',
        location: 'Split',
        country: 'Croatia',
      };

      const createGroupRequest = plainToInstance(CreateGroupRequest, body);
      const errors = await validate(createGroupRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateGroupRequest', () => {
    it('should pass validation of empty UpdateGroupRequest object', async () => {
      const body = {};
      const updateGroupRequest = plainToInstance(UpdateGroupRequest, body);
      const errors = await validate(updateGroupRequest);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation of invalid UpdateGroupRequest object', async () => {
      const body = {
        name: 'CC',
        abbreviation: 'C',
        description: 'Ch',
        type: 'invalid_type',
        focus: 'invalid_focus',
        logo: 'not_a_url',
      };
      const updateGroupRequest = plainToInstance(UpdateGroupRequest, body);
      const errors = await validate(updateGroupRequest);

      expect(errors.map((x) => x.property)).toStrictEqual([
        'name',
        'abbreviation',
        'description',
        'type',
        'focus',
        'logo',
      ]);
    });

    it('should pass validation of valid UpdateGroupRequest object', async () => {
      const body = {
        name: 'Chess Club Updated',
        abbreviation: 'CCU',
        description: 'Updated community of chess enthusiasts',
        type: groupTypeEnum.PRIVATE,
        focus: groupFocusEnum.PARTICIPATION,
        logo: 'https://example.com/updated-logo.jpg',
        location: 'Zagreb',
        country: 'Croatia',
      };

      const updateGroupRequest = plainToInstance(UpdateGroupRequest, body);
      const errors = await validate(updateGroupRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('GroupQuery', () => {
    it('should pass validation of empty GroupQuery object', async () => {
      const body = {};
      const groupQuery = plainToInstance(GroupQuery, body);
      const errors = await validate(groupQuery);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation of invalid GroupQuery object', async () => {
      const body = {
        type: 'invalid_type',
        focus: 'invalid_focus',
      };
      const groupQuery = plainToInstance(GroupQuery, body);
      const errors = await validate(groupQuery);

      expect(errors.map((x) => x.property)).toStrictEqual(['type', 'focus']);
    });

    it('should pass validation of valid GroupQuery object', async () => {
      const body = {
        name: 'Chess',
        abbreviation: 'CC',
        type: groupTypeEnum.PUBLIC,
        focus: groupFocusEnum.HYBRID,
        location: 'Split',
        country: 'Croatia',
      };

      const groupQuery = plainToInstance(GroupQuery, body);
      const errors = await validate(groupQuery);
      expect(errors).toHaveLength(0);
    });
  });
});
