import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { SignInCredentials, SignUpData, UserProfile, AuthResponse, OAuthProvider, OAuthRequest, OAuthResponse, ForgotPasswordRequest, ForgotPasswordResponse, VerifyResetCodeRequest, VerifyResetCodeResponse, VerifyEmailRequest, VerifyEmailResponse, ResetPasswordRequest, ResetPasswordResponse, UpdateUserRequest, UpdateUserResponse } from './authTypes';

export const authApi = {
    signUp: async (data: SignUpData): Promise<AuthResponse> => {
        return await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.SIGN_UP,
            { user: data }
        );
    },

    signIn: async (credentials: SignInCredentials): Promise<AuthResponse> => {
        return await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.SIGN_IN,
            { user: credentials }
        );
    },

    signOut: async (): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.AUTH.SIGN_OUT);
    },

    oauth: async (provider: OAuthProvider, data: OAuthRequest): Promise<OAuthResponse> => {
        return await apiClient.post<OAuthResponse>(
            `${API_ENDPOINTS.AUTH.OAUTH}/${provider}`,
            data
        );
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
        return await apiClient.post<ForgotPasswordResponse>(
            API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
            data
        );
    },

    verifyResetCode: async (data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> => {
        return await apiClient.post<VerifyResetCodeResponse>(
            API_ENDPOINTS.AUTH.VERIFY_RESET_CODE,
            data
        );
    },

    verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
        return await apiClient.post<VerifyEmailResponse>(
            API_ENDPOINTS.AUTH.VERIFY_EMAIL,
            data
        );
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
        return await apiClient.post<ResetPasswordResponse>(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            data
        );
    },

    getProfile: async (): Promise<UserProfile> => {
        return await apiClient.get<UserProfile>(API_ENDPOINTS.USER.ME);
    },

    updateUser: async (data: UpdateUserRequest): Promise<UpdateUserResponse> => {
        return await apiClient.patch<UpdateUserResponse>(
            API_ENDPOINTS.USER.UPDATE,
            { user: data }
        );
    },
};

