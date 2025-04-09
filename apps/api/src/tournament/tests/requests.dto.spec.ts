import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentQuery,
} from '../dto/requests.dto';
import {
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';

describe('TournamentRequestsDtos', () => {
  describe('CreateTournamentRequest', () => {
    it('should fail validation with empty object', async () => {
      const body = {};
      const createRequest = plainToInstance(CreateTournamentRequest, body);
      const errors = await validate(createRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map((x) => x.property)).toContain('name');
      expect(errors.map((x) => x.property)).toContain('description');
      expect(errors.map((x) => x.property)).toContain('country');
    });

    it('should fail validation with invalid data types', async () => {
      const body = {
        name: 123,
        description: {},
        country: true,
        tournamentType: 'invalid_type',
        location: 'invalid_location',
        tournamentTeamType: 'invalid_team_type',
        maxParticipants: 'not_a_number',
        startDate: 'invalid_date',
        endDate: 'invalid_date',
        isPublic: 'not_a_boolean',
        isRanked: 'not_a_boolean',
        categoryId: 'not_a_number',
        creatorId: 'not_a_number',
        locationId: 'not_a_number',
      };
      const createRequest = plainToInstance(CreateTournamentRequest, body);
      const errors = await validate(createRequest);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with invalid string lengths', async () => {
      const body = {
        name: 'ab', // too short
        description: 'short', // too short
        country: 'USA', // too long
        tournamentType: tournamentTypeEnum.LEAGUE,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.SOLO,
        maxParticipants: 32,
        startDate: new Date(),
        endDate: new Date(),
        isPublic: true,
        isRanked: false,
        categoryId: 1,
        creatorId: 1,
      };
      const createRequest = plainToInstance(CreateTournamentRequest, body);
      const errors = await validate(createRequest);
      expect(errors.length).toBe(3);
      expect(errors.map((x) => x.property)).toContain('name');
      expect(errors.map((x) => x.property)).toContain('description');
    });

    it('should fail validation with invalid number ranges', async () => {
      const body = {
        name: 'Valid Tournament Name',
        description:
          'This is a valid tournament description that meets the minimum length requirement',
        country: 'DE',
        tournamentType: tournamentTypeEnum.LEAGUE,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.SOLO,
        maxParticipants: 1, // too low
        minimumMMR: -1, // too low
        maximumMMR: 20000, // too high
        startDate: new Date(),
        endDate: new Date(),
        isPublic: true,
        isRanked: false,
        categoryId: 1,
        creatorId: 1,
      };
      const createRequest = plainToInstance(CreateTournamentRequest, body);
      const errors = await validate(createRequest);
      expect(errors.length).toBe(3);
    });

    it('should pass validation with valid data', async () => {
      const body = {
        name: 'Valid Tournament Name',
        description:
          'This is a valid tournament description that meets the minimum length requirement',
        country: 'DE',
        tournamentType: tournamentTypeEnum.LEAGUE,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.SOLO,
        maxParticipants: 32,
        startDate: new Date(),
        endDate: new Date(),
        isPublic: true,
        isRanked: false,
        categoryId: 1,
        creatorId: 1,
      };
      const createRequest = plainToInstance(CreateTournamentRequest, body);
      const errors = await validate(createRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateTournamentRequest', () => {
    it('should pass validation with empty object', async () => {
      const body = {};
      const updateRequest = plainToInstance(UpdateTournamentRequest, body);
      const errors = await validate(updateRequest);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid data types', async () => {
      const body = {
        name: 123,
        description: {},
        maxParticipants: 'not_a_number',
        startDate: 'invalid_date',
        isPublic: 'not_a_boolean',
      };
      const updateRequest = plainToInstance(UpdateTournamentRequest, body);
      const errors = await validate(updateRequest);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with valid partial data', async () => {
      const body = {
        name: 'Updated Tournament Name',
        description:
          'This is an updated tournament description that meets the minimum length requirement',
        maxParticipants: 64,
      };
      const updateRequest = plainToInstance(UpdateTournamentRequest, body);
      const errors = await validate(updateRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('TournamentQuery', () => {
    it('should pass validation with empty object', async () => {
      const body = {};
      const query = plainToInstance(TournamentQuery, body);
      const errors = await validate(query);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid data types', async () => {
      const body = {
        name: 123,
        type: 'invalid_type',
        location: 'invalid_location',
        tournamentTeamType: 'invalid_team_type',
        startDate: 'invalid_date',
        endDate: 'invalid_date',
        isRanked: 'not_a_boolean',
        minimumMMR: 'not_a_number',
        maximumMMR: 'not_a_number',
        categoryId: 'not_a_number',
        minParticipants: 'not_a_number',
        maxParticipants: 'not_a_number',
      };
      const query = plainToInstance(TournamentQuery, body);
      const errors = await validate(query);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with valid data', async () => {
      const body = {
        name: 'Tournament Search',
        type: tournamentTypeEnum.LEAGUE,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.SOLO,
        startDate: new Date(),
        endDate: new Date(),
        isRanked: true,
        minimumMMR: 1000,
        maximumMMR: 2000,
        categoryId: 1,
        minParticipants: 8,
        maxParticipants: 32,
        isPublic: true,
      };
      const query = plainToInstance(TournamentQuery, body);
      const errors = await validate(query);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with valid ranges', async () => {
      const body = {
        minimumMMR: 0,
        maximumMMR: 10000,
        minParticipants: 2,
        maxParticipants: 1024,
      };
      const query = plainToInstance(TournamentQuery, body);
      const errors = await validate(query);
      expect(errors).toHaveLength(0);
    });
  });
});
