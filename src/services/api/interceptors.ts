import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '@/src/constants/api';
import { store, RootState } from '@/src/context/store';
import { setAccessToken, setRefreshToken, clearAuth } from '@/src/context/slices/authSlice';
import { handleApiError, ApiException } from '@/src/utils/errorHandler';
import { ApiResponse, ApiErrorResponse, RefreshTokenResponse } from './types';

export class InterceptorManager {
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (error?: any) => void;
    }> = [];

    setupRequestInterceptor(axiosInstance: any) {
        axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const state: RootState = store.getState();
                const accessToken = state.auth?.accessToken;

                if (accessToken && config.headers) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }

                const isFormData = config.data instanceof FormData;
                if (isFormData) {
                    if (!config.headers) {
                        config.headers = {} as any;
                    }
                    
                    delete config.headers['Content-Type'];
                    delete config.headers['content-type'];
                    
                    if (!config.headers['Accept']) {
                        config.headers['Accept'] = 'application/json';
                    }
                }


                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );
    }

    setupResponseInterceptor(axiosInstance: any) {
        axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                const responseData = response.data;
                
                if (responseData && typeof responseData === 'object' && 'success' in responseData) {
                    if (responseData.success === false) {
                        const errorResponse = responseData as ApiErrorResponse;
                        let errorsArray: string[] = [];
                        if (errorResponse.errors) {
                            if (Array.isArray(errorResponse.errors)) {
                                errorsArray = errorResponse.errors;
                            } else if (typeof errorResponse.errors === 'object') {
                                const entries = Object.entries(errorResponse.errors);
                                if (entries.length > 0) {
                                    errorsArray = entries.flatMap(([field, messages]) => {
                                        if (Array.isArray(messages)) {
                                            return messages.map((msg: string) => `${field}: ${msg}`);
                                        }
                                        return [`${field}: ${messages}`];
                                    });
                                }
                            }
                        }
                        const error = new ApiException(
                            errorResponse.message || 'Request failed',
                            response.status,
                            errorsArray
                        );
                        return Promise.reject(error);
                    }
                    
                    if ('data' in responseData && responseData.data !== undefined && responseData.data !== null) {
                        response.data = responseData.data;
                    } else {
                        const { success, message, ...rest } = responseData;
                        response.data = rest;
                    }
                }
                
                return response;
            },
            async (error: any) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                };

                // List of public endpoints that don't require authentication
                // These endpoints should not trigger token refresh on 401 errors
                const publicEndpoints = [
                    API_ENDPOINTS.AUTH.SIGN_IN,
                    API_ENDPOINTS.AUTH.SIGN_UP,
                    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
                    API_ENDPOINTS.AUTH.VERIFY_RESET_CODE,
                    API_ENDPOINTS.AUTH.VERIFY_EMAIL,
                    API_ENDPOINTS.AUTH.RESET_PASSWORD,
                    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
                ];

                // Check if the request URL is a public endpoint
                const isPublicEndpoint = publicEndpoints.some(endpoint => 
                    originalRequest.url?.includes(endpoint)
                );

                if (
                    error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
                    !originalRequest._retry &&
                    !isPublicEndpoint
                ) {
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then((token) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                }
                                return axiosInstance(originalRequest);
                            })
                            .catch((err: any) => {
                                return Promise.reject(err);
                            });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newToken = await this.refreshAccessToken();
                        this.processQueue(null, newToken);

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }

                        return axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        this.handleRefreshFailure();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                const apiError = handleApiError(error);
                
                let errorMessage = apiError.message;
                let errorDetails: string[] = apiError.errors || [];
                
                if (error.response?.data) {
                    const responseData = error.response.data;
                    
                    if (responseData.data && responseData.data.message) {
                        errorMessage = responseData.data.message;
                        if (responseData.data.errors) {
                            if (Array.isArray(responseData.data.errors)) {
                                errorDetails = responseData.data.errors;
                            } else if (typeof responseData.data.errors === 'object') {
                                errorDetails = Object.entries(responseData.data.errors)
                                    .flatMap(([field, messages]) => {
                                        if (Array.isArray(messages)) {
                                            return messages.map((msg: string) => `${field}: ${msg}`);
                                        }
                                        return [`${field}: ${messages}`];
                                    });
                            }
                        }
                    } else if (responseData.message) {
                        errorMessage = responseData.message;
                        if (responseData.errors) {
                            if (Array.isArray(responseData.errors)) {
                                errorDetails = responseData.errors;
                            } else if (typeof responseData.errors === 'object') {
                                errorDetails = Object.entries(responseData.errors)
                                    .flatMap(([field, messages]) => {
                                        if (Array.isArray(messages)) {
                                            return messages.map((msg: string) => `${field}: ${msg}`);
                                        }
                                        return [`${field}: ${messages}`];
                                    });
                            }
                        }
                    }
                }
                
                return Promise.reject(new ApiException(
                    errorMessage,
                    apiError.statusCode,
                    errorDetails,
                    apiError.code
                ));
            }
        );
    }

    private async refreshAccessToken(): Promise<string> {
        const state: RootState = store.getState();
        const refreshToken = state.auth?.refreshToken;

        if (!refreshToken) {
            throw new ApiException('No refresh token available', HTTP_STATUS.UNAUTHORIZED);
        }

        try {
            const response = await axios.post<ApiResponse<RefreshTokenResponse> | RefreshTokenResponse>(
                `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                { refreshToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const responseData = response.data;
            let tokenData: RefreshTokenResponse;
            
            if (responseData && typeof responseData === 'object' && 'success' in responseData) {
                const apiResponse = responseData as ApiResponse<RefreshTokenResponse>;
                if (apiResponse.success && apiResponse.data) {
                    tokenData = apiResponse.data;
                } else {
                    throw new ApiException('Invalid refresh token response', HTTP_STATUS.UNAUTHORIZED);
                }
            } else {
                tokenData = responseData as RefreshTokenResponse;
            }
            
            const { accessToken, refreshToken: newRefreshToken } = tokenData;

            store.dispatch(setAccessToken(accessToken));
            if (newRefreshToken) {
                store.dispatch(setRefreshToken(newRefreshToken));
            }

            return accessToken;
        } catch (error) {
            const apiError = handleApiError(error);
            throw new ApiException(
                apiError.message || 'Failed to refresh token',
                apiError.statusCode || HTTP_STATUS.UNAUTHORIZED
            );
        }
    }

    private processQueue(error: any, token: string | null): void {
        this.failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });

        this.failedQueue = [];
    }

    private handleRefreshFailure(): void {
        store.dispatch(clearAuth());
    }
}

