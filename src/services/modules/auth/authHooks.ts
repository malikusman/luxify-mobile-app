import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { store } from '@/src/context/store';
import { setCredentials, logout } from '@/src/context/slices/authSlice';
import { queryKeys } from '../../queryClient';
import { authApi } from './authApi';
import { AuthResponse } from './authTypes';

export const useSignIn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signIn,
        onSuccess: (data: AuthResponse) => {
            store.dispatch(
                setCredentials({
                    accessToken: data.token,
                    refreshToken: null as string | null,
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        name: `${data.user.first_name} ${data.user.last_name}`,
                    },
                })
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        },
    });
};

export const useSignUp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signUp,
        onSuccess: (data: AuthResponse) => {
            store.dispatch(
                setCredentials({
                    accessToken: data.token,
                    refreshToken: null as string | null,
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        name: `${data.user.first_name} ${data.user.last_name}`,
                    },
                })
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        },
    });
};

export const useSignOut = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signOut,
        onSuccess: () => {
            store.dispatch(logout());
            queryClient.clear();
        },
        onError: (error: any) => {
            // Clear local state even if API call fails
            // This handles cases like "No refresh token available" which is expected
            store.dispatch(logout());
            queryClient.clear();
            
            // Only log unexpected errors (not 401 which is expected when no token)
            const statusCode = error?.statusCode || error?.response?.status;
            if (statusCode !== 401) {
                console.error('Sign out error:', error);
            }
        },
    });
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: queryKeys.user.profile(),
        queryFn: authApi.getProfile,
        enabled: store.getState().auth?.isAuthenticated ?? false,
        staleTime: 5 * 60 * 1000,
    });
};

export const useLogin = useSignIn;
export const useRegister = useSignUp;
export const useLogout = useSignOut;

