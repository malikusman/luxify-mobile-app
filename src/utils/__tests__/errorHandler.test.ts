import { AxiosError } from 'axios';
import { handleApiError, getErrorMessage, ApiException } from '../errorHandler';

// Helper to create proper AxiosError mocks
const createAxiosError = (overrides: any = {}): AxiosError => {
    const error = Object.create(AxiosError.prototype);
    error.message = overrides.message || 'Request failed';
    error.response = overrides.response || undefined;
    error.code = overrides.code || undefined;
    error.isAxiosError = true;
    Object.setPrototypeOf(error, AxiosError.prototype);
    return error as AxiosError;
};

describe('errorHandler', () => {
    describe('handleApiError', () => {
        it('should handle ApiException', () => {
            const error = new ApiException('Test error', 400, ['Error 1', 'Error 2']);
            const result = handleApiError(error);

            expect(result.message).toBe('Test error');
            expect(result.statusCode).toBe(400);
            expect(result.errors).toEqual(['Error 1', 'Error 2']);
        });

        it('should handle AxiosError with success: false format', () => {
            const error = createAxiosError({
                response: {
                    status: 400,
                    data: {
                        success: false,
                        message: 'Invalid email or password',
                        errors: {},
                    },
                },
            });

            const result = handleApiError(error);

            expect(result.message).toBe('Invalid email or password');
            expect(result.statusCode).toBe(400);
            expect(result.errors).toEqual([]);
        });

        it('should handle AxiosError with errors array', () => {
            const error = createAxiosError({
                response: {
                    status: 422,
                    data: {
                        success: false,
                        message: 'Validation failed',
                        errors: ['Email is required', 'Password too short'],
                    },
                },
            });

            const result = handleApiError(error);

            expect(result.message).toBe('Validation failed');
            expect(result.statusCode).toBe(422);
            expect(result.errors).toEqual(['Email is required', 'Password too short']);
        });

        it('should handle AxiosError with field-specific errors object', () => {
            const error = createAxiosError({
                response: {
                    status: 422,
                    data: {
                        success: false,
                        message: 'Validation failed',
                        errors: {
                            email: ['is required', 'must be valid'],
                            password: ['too short'],
                        },
                    },
                },
            });

            const result = handleApiError(error);

            expect(result.message).toBe('Validation failed');
            expect(result.statusCode).toBe(422);
            expect(result.errors).toContain('email: is required');
            expect(result.errors).toContain('email: must be valid');
            expect(result.errors).toContain('password: too short');
        });

        it('should handle network errors', () => {
            const error = createAxiosError({
                code: 'ERR_NETWORK',
                message: 'Network Error',
            });

            const result = handleApiError(error);

            expect(result.message).toBe('Network error. Please check your connection.');
            expect(result.statusCode).toBe(0);
        });

        it('should handle timeout errors', () => {
            const error = createAxiosError({
                code: 'ECONNABORTED',
                message: 'timeout',
            });

            const result = handleApiError(error);

            expect(result.message).toBe('Request timeout. Please try again.');
            expect(result.statusCode).toBe(408);
        });

        it('should handle generic Error', () => {
            const error = new Error('Generic error');
            const result = handleApiError(error);

            expect(result.message).toBe('Generic error');
        });

        it('should handle unknown error types', () => {
            const error = 'String error';
            const result = handleApiError(error);

            expect(result.message).toBe('An unexpected error occurred');
        });
    });

    describe('getErrorMessage', () => {
        it('should return main message when available', () => {
            const error = new ApiException('Invalid email or password', 401, []);
            const message = getErrorMessage(error);

            expect(message).toBe('Invalid email or password');
        });

        it('should return main message when errors is empty object', () => {
            const error = createAxiosError({
                response: {
                    status: 401,
                    data: {
                        success: false,
                        message: 'Invalid email or password',
                        errors: {},
                    },
                },
            });

            const message = getErrorMessage(error);
            expect(message).toBe('Invalid email or password');
        });

        it('should combine main message with errors array', () => {
            const error = createAxiosError({
                response: {
                    status: 422,
                    data: {
                        success: false,
                        message: 'Validation failed',
                        errors: ['Error 1', 'Error 2'],
                    },
                },
            });

            const message = getErrorMessage(error);
            expect(message).toBe('Validation failed. Error 1, Error 2');
        });

        it('should use errors array when main message is generic', () => {
            const error = createAxiosError({
                response: {
                    status: 422,
                    data: {
                        success: false,
                        message: 'An error occurred',
                        errors: ['Email is required'],
                    },
                },
            });

            const message = getErrorMessage(error);
            expect(message).toBe('Email is required');
        });
    });
});

