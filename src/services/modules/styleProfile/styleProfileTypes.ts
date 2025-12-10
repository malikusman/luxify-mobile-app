export interface StyleProfile {
    id: string;
    user_id: string;
    gender?: string | null;
    occupation?: string | null;
    occasions?: string[] | null;
    budget_range?: string | null;
    location?: string | null;
    body_type?: string | null;
    favorite_colors?: string[] | null;
    style_preferences?: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export interface CreateStyleProfileRequest {
    gender?: string;
    occasions?: string[];
    budget_range?: string;
    location?: string;
    body_type?: string;
    occupation?: string;
    favorite_colors?: string[];
    style_preferences?: Record<string, any>;
}

export interface CreateStyleProfileResponse {
    success: boolean;
    message: string;
    data: StyleProfile;
}

export interface UpdateStyleProfileRequest {
    gender?: string;
    occasions?: string[];
    budget_range?: string;
    location?: string;
    body_type?: string;
    occupation?: string;
    favorite_colors?: string[];
    style_preferences?: Record<string, any>;
}

export interface UpdateStyleProfileResponse {
    success: boolean;
    message: string;
    data: StyleProfile;
}

