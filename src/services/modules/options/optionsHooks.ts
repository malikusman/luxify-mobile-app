import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../queryClient';
import { optionsApi } from './optionsApi';

export const useOccasions = () => {
    return useQuery({
        queryKey: queryKeys.options.occasions(),
        queryFn: async () => {
            const response = await optionsApi.getOccasions();
            return Array.isArray(response) ? response : [];
        },
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

export const useOccupations = () => {
    return useQuery({
        queryKey: queryKeys.options.occupations(),
        queryFn: async () => {
            const response = await optionsApi.getOccupations();
            return Array.isArray(response) ? response : [];
        },
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

