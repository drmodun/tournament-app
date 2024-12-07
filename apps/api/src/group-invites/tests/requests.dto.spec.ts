import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  GroupInviteQuery,
  CreateGroupInviteDto,
  UpdateGroupInviteDto,
} from '../dto/requests.dto';
import { GroupInviteResponsesEnum } from '@tournament-app/types';

describe('GroupInviteQuery', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(GroupInviteQuery, {
      userId: 1,
      groupId: 2,
      relatedLFPId: 3,
      responseType: GroupInviteResponsesEnum.WITH_USER,
      page: 1,
      pageSize: 10,
      returnFullCount: true,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with partial data', async () => {
    const dto = plainToInstance(GroupInviteQuery, {
      userId: 1,
      page: 1,
      pageSize: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid userId type', async () => {
    const dto = plainToInstance(GroupInviteQuery, {
      userId: 'invalid',
      page: 1,
      pageSize: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });

  it('should fail validation with invalid groupId type', async () => {
    const dto = plainToInstance(GroupInviteQuery, {
      groupId: 'invalid',
      page: 1,
      pageSize: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('groupId');
  });
});

describe('CreateGroupInviteDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateGroupInviteDto, {
      message: 'Test message',
      relatedLFPId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation without optional relatedLFPId', async () => {
    const dto = plainToInstance(CreateGroupInviteDto, {
      message: 'Test message',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation without required message', async () => {
    const dto = plainToInstance(CreateGroupInviteDto, {
      relatedLFPId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('message');
  });

  it('should fail validation with invalid message type', async () => {
    const dto = plainToInstance(CreateGroupInviteDto, {
      message: 123,
      relatedLFPId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('message');
  });
});

describe('UpdateGroupInviteDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(UpdateGroupInviteDto, {
      message: 'Updated message',
      relatedLFPId: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with partial data', async () => {
    const dto = plainToInstance(UpdateGroupInviteDto, {
      message: 'Updated message',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object', async () => {
    const dto = plainToInstance(UpdateGroupInviteDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid message type', async () => {
    const dto = plainToInstance(UpdateGroupInviteDto, {
      message: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('message');
  });

  it('should fail validation with invalid relatedLFPId type', async () => {
    const dto = plainToInstance(UpdateGroupInviteDto, {
      relatedLFPId: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('relatedLFPId');
  });
});
