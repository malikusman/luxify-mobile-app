import { QueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/src/utils/errorHandler';
import { HTTP_STATUS } from '@/src/constants/api';
import { toastErrorFromException } from '@/src/utils/toast';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                const statusCode = error?.statusCode || error?.response?.status;
                if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 401) {
                    return false;
                }
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
        },
        mutations: {
            retry: false,
            onError: (error: any) => {
                const apiError = handleApiError(error);
                // Don't log expected errors (like 401 during sign out when no refresh token)
                const statusCode = apiError?.statusCode || (error as any)?.statusCode || (error as any)?.response?.status;
                const message = apiError?.message || (error as any)?.message || '';
                
                // Skip logging for expected sign out errors
                if (statusCode === 401 && message.includes('refresh token')) {
                    return;
                }
                
                // Show toast for user-facing errors
                if (statusCode && statusCode >= 500) {
                    // Server errors - show toast
                    toastErrorFromException(error);
                    console.error('Mutation error:', apiError);
                } else if (statusCode && statusCode < 500 && statusCode !== 401) {
                    // Client errors (except 401) - show toast
                    toastErrorFromException(error);
                    console.warn('Mutation error:', apiError);
                }
            },
        },
    },
});

export const queryKeys = {
    auth: {
        profile: ['auth', 'profile'] as const,
    },
    user: {
        all: ['user'] as const,
        profile: () => [...queryKeys.user.all, 'profile'] as const,
        preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    },
} as const;

