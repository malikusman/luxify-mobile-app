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
    has_style_profile?: boolean;
}

export interface AuthResponse {
    user: UserProfile;
    token?: string; // Optional - may not be present if email is not confirmed
    message?: string;
    email_confirmed?: boolean;
    has_style_profile?: boolean;
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
        has_style_profile?: boolean;
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
    // Actual API response structure
    valid?: boolean;
    data?: {
        valid?: boolean;
        reset_password_token?: string;
    };
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
    // After interceptor extracts data, response might be:
    valid?: boolean;
    token?: string;
    user?: UserProfile;
    has_style_profile?: boolean;
    data?: {
        valid?: boolean;
        token?: string;
        user?: UserProfile;
        has_style_profile?: boolean;
    };
}

export interface ResetPasswordRequest {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
    reset_password_token?: string; // Optional, some APIs might use email+code instead
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

