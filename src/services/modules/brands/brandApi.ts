import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { Brand } from './brandTypes';

export const brandApi = {
    // The response interceptor extracts the data field, so this returns Brand[] directly
    getAllBrands: async (): Promise<Brand[]> => {
        return await apiClient.get<Brand[]>(API_ENDPOINTS.BRANDS.ALL);
    },

    // The response interceptor extracts the data field, so this returns Brand[] directly
    searchBrands: async (query: string): Promise<Brand[]> => {
        return await apiClient.get<Brand[]>(
            API_ENDPOINTS.BRANDS.SEARCH,
            {
                params: {
                    q: query,
                },
            }
        );
    },
};

