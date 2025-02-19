import { ArgumentsHost } from '@nestjs/common';
import { PostgresError } from 'postgres';
import { PostgresExceptionFilter } from '../postgresExceptionFilter';

describe('PostgresExceptionFilter', () => {
  let filter: PostgresExceptionFilter;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new PostgresExceptionFilter();
    host = {
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/test' }),
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
      }),
    };
  });

  it('should handle PostgresError with code 23505', () => {
    const exception: PostgresError = { code: '23505' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(409);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Unproccessable Entity: Unique Entity Violation',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle PostgresError with code 23503', () => {
    const exception: PostgresError = { code: '23503' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(422);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Unprocessable Entity: Foreign Key Constraint',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle PostgresError with code 42P01', () => {
    const exception: PostgresError = { code: '42P01' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(400);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Bad Request: Undefined Table',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle PostgresError with code 42703', () => {
    const exception: PostgresError = { code: '42703' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(422);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Unprocessable Entity: Undefined column mentioned',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle PostgresError with code 08006', () => {
    const exception: PostgresError = { code: '08006' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(503);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Service Unavailable: Database Connection Error',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle PostgresError with code 53300', () => {
    const exception: PostgresError = { code: '53300' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(503);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Service Unavailable: Too many connections',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle PostgresError with code 57014', () => {
    const exception: PostgresError = { code: '57014' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(503);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Service Unavailable: Database Timeout',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle unknown PostgresError code', () => {
    const exception: PostgresError = { code: 'unknown' } as PostgresError;
    filter.catch(exception, host);

    expect(host.switchToHttp().getResponse().status).toHaveBeenCalledWith(500);
    expect(host.switchToHttp().getResponse().json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      timestamp: expect.any(String),
      path: '/test',
    });
  });
});
