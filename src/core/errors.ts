import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function normalizeError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details ?? undefined
    };
  }

  if (error instanceof ZodError) {
    return {
      message: 'Invalid request payload',
      statusCode: 400,
      details: { issues: error.issues }
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    };
  }

  return {
    message: 'Unknown error',
    statusCode: 500
  };
}
