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
        REFRESH_TOKEN: '/auth/refresh'
    },
    USER: {
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

