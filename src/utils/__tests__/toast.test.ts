import { toastSuccess, toastError, toastWarning, toastInfo, toastErrorFromException, setToastContext } from '../toast';
import { handleApiError } from '../errorHandler';

describe('toast utilities', () => {
    const mockToastContext = {
        showToast: jest.fn(),
        showSuccess: jest.fn(),
        showError: jest.fn(),
        showWarning: jest.fn(),
        showInfo: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setToastContext(mockToastContext);
    });

    describe('toastSuccess', () => {
        it('should call showSuccess with message', () => {
            toastSuccess('Success message');
            expect(mockToastContext.showSuccess).toHaveBeenCalledWith('Success message', undefined);
        });

        it('should call showSuccess with custom duration', () => {
            toastSuccess('Success message', 5000);
            expect(mockToastContext.showSuccess).toHaveBeenCalledWith('Success message', 5000);
        });
    });

    describe('toastError', () => {
        it('should call showError with message', () => {
            toastError('Error message');
            expect(mockToastContext.showError).toHaveBeenCalledWith('Error message', undefined);
        });

        it('should call showError with custom duration', () => {
            toastError('Error message', 5000);
            expect(mockToastContext.showError).toHaveBeenCalledWith('Error message', 5000);
        });
    });

    describe('toastWarning', () => {
        it('should call showWarning with message', () => {
            toastWarning('Warning message');
            expect(mockToastContext.showWarning).toHaveBeenCalledWith('Warning message', undefined);
        });
    });

    describe('toastInfo', () => {
        it('should call showInfo with message', () => {
            toastInfo('Info message');
            expect(mockToastContext.showInfo).toHaveBeenCalledWith('Info message', undefined);
        });
    });

    describe('toastErrorFromException', () => {
        it('should extract and show error message from ApiException', () => {
            const { AxiosError } = require('axios');
            const error = Object.create(AxiosError.prototype);
            error.response = {
                status: 401,
                data: {
                    success: false,
                    message: 'Invalid email or password',
                    errors: {},
                },
            };
            error.isAxiosError = true;
            Object.setPrototypeOf(error, AxiosError.prototype);

            toastErrorFromException(error);
            expect(mockToastContext.showError).toHaveBeenCalled();
            const callArgs = mockToastContext.showError.mock.calls[0];
            expect(callArgs[0]).toBe('Invalid email or password');
        });

        it('should handle errors with errors array', () => {
            const error = {
                response: {
                    status: 422,
                    data: {
                        success: false,
                        message: 'Validation failed',
                        errors: ['Email is required'],
                    },
                },
            };

            toastErrorFromException(error);
            expect(mockToastContext.showError).toHaveBeenCalled();
        });

        it('should use custom duration when provided', () => {
            const error = new Error('Test error');
            toastErrorFromException(error, 6000);
            expect(mockToastContext.showError).toHaveBeenCalledWith(expect.any(String), 6000);
        });
    });
});

