import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { queryKeys } from '../../queryClient';
import { wardrobeItemsApi } from './wardrobeItemsApi';
import { WardrobeItem } from './wardrobeItemsTypes';
import { toastErrorFromException } from '@/src/utils/toast';

export const useWardrobeItems = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.wardrobeItems.list(),
        queryFn: async () => {
            const response = await wardrobeItemsApi.getWardrobeItems();
            return Array.isArray(response) ? response : [];
        },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useWardrobeItem = (id: string | null) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.wardrobeItems.detail(id!),
        queryFn: () => wardrobeItemsApi.getWardrobeItem(id!),
        enabled: isAuthenticated && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCreateWardrobeItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ imageUri, name, notes }: { imageUri: string; name?: string; notes?: string }) =>
            wardrobeItemsApi.createWardrobeItem(imageUri, name, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobeItems.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useBulkCreateWardrobeItems = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageUris: string[]) =>
            wardrobeItemsApi.bulkCreateWardrobeItems(imageUris),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobeItems.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useUpdateWardrobeItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ 
            id, 
            updates 
        }: { 
            id: string; 
            updates: { name?: string; notes?: string; tagIds?: string[] } 
        }) =>
            wardrobeItemsApi.updateWardrobeItem(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobeItems.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobeItems.detail(data.id) });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useDeleteWardrobeItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => wardrobeItemsApi.deleteWardrobeItem(id),
        onSuccess: (response, deletedId) => {
            // Invalidate queries to refresh the list
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobeItems.list() });
            // Also remove the specific item from cache
            queryClient.removeQueries({ queryKey: queryKeys.wardrobeItems.detail(deletedId) });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

