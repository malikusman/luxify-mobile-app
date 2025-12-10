import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { store, RootState } from '@/src/context/store';
import { setCredentials, logout, setUserProfile } from '@/src/context/slices/authSlice';
import { queryKeys } from '../../queryClient';
import { authApi } from './authApi';
import { AuthResponse, OAuthProvider, OAuthRequest, ForgotPasswordRequest, VerifyResetCodeRequest, ResetPasswordRequest, UserProfile, UpdateUserRequest } from './authTypes';

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
            store.dispatch(logout());
            queryClient.clear();
            
            const statusCode = error?.statusCode || error?.response?.status;
            if (statusCode !== 401) {
                console.error('Sign out error:', error);
            }
        },
    });
};

export const useUserProfile = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    const queryResult = useQuery({
        queryKey: queryKeys.user.profile(),
        queryFn: authApi.getProfile,
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (queryResult.data) {
            store.dispatch(setUserProfile(queryResult.data));
            console.log('✅ User profile fetched and stored in Redux:');
            console.log(JSON.stringify(queryResult.data, null, 2));
        }
    }, [queryResult.data]);

    return queryResult;
};

export const useUserProfileSelector = (): UserProfile | null => {
    return useSelector((state: RootState) => state.auth?.userProfile ?? null);
};

export const useOAuth = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ provider, data }: { provider: OAuthProvider; data: OAuthRequest }) =>
            authApi.oauth(provider, data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                store.dispatch(
                    setCredentials({
                        accessToken: response.data.token,
                        refreshToken: null as string | null,
                        user: {
                            id: response.data.user.id,
                            email: response.data.user.email,
                            name: `${response.data.user.first_name} ${response.data.user.last_name}`,
                        },
                    })
                );
                queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
            }
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    });
};

export const useVerifyResetCode = () => {
    return useMutation({
        mutationFn: (data: VerifyResetCodeRequest) => authApi.verifyResetCode(data),
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateUserRequest) => authApi.updateUser(data),
        onSuccess: (response) => {
            if (response.data) {
                store.dispatch(setUserProfile(response.data));
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        },
    });
};

export const useLogin = useSignIn;
export const useRegister = useSignUp;
export const useLogout = useSignOut;

