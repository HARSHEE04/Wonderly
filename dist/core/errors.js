import { ZodError } from 'zod';
export class ApiError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
    }
}
export function normalizeError(error) {
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
