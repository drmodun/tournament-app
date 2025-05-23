import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { QueryParticipationDto } from '../../dto/requests.dto';
import { ParticipationResponsesEnum } from '^tournament-app/types';

describe('QueryParticipationDto', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let dto: QueryParticipationDto;

  beforeEach(() => {
    dto = new QueryParticipationDto();
  });

  describe('validation', () => {
    it('should pass with valid data', async () => {
      const data = {
        tournamentId: '1',
        userId: '2',
        groupId: '3',
        page: 1,
        pageSize: 10,
        responseType: ParticipationResponsesEnum.BASE,
      };

      const dtoInstance = plainToInstance(QueryParticipationDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.tournamentId).toBe(1);
      expect(dtoInstance.userId).toBe(2);
      expect(dtoInstance.groupId).toBe(3);
    });

    it('should pass with partial data', async () => {
      const data = {
        tournamentId: '1',
        page: 1,
        pageSize: 10,
      };

      const dtoInstance = plainToInstance(QueryParticipationDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(dtoInstance.tournamentId).toBe(1);
      expect(dtoInstance.userId).toBeUndefined();
      expect(dtoInstance.groupId).toBeUndefined();
    });

    it('should transform string numbers to integers', async () => {
      const data = {
        tournamentId: '123',
        userId: '456',
        groupId: '789',
      };

      const dtoInstance = plainToInstance(QueryParticipationDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(0);
      expect(typeof dtoInstance.tournamentId).toBe('number');
      expect(typeof dtoInstance.userId).toBe('number');
      expect(typeof dtoInstance.groupId).toBe('number');
    });

    it('should fail with negative numbers', async () => {
      const data = {
        tournamentId: '-1',
        userId: '-2',
        groupId: '-3',
      };

      const dtoInstance = plainToInstance(QueryParticipationDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(3);
      expect(errors[0].constraints).toHaveProperty('isPositive');
      expect(errors[1].constraints).toHaveProperty('isPositive');
      expect(errors[2].constraints).toHaveProperty('isPositive');
    });

    it('should fail with non-numeric values', async () => {
      const data = {
        tournamentId: 'abc',
        userId: 'def',
        groupId: 'ghi',
      };

      const dtoInstance = plainToInstance(QueryParticipationDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBe(3);
      expect(errors[0].constraints).toHaveProperty('isInt');
      expect(errors[1].constraints).toHaveProperty('isInt');
      expect(errors[2].constraints).toHaveProperty('isInt');
    });

    it('should inherit and validate base query properties', async () => {
      const data = {
        tournamentId: '1',
        page: -1,
        pageSize: 0,
        responseType: 'INVALID_TYPE',
      };

      const dtoInstance = plainToInstance(QueryParticipationDto, data);
      const errors = await validate(dtoInstance);

      expect(errors.length).toBeGreaterThan(0);
      const errorProperties = errors.map((error) => error.property);
      expect(errorProperties).toContain('page');
      expect(errorProperties).toContain('pageSize');
    });
  });
});
