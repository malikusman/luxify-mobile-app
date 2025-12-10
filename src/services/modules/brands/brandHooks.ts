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
        staleTime: 10 * 60 * 1000, // 10 minutes
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
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

