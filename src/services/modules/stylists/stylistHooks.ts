import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/context/store';
import { queryKeys } from '../../queryClient';
import { stylistApi } from './stylistApi';
import { Stylist } from './stylistTypes';
import { toastErrorFromException } from '@/src/utils/toast';

export const useStylists = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.stylists.list(),
        queryFn: async () => {
            const response = await stylistApi.getAllStylists();
            // The interceptor already extracts the data field, so response is already Stylist[]
            return Array.isArray(response) ? response : [];
        },
        enabled: isAuthenticated,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useStylist = (id: string) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.stylists.detail(id),
        queryFn: () => stylistApi.getStylist(id),
        enabled: isAuthenticated && !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useMyStylist = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated ?? false);
    
    return useQuery({
        queryKey: queryKeys.stylists.myStylist(),
        queryFn: async () => {
            const response = await stylistApi.getMyStylist();
            // The interceptor already extracts the data field
            return response;
        },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useSelectStylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (stylistId: string) => stylistApi.selectStylist(stylistId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stylists.myStylist() });
            queryClient.invalidateQueries({ queryKey: queryKeys.stylists.list() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

export const useDeselectStylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => stylistApi.deselectStylist(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.stylists.myStylist() });
        },
        onError: (error) => {
            toastErrorFromException(error);
        },
    });
};

