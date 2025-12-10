export interface SignInCredentials {
    email: string;
    password: string;
}

export interface SignUpData {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
}

export interface UserProfile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
}

export interface AuthResponse {
    user: UserProfile;
    token: string;
}

export type OAuthProvider = 'google' | 'facebook';

export interface OAuthData {
    provider_uid: string;
    email: string;
    first_name: string;
    last_name: string;
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_at: string;
}

export interface OAuthRequest {
    oauth: OAuthData;
}

export interface OAuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        token: string;
    };
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface VerifyResetCodeRequest {
    email: string;
    code: string;
}

export interface VerifyResetCodeResponse {
    success: boolean;
    message: string;
    reset_password_token?: string;
}

export interface ResetPasswordRequest {
    reset_password_token: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

export interface UpdateUserRequest {
    first_name?: string;
    last_name?: string;
    phone_number?: string | null;
    avatar_url?: string | null;
}

export interface UpdateUserResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

