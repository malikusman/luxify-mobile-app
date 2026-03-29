export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: string[];
    code?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

