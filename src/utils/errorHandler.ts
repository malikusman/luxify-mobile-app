import { AxiosError } from 'axios';
import { ApiError } from '@/src/services';
import { HTTP_STATUS } from '@/src/constants/api';

export class ApiException extends Error {
    statusCode?: number;
    errors?: string[];
    code?: string;

    constructor(message: string, statusCode?: number, errors?: string[], code?: string) {
        super(message);
        this.name = 'ApiException';
        this.statusCode = statusCode;
        this.errors = errors;
        this.code = code;
    }
}

export const handleApiError = (error: unknown): ApiError => {
    if (error instanceof ApiException) {
        return {
            message: error.message,
            statusCode: error.statusCode,
            errors: error.errors,
            code: error.code,
        };
    }

    if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const responseData = error.response?.data;

        if (responseData) {
            // Handle standard API error format: { success: false, message: "...", errors: {} or [...] }
            if (responseData.success === false) {
                // Extract errors array - could be array of strings, object with field errors, or empty object
                let errorsArray: string[] = [];
                
                if (responseData.errors) {
                    if (Array.isArray(responseData.errors)) {
                        // Errors is an array of strings
                        errorsArray = responseData.errors.filter((err: any) => err && String(err).trim() !== '');
                    } else if (typeof responseData.errors === 'object') {
                        // Errors is an object - could be empty {} or { field: ["error1", "error2"] }
                        const entries = Object.entries(responseData.errors);
                        if (entries.length > 0) {
                            // Handle validation errors in format: { field: ["error1", "error2"] }
                            errorsArray = entries.flatMap(([field, messages]) => {
                                if (Array.isArray(messages)) {
                                    return messages
                                        .filter((msg: any) => msg && String(msg).trim() !== '')
                                        .map((msg: string) => `${field}: ${msg}`);
                                }
                                if (messages && String(messages).trim() !== '') {
                                    return [`${field}: ${messages}`];
                                }
                                return [];
                            });
                        }
                        // If errors is empty object {}, errorsArray stays empty
                    }
                }

                return {
                    message: responseData.message || 'An error occurred',
                    statusCode,
                    errors: errorsArray,
                    code: responseData.code,
                };
            }
            
            // Handle other error formats
            // Check for nested error structure (some APIs return { data: { message: "...", errors: [...] } })
            if (responseData.data && typeof responseData.data === 'object') {
                const nestedData = responseData.data;
                if (nestedData.message || nestedData.errors) {
                    let errorsArray: string[] = [];
                    
                    if (Array.isArray(nestedData.errors)) {
                        errorsArray = nestedData.errors;
                    } else if (nestedData.errors && typeof nestedData.errors === 'object') {
                        errorsArray = Object.entries(nestedData.errors)
                            .flatMap(([field, messages]) => {
                                if (Array.isArray(messages)) {
                                    return messages.map((msg: string) => `${field}: ${msg}`);
                                }
                                return [`${field}: ${messages}`];
                            });
                    }

                    return {
                        message: nestedData.message || responseData.message || 'An error occurred',
                        statusCode,
                        errors: errorsArray,
                        code: nestedData.code || responseData.code,
                    };
                }
            }
            
            // Fallback to simple error format
            return {
                message: responseData.message || responseData.error || 'An error occurred',
                statusCode,
                errors: responseData.errors 
                    ? (Array.isArray(responseData.errors) 
                        ? responseData.errors 
                        : [String(responseData.errors)])
                    : (responseData.error ? [responseData.error] : []),
                code: responseData.code,
            };
        }

        if (error.code === 'ECONNABORTED') {
            return {
                message: 'Request timeout. Please try again.',
                statusCode: 408,
            };
        }

        if (error.code === 'ERR_NETWORK') {
            return {
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            };
        }

        return {
            message: error.message || 'An unexpected error occurred',
            statusCode,
            };
        }

    if (error instanceof Error) {
        return {
            message: error.message || 'An unexpected error occurred',
        };
    }

    return {
        message: 'An unexpected error occurred',
    };
};

/**
 * Formats error messages from API response
 * Handles both simple messages and field-specific validation errors
 * For format: { success: false, message: "...", errors: {} }
 */
const formatErrorMessage = (apiError: ApiError): string => {
    // Priority 1: Use main message if available and not generic
    if (apiError.message && 
        apiError.message !== 'An error occurred' && 
        apiError.message !== 'An unexpected error occurred') {
        
        // If there are additional field-specific errors, append them
        if (apiError.errors && apiError.errors.length > 0) {
            const additionalErrors = apiError.errors
                .filter((err) => err && String(err).trim() !== '')
                .join(', ');
            
            if (additionalErrors) {
                return `${apiError.message}. ${additionalErrors}`;
            }
        }
        
        // Return main message (this handles the case where errors: {})
        return apiError.message;
    }

    // Priority 2: If no main message but we have errors array, use those
    if (apiError.errors && apiError.errors.length > 0) {
        return apiError.errors
            .filter((err) => err && String(err).trim() !== '')
            .join(', ');
    }

    // Fallback to default message
    return apiError.message || 'An error occurred';
};

export const getErrorMessage = (error: unknown): string => {
    const apiError = handleApiError(error);
    return formatErrorMessage(apiError);
};

export const isNetworkError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return !error.response || error.code === 'ERR_NETWORK';
    }
    return false;
};

export const isTimeoutError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.code === 'ECONNABORTED';
    }
    return false;
};

export const isUnauthorizedError = (error: unknown): boolean => {
    const apiError = handleApiError(error);
    return apiError.statusCode === HTTP_STATUS.UNAUTHORIZED;
};

export const isForbiddenError = (error: unknown): boolean => {
    const apiError = handleApiError(error);
    return apiError.statusCode === HTTP_STATUS.FORBIDDEN;
};

export const isNotFoundError = (error: unknown): boolean => {
    const apiError = handleApiError(error);
    return apiError.statusCode === HTTP_STATUS.NOT_FOUND;
};

export const isServerError = (error: unknown): boolean => {
    const apiError = handleApiError(error);
    return apiError.statusCode !== undefined && apiError.statusCode >= 500;
};

