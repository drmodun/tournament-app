import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PostgresError } from 'postgres';

export interface TranslatedError {
  message: string;
  statusCode: number;
}

enum PostgresErrorCode {
  UniqueViolation = '23505',
  ForeignKeyViolation = '23503',
  UndefinedTable = '42P01',
  UndefinedColumn = '42703',
  DatabaseConnectionError = '08006',
  TooManyConnections = '53300',
  DatabaseTimeout = '57014',
}

@Catch(PostgresError)
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(exception: PostgresError, host: ArgumentsHost) {
    console.log(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const translatedError = this.errorTranslations.get(exception.code) || {
      message: 'Internal Server Error',
      statusCode: 500,
    };

    response.status(translatedError.statusCode).json({
      message: translatedError.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private readonly errorTranslations = new Map<string, TranslatedError>([
    [
      PostgresErrorCode.UniqueViolation,
      {
        message: 'Unproccessable Entity: Unique Entity Violation',
        statusCode: 409,
      },
    ],
    [
      PostgresErrorCode.ForeignKeyViolation,
      {
        message: 'Unprocessable Entity: Foreign Key Constraint',
        statusCode: 422,
      },
    ],
    [
      PostgresErrorCode.UndefinedTable,
      { message: 'Bad Request: Undefined Table', statusCode: 400 },
    ],
    [
      PostgresErrorCode.UndefinedColumn,
      {
        message: 'Unprocessable Entity: Undefined column mentioned',
        statusCode: 422,
      },
    ],
    [
      PostgresErrorCode.DatabaseConnectionError,
      {
        message: 'Service Unavailable: Database Connection Error',
        statusCode: 503,
      },
    ],
    [
      PostgresErrorCode.TooManyConnections,
      { message: 'Service Unavailable: Too many connections', statusCode: 503 },
    ],
    [
      PostgresErrorCode.DatabaseTimeout,
      { message: 'Service Unavailable: Database Timeout', statusCode: 503 },
    ],
  ]);
}
