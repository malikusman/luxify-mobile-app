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
        VERIFY_EMAIL: '/auth/verify_email',
    },
    USER: {
        ME: '/users/me',
        UPDATE: '/users/me',
    },
    BRANDS: {
        ALL: '/brands',
        SEARCH: '/brands/search',
    },
    FAVORITE_BRANDS: {
        ALL: '/favorite_brands',
        DELETE: (id: string) => `/favorite_brands/${id}`,
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
    STYLISTS: {
        ALL: '/stylists',
        GET: (id: string) => `/stylists/${id}`,
        SELECT: (id: string) => `/stylists/${id}/select`,
        MY_STYLIST: '/my_stylist',
    },
    CONVERSATIONS: {
        ALL: '/conversations',
        GET: (id: string) => `/conversations/${id}`,
        CREATE: '/conversations',
        MESSAGES: (id: string) => `/conversations/${id}/messages`,
        SEND_MESSAGE: (id: string) => `/conversations/${id}/messages`,
    },
    STYLE_PHOTOS: {
        ALL: '/style_photos',
        GET: (id: string) => `/style_photos/${id}`,
        UPDATE: (id: string) => `/style_photos/${id}`,
        DELETE: (id: string) => `/style_photos/${id}`,
        BULK_UPLOAD: '/style_photos/bulk_upload',
    },
    WARDROBE_ITEMS: {
        ALL: '/wardrobe_items',
        GET: (id: string) => `/wardrobe_items/${id}`,
        UPDATE: (id: string) => `/wardrobe_items/${id}`,
        DELETE: (id: string) => `/wardrobe_items/${id}`,
    },
    OPTIONS: {
        OCCASIONS: '/options/occasions',
        OCCUPATIONS: '/options/occupations',
        QUESTIONNAIRE: '/options/questionnaire',
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

