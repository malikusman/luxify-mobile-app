import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { queryKeys } from '../../queryClient';
import { favoriteBrandApi } from './favoriteBrandApi';
import { FavoriteBrand } from './favoriteBrandTypes';

export const useFavoriteBrands = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.favoriteBrands.list(),
        queryFn: async () => {
            const response = await favoriteBrandApi.getFavoriteBrands();
            return Array.isArray(response) ? response : [];
        },
        enabled: isAuthenticated,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
};

export const useAddFavoriteBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (brandId: string) => favoriteBrandApi.addFavoriteBrand(brandId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.favoriteBrands.list() });
        },
    });
};

export const useRemoveFavoriteBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => favoriteBrandApi.removeFavoriteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.favoriteBrands.list() });
        },
    });
};

