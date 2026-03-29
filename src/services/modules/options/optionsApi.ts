import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import type { QuestionnaireResponse } from './questionnaireTypes';

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

    getQuestionnaire: async (gender?: 'female' | 'male'): Promise<QuestionnaireResponse> => {
        const config =
            gender && (gender === 'female' || gender === 'male')
                ? { params: { gender } }
                : undefined;
        return await apiClient.get<QuestionnaireResponse>(
            API_ENDPOINTS.OPTIONS.QUESTIONNAIRE,
            config
        );
    },
};

