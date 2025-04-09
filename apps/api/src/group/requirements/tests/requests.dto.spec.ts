import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateGroupRequirementsDto,
  UpdateGroupRequirementsDto,
  EloRequirementDto,
} from '../dto/requests';

describe('GroupRequirements DTOs', () => {
  describe('EloRequirementDto', () => {
    it('should validate a valid elo requirement', async () => {
      const dto = plainToInstance(EloRequirementDto, {
        categoryId: 1,
        minimumElo: 1000,
        maximumElo: 2000,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with negative elo values', async () => {
      const dto = plainToInstance(EloRequirementDto, {
        categoryId: 1,
        minimumElo: -100,
        maximumElo: 2000,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('minimumElo');
    });

    it('should fail validation with elo values above 5000', async () => {
      const dto = plainToInstance(EloRequirementDto, {
        categoryId: 1,
        minimumElo: 1000,
        maximumElo: 5500,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maximumElo');
    });

    it('should fail validation without required fields', async () => {
      const dto = plainToInstance(EloRequirementDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(3);
      expect(errors.map((e) => e.property)).toEqual([
        'categoryId',
        'minimumElo',
        'maximumElo',
      ]);
    });
  });

  describe('CreateGroupRequirementsDto', () => {
    it('should validate a valid create request', async () => {
      const dto = plainToInstance(CreateGroupRequirementsDto, {
        minimumAge: 18,
        maximumAge: 35,
        isSameCountry: true,
        eloRequirements: [
          {
            categoryId: 1,
            minimumElo: 1000,
            maximumElo: 2000,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with no optional fields', async () => {
      const dto = plainToInstance(CreateGroupRequirementsDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid age ranges', async () => {
      const dto = plainToInstance(CreateGroupRequirementsDto, {
        minimumAge: -1,
        maximumAge: 101,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(errors.map((e) => e.property)).toEqual([
        'minimumAge',
        'maximumAge',
      ]);
    });

    it('should validate nested elo requirements', async () => {
      const dto = plainToInstance(CreateGroupRequirementsDto, {
        eloRequirements: [
          {
            categoryId: 1,
            minimumElo: -100, // Invalid
            maximumElo: 6000, // Invalid
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('eloRequirements');
    });
  });

  describe('UpdateGroupRequirementsDto', () => {
    it('should validate a valid update request', async () => {
      const dto = plainToInstance(UpdateGroupRequirementsDto, {
        minimumAge: 21,
        maximumAge: 40,
        isSameCountry: false,
        eloRequirements: [
          {
            categoryId: 1,
            minimumElo: 1200,
            maximumElo: 2200,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate partial updates', async () => {
      const dto = plainToInstance(UpdateGroupRequirementsDto, {
        minimumAge: 25,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid age ranges', async () => {
      const dto = plainToInstance(UpdateGroupRequirementsDto, {
        minimumAge: -1,
        maximumAge: 101,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(errors.map((e) => e.property)).toEqual([
        'minimumAge',
        'maximumAge',
      ]);
    });

    it('should validate nested elo requirements', async () => {
      const dto = plainToInstance(UpdateGroupRequirementsDto, {
        eloRequirements: [
          {
            categoryId: 1,
            minimumElo: -100, // Invalid
            maximumElo: 6000, // Invalid
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('eloRequirements');
    });
  });
});
