import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { store, RootState } from '@/src/context/store';
import { setCredentials, logout, setUserProfile } from '@/src/context/slices/authSlice';
import { queryKeys } from '../../queryClient';
import { authApi } from './authApi';
import { AuthResponse, OAuthProvider, OAuthRequest, ForgotPasswordRequest, VerifyResetCodeRequest, VerifyEmailRequest, ResetPasswordRequest, UserProfile, UpdateUserRequest } from './authTypes';

export const useSignIn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signIn,
        onSuccess: (response: AuthResponse | any) => {
            const user = response?.user || (response as any)?.data?.user;
            const token = response?.token || (response as any)?.data?.token;
            const has_style_profile = response?.has_style_profile ?? (response as any)?.data?.has_style_profile ?? user?.has_style_profile ?? false;
            
            if (token && user) {
                store.dispatch(
                    setCredentials({
                        accessToken: token,
                        refreshToken: null as string | null,
                        user: {
                            id: user.id,
                            email: user.email,
                            name: `${user.first_name} ${user.last_name}`,
                        },
                        has_style_profile: has_style_profile,
                    })
                );
                
                if (user && typeof user === 'object' && 'id' in user) {
                    store.dispatch(setUserProfile(user as UserProfile));
                }
                
                queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
            }
        },
    });
};

export const useSignUp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signUp,
        onSuccess: (data: AuthResponse) => {
            try {
                // Only set credentials if token is present (email is confirmed)
                // If email is not confirmed, token will be undefined
                if (data.token && data.user) {
                    store.dispatch(
                        setCredentials({
                            accessToken: data.token,
                            refreshToken: null as string | null,
                            user: {
                                id: data.user.id,
                                email: data.user.email,
                                name: `${data.user.first_name} ${data.user.last_name}`,
                            },
                            has_style_profile: data.has_style_profile ?? data.user.has_style_profile ?? false,
                        })
                    );
                    queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
                }
                // If no token, user needs to verify email first - don't set credentials
                // This is expected behavior when email_confirmed is false
            } catch (error) {
                // Log error but don't throw - allow mutation to complete successfully
                // The component will handle the redirect regardless
                console.warn('Error in signup onSuccess callback:', error);
            }
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
                const user = response.data.user;
                const token = response.data.token;
                
                store.dispatch(
                    setCredentials({
                        accessToken: token,
                        refreshToken: null as string | null,
                        user: {
                            id: user.id,
                            email: user.email,
                            name: `${user.first_name} ${user.last_name}`,
                        },
                        has_style_profile: response.data.has_style_profile ?? false,
                    })
                );
                
                if (user && token) {
                    const userProfile: UserProfile = {
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone_number: null,
                        avatar_url: null,
                        role: 'user',
                        created_at: new Date().toISOString(),
                        has_style_profile: response.data.has_style_profile ?? false,
                    };
                    
                    store.dispatch(setUserProfile(userProfile));
                }
                
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

export const useVerifyEmail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: VerifyEmailRequest) => authApi.verifyEmail(data),
        onSuccess: (response) => {
            try {
                // After interceptor extracts data, response structure is: { user, token, message }
                // Check both direct properties and nested data
                const token = response?.token || (response as any)?.data?.token;
                const user = response?.user || (response as any)?.data?.user;
                const has_style_profile = response?.has_style_profile ?? (response as any)?.data?.has_style_profile ?? user?.has_style_profile ?? false;
                
                if (token && user) {
                    store.dispatch(
                        setCredentials({
                            accessToken: token,
                            refreshToken: null as string | null,
                            user: {
                                id: user.id,
                                email: user.email,
                                name: `${user.first_name} ${user.last_name}`,
                            },
                            has_style_profile: has_style_profile,
                        })
                    );
                    
                    if (user && typeof user === 'object' && 'id' in user) {
                        store.dispatch(setUserProfile(user as UserProfile));
                    }
                    
                    queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
                }
            } catch (error) {
                console.error('Error in useVerifyEmail onSuccess:', error);
            }
        },
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

