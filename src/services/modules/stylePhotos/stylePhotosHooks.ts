import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { queryKeys } from '../../queryClient';
import { stylePhotosApi } from './stylePhotosApi';
import { StylePhoto } from './stylePhotosTypes';
import { toastErrorFromException } from '@/src/utils/toast';

export const useStylePhotos = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.stylePhotos.list(),
        queryFn: async () => {
            const response = await stylePhotosApi.getStylePhotos();
            return Array.isArray(response) ? response : [];
        },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUploadStylePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageUri: string) => stylePhotosApi.uploadStylePhoto(imageUri),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stylePhotos.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useBulkUploadStylePhotos = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageUris: string[]) => stylePhotosApi.bulkUploadStylePhotos(imageUris),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stylePhotos.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useUpdateStylePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, position }: { id: string; position: number }) =>
            stylePhotosApi.updateStylePhoto(id, position),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stylePhotos.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useDeleteStylePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => stylePhotosApi.deleteStylePhoto(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stylePhotos.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

