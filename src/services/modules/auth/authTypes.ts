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
    role: string;
    created_at: string;
}

export interface AuthResponse {
    user: UserProfile;
    token: string;
}

