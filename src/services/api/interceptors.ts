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
                        // Convert errors to array format if it's an object
                        let errorsArray: string[] = [];
                        if (errorResponse.errors) {
                            if (Array.isArray(errorResponse.errors)) {
                                errorsArray = errorResponse.errors;
                            } else if (typeof errorResponse.errors === 'object') {
                                // Handle empty object {} or object with field errors
                                const entries = Object.entries(errorResponse.errors);
                                if (entries.length > 0) {
                                    errorsArray = entries.flatMap(([field, messages]) => {
                                        if (Array.isArray(messages)) {
                                            return messages.map((msg: string) => `${field}: ${msg}`);
                                        }
                                        return [`${field}: ${messages}`];
                                    });
                                }
                                // If errors is empty {}, errorsArray stays empty
                            }
                        }
                        const error = new ApiException(
                            errorResponse.message || 'Request failed',
                            response.status,
                            errorsArray
                        );
                        return Promise.reject(error);
                    }
                    
                    response.data = responseData.data;
                }
                
                return response;
            },
            async (error: any) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                };

                if (
                    error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
                    !originalRequest._retry &&
                    originalRequest.url !== API_ENDPOINTS.AUTH.REFRESH_TOKEN
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
                
                // Extract detailed error information from response
                let errorMessage = apiError.message;
                let errorDetails: string[] = apiError.errors || [];
                
                // If response has error data, extract it
                if (error.response?.data) {
                    const responseData = error.response.data;
                    
                    // Handle nested error structures
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

