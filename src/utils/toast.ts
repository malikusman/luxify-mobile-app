import { getErrorMessage, handleApiError } from './errorHandler';
import { ApiError } from '@/src/services';

/**
 * Centralized toast utility functions
 * These can be used outside of React components
 */

let toastContext: {
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
} | null = null;

/**
 * Initialize toast context (called from ToastProvider)
 * @internal
 */
export const setToastContext = (context: typeof toastContext) => {
    toastContext = context;
};

/**
 * Show a success toast
 */
export const toastSuccess = (message: string, duration?: number) => {
    toastContext?.showSuccess(message, duration);
};

/**
 * Show an error toast
 */
export const toastError = (message: string, duration?: number) => {
    toastContext?.showError(message, duration);
};

/**
 * Show a warning toast
 */
export const toastWarning = (message: string, duration?: number) => {
    toastContext?.showWarning(message, duration);
};

/**
 * Show an info toast
 */
export const toastInfo = (message: string, duration?: number) => {
    toastContext?.showInfo(message, duration);
};

/**
 * Formats error message from API error object
 * Includes field-specific errors when available
 */
const formatApiErrorMessage = (apiError: ApiError): string => {
    // Start with main message
    let message = apiError.message || 'An error occurred';
    
    // Append field-specific errors if available
    if (apiError.errors && apiError.errors.length > 0) {
        const fieldErrors = apiError.errors
            .filter((err) => err && err.trim() !== '')
            .map((err) => err.trim());
        
        if (fieldErrors.length > 0) {
            // If main message is generic, replace it with first error
            if (message === 'An error occurred' || message === 'An unexpected error occurred') {
                message = fieldErrors[0];
            } else {
                // Otherwise, append additional errors
                const additionalErrors = fieldErrors.length > 1 
                    ? fieldErrors.slice(1).join(', ')
                    : '';
                if (additionalErrors) {
                    message = `${message}. ${additionalErrors}`;
                }
            }
        }
    }
    
    return message;
};

/**
 * Show error toast from an error object
 * Automatically extracts and formats error message from API response
 * Handles both simple messages and field-specific validation errors
 */
export const toastErrorFromException = (error: unknown, duration?: number) => {
    const apiError = handleApiError(error);
    const formattedMessage = formatApiErrorMessage(apiError);
    toastError(formattedMessage, duration);
};

