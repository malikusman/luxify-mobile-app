import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';

interface OptionsResponse {
    occasions?: string[];
    occupations?: string[];
}

export const optionsApi = {
    getOccasions: async (): Promise<string[]> => {
        const response = await apiClient.get<OptionsResponse>(API_ENDPOINTS.OPTIONS.OCCASIONS);
        return Array.isArray(response?.occasions) ? response.occasions : [];
    },

    getOccupations: async (): Promise<string[]> => {
        const response = await apiClient.get<OptionsResponse>(API_ENDPOINTS.OPTIONS.OCCUPATIONS);
        return Array.isArray(response?.occupations) ? response.occupations : [];
    },
};

