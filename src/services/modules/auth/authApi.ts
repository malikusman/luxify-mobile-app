import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { SignInCredentials, SignUpData, UserProfile, AuthResponse } from './authTypes';

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
};

