import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    return apiUrl;
};

export const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        SIGN_UP: '/auth/sign_up',
        SIGN_IN: '/auth/sign_in',
        SIGN_OUT: '/auth/sign_out',
        REFRESH_TOKEN: '/auth/refresh',
        OAUTH: '/auth/oauth',
        FORGOT_PASSWORD: '/auth/forgot_password',
        VERIFY_RESET_CODE: '/auth/verify_reset_code',
        RESET_PASSWORD: '/auth/reset_password',
    },
    USER: {
        ME: '/users/me',
        UPDATE: '/users/me',
    },
    BRANDS: {
        ALL: '/brands',
        SEARCH: '/brands/search',
    },
    SOCIAL_MEDIA: {
        FETCH_PHOTOS: '/social_media/photos',
        SAVE_PHOTOS: '/social_media/photos/save',
    },
    STYLE_PROFILE: {
        GET: '/style_profile',
        CREATE: '/style_profile',
        UPDATE: '/style_profile',
    },
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

