import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../queryClient';
import { brandApi } from './brandApi';
import { Brand } from './brandTypes';

export const useBrands = () => {
    return useQuery({
        queryKey: queryKeys.brands.list(),
        queryFn: async () => {
            const response = await brandApi.getAllBrands();
            // The interceptor already extracts the data field, so response is already Brand[]
            return Array.isArray(response) ? response : [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - data is considered fresh for 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
        refetchOnMount: false, // Don't refetch on mount if data is fresh (respects staleTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus (already set globally, but explicit here)
        refetchOnReconnect: true, // Refetch when network reconnects (background update)
    });
};

export const useSearchBrands = (searchQuery: string) => {
    return useQuery({
        queryKey: queryKeys.brands.search(searchQuery),
        queryFn: async () => {
            const response = await brandApi.searchBrands(searchQuery);
            // The interceptor already extracts the data field, so response is already Brand[]
            return Array.isArray(response) ? response : [];
        },
        enabled: searchQuery.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes - keep search results in cache for 15 minutes
        refetchOnMount: false, // Don't refetch on mount if data is fresh (respects staleTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: true, // Refetch when network reconnects (background update)
    });
};

