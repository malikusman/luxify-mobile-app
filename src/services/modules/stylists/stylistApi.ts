import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import { Stylist, StylistsResponse, StylistResponse, MyStylistResponse, SelectStylistResponse, DeselectStylistResponse } from './stylistTypes';

export const stylistApi = {
    getAllStylists: async (): Promise<Stylist[]> => {
        return await apiClient.get<Stylist[]>(API_ENDPOINTS.STYLISTS.ALL);
    },

    getStylist: async (id: string): Promise<Stylist> => {
        return await apiClient.get<Stylist>(API_ENDPOINTS.STYLISTS.GET(id));
    },

    getMyStylist: async (): Promise<Stylist | null> => {
        const response = await apiClient.get<MyStylistResponse['data']>(API_ENDPOINTS.STYLISTS.MY_STYLIST);
        // Response structure: { user_stylist: {...}, stylist: {...} }
        // We need to extract the stylist object
        if (response && typeof response === 'object' && 'stylist' in response) {
            return (response as any).stylist || null;
        }
        return null;
    },

    selectStylist: async (stylistId: string): Promise<Stylist> => {
        return await apiClient.post<Stylist>(
            API_ENDPOINTS.STYLISTS.SELECT(stylistId)
        );
    },

    deselectStylist: async (): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.STYLISTS.MY_STYLIST);
    },
};

