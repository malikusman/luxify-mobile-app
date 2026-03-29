import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { StyleProfile, CreateStyleProfileRequest, CreateStyleProfileResponse, UpdateStyleProfileRequest, UpdateStyleProfileResponse } from './styleProfileTypes';

export const styleProfileApi = {
    getStyleProfile: async (): Promise<StyleProfile> => {
        return await apiClient.get<StyleProfile>(API_ENDPOINTS.STYLE_PROFILE.GET);
    },

    createStyleProfile: async (data: CreateStyleProfileRequest): Promise<CreateStyleProfileResponse> => {
        return await apiClient.post<CreateStyleProfileResponse>(
            API_ENDPOINTS.STYLE_PROFILE.CREATE,
            { style_profile: data }
        );
    },

    updateStyleProfile: async (data: UpdateStyleProfileRequest): Promise<UpdateStyleProfileResponse> => {
        return await apiClient.patch<UpdateStyleProfileResponse>(
            API_ENDPOINTS.STYLE_PROFILE.UPDATE,
            { style_profile: data }
        );
    },
};

