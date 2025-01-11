import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  GroupJoinRequestQuery,
  CreateGroupJoinRequestDto,
  UpdateGroupJoinRequestDto,
} from '../dto/requests.dto';
import { GroupJoinRequestResponsesEnum } from '@tournament-app/types';

describe('GroupJoinRequestQuery', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(GroupJoinRequestQuery, {
      userId: 1,
      groupId: 2,
      relatedLFPId: 3,
      responseType: GroupJoinRequestResponsesEnum.WITH_USER,
      page: 1,
      pageSize: 10,
      returnFullCount: true,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with partial data', async () => {
    const dto = plainToInstance(GroupJoinRequestQuery, {
      userId: 1,
      page: 1,
      pageSize: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid userId type', async () => {
    const dto = plainToInstance(GroupJoinRequestQuery, {
      userId: 'invalid',
      page: 1,
      pageSize: 10,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });
});

describe('CreateGroupJoinRequestDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateGroupJoinRequestDto, {
      message: 'Test message',
      relatedLFPId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation without optional relatedLFPId', async () => {
    const dto = plainToInstance(CreateGroupJoinRequestDto, {
      message: 'Test message',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation without required message', async () => {
    const dto = plainToInstance(CreateGroupJoinRequestDto, {
      relatedLFPId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('message');
  });

  it('should fail validation with invalid message type', async () => {
    const dto = plainToInstance(CreateGroupJoinRequestDto, {
      message: 123,
      relatedLFPId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('message');
  });
});

describe('UpdateGroupJoinRequestDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(UpdateGroupJoinRequestDto, {
      message: 'Updated message',
      relatedLFPId: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object (all fields optional)', async () => {
    const dto = plainToInstance(UpdateGroupJoinRequestDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid message type', async () => {
    const dto = plainToInstance(UpdateGroupJoinRequestDto, {
      message: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('message');
  });

  it('should fail validation with invalid relatedLFPId type', async () => {
    const dto = plainToInstance(UpdateGroupJoinRequestDto, {
      relatedLFPId: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('relatedLFPId');
  });
});
