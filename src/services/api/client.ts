import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/src/constants/api';
import { InterceptorManager } from './interceptors';

class ApiClient {
    private axiosInstance: AxiosInstance;
    private interceptorManager: InterceptorManager;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.interceptorManager = new InterceptorManager();
        this.interceptorManager.setupRequestInterceptor(this.axiosInstance);
        this.interceptorManager.setupResponseInterceptor(this.axiosInstance);
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    async patch<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.axiosInstance.patch<T>(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }

    setBaseURL(baseURL: string): void {
        this.axiosInstance.defaults.baseURL = baseURL;
    }

    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

export const apiClient = new ApiClient();
export default apiClient;

