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
    /** Questionnaire preference fields (top-level per API; also may be in style_preferences for legacy) */
    location_preference?: string[] | null;
    lifestyle_preference?: string[] | null;
    color_preference?: string[] | null;
    body_areas_to_highlight?: string[] | null;
    style_identity?: string[] | null;
    comfort_preference?: string[] | null;
    style_inspiration?: string[] | null;
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
    location_preference?: string[];
    lifestyle_preference?: string[];
    color_preference?: string[];
    body_areas_to_highlight?: string[];
    style_identity?: string[];
    comfort_preference?: string[];
    style_inspiration?: string[];
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
    location_preference?: string[];
    lifestyle_preference?: string[];
    color_preference?: string[];
    body_areas_to_highlight?: string[];
    style_identity?: string[];
    comfort_preference?: string[];
    style_inspiration?: string[];
    style_preferences?: Record<string, any>;
}

export interface UpdateStyleProfileResponse {
    success: boolean;
    message: string;
    data: StyleProfile;
}

