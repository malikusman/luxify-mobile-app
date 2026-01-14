import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { FavoriteBrand, AddFavoriteBrandRequest } from './favoriteBrandTypes';

export const favoriteBrandApi = {
    // The response interceptor extracts the data field, so this returns FavoriteBrand[] directly
    getFavoriteBrands: async (): Promise<FavoriteBrand[]> => {
        return await apiClient.get<FavoriteBrand[]>(API_ENDPOINTS.FAVORITE_BRANDS.ALL);
    },

    // Add a favorite brand
    addFavoriteBrand: async (brandId: string): Promise<FavoriteBrand> => {
        const requestBody: AddFavoriteBrandRequest = {
            favorite_brand: {
                brand_id: brandId,
            },
        };
        return await apiClient.post<FavoriteBrand>(API_ENDPOINTS.FAVORITE_BRANDS.ALL, requestBody);
    },

    // Remove a favorite brand
    removeFavoriteBrand: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.FAVORITE_BRANDS.DELETE(id));
    },
};

